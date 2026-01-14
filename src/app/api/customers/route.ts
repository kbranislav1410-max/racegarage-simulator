import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { customerSchema } from "@/lib/validations/customer";

// GET /api/customers - List customers with pagination and search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { street: { contains: search, mode: "insensitive" as const } },
            { city: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get total count
    const total = await prisma.customer.count({ where });

    // Get customers
    const customers = await prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        street: true,
        city: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = customerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 409 }
      );
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        street: data.street || null,
        city: data.city || null,
        phone: data.phone || null,
      },
    });

    // Create audit log
    // Note: In a real app, get userId from authenticated session
    // For now, we'll skip the audit log or use a system user
    try {
      const systemUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });

      if (systemUser) {
        await prisma.auditLog.create({
          data: {
            userId: systemUser.id,
            action: "CREATE",
            entity: "Customer",
            entityId: customer.id,
            payload: {
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
            },
          },
        });
      }
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Don't fail the request if audit log fails
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
