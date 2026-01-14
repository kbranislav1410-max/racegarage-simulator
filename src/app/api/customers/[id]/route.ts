import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { customerUpdateSchema } from "@/lib/validations/customer";

// GET /api/customers/[id] - Get customer with ride history and summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        rideSessions: {
          orderBy: { startAt: "desc" },
          take: 10,
          select: {
            id: true,
            startAt: true,
            endAt: true,
            minutes: true,
            source: true,
            notes: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate summary
    const summary = await prisma.rideSession.aggregate({
      where: { customerId: id },
      _count: { id: true },
      _sum: { minutes: true },
    });

    const lastRide = await prisma.rideSession.findFirst({
      where: { customerId: id },
      orderBy: { startAt: "desc" },
      select: { startAt: true },
    });

    return NextResponse.json({
      customer,
      summary: {
        totalRides: summary._count.id,
        totalMinutes: summary._sum.minutes || 0,
        lastRide: lastRide?.startAt || null,
      },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = customerUpdateSchema.safeParse(body);
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

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // If email is being updated, check if it's already taken by another customer
    if (data.email && data.email !== existingCustomer.email) {
      const emailTaken = await prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "Email already in use by another customer" },
          { status: 409 }
        );
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.street !== undefined && { street: data.street || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
      },
    });

    // Create audit log
    try {
      const systemUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });

      if (systemUser) {
        await prisma.auditLog.create({
          data: {
            userId: systemUser.id,
            action: "UPDATE",
            entity: "Customer",
            entityId: customer.id,
            payload: data,
          },
        });
      }
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Delete customer (cascade will handle related records)
    await prisma.customer.delete({
      where: { id },
    });

    // Create audit log
    try {
      const systemUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });

      if (systemUser) {
        await prisma.auditLog.create({
          data: {
            userId: systemUser.id,
            action: "DELETE",
            entity: "Customer",
            entityId: id,
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
    }

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
