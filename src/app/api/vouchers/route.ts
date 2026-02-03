import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma/client";
import { createAuditLog } from "@/lib/audit";
import { getAuthUser, checkDeletePermission } from "@/lib/auth-helpers";

// Validation schema
const createVoucherSchema = z.object({
  creator: z.enum(["RACEGARAGE", "PD_DRIVE_CLUB"]),
  minutes: z.number().int().positive(),
  soldToEmail: z.string().email(),
  soldToName: z.string().min(1),
});

// GET - List all vouchers
export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: {
        redeemedByCustomer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(vouchers);
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}

// POST - Create new voucher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createVoucherSchema.parse(body);

    // Generate unique voucher code with prefix
    const prefix = validatedData.creator === "RACEGARAGE" ? "RG" : "PD";
    const code = generateVoucherCode(prefix);

    // Set expiration to 6 months from now
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    const voucher = await prisma.voucher.create({
      data: {
        code,
        minutes: validatedData.minutes,
        soldToEmail: validatedData.soldToEmail,
        soldToName: validatedData.soldToName,
        status: "NEW",
        expiresAt,
      },
    });

    // Log audit
    await createAuditLog(
      "CREATE",
      "VOUCHER",
      voucher.id,
      { code: voucher.code, minutes: voucher.minutes }
    );

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid voucher data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating voucher:", error);
    return NextResponse.json(
      { error: "Failed to create voucher" },
      { status: 500 }
    );
  }
}

// PATCH - Update voucher (extend expiration)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Voucher ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { expiresAt } = body;

    if (!expiresAt) {
      return NextResponse.json(
        { error: "New expiration date is required" },
        { status: 400 }
      );
    }

    // Check if voucher exists and is unused
    const voucher = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    // Only allow extending unused vouchers
    if (voucher.status === "REDEEMED" || voucher.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot extend redeemed or cancelled voucher" },
        { status: 400 }
      );
    }

    // Validate new expiration date is in the future
    const newExpiresAt = new Date(expiresAt);
    if (newExpiresAt <= new Date()) {
      return NextResponse.json(
        { error: "New expiration date must be in the future" },
        { status: 400 }
      );
    }

    // Update voucher
    const updatedVoucher = await prisma.voucher.update({
      where: { id },
      data: {
        expiresAt: newExpiresAt,
      },
      include: {
        redeemedByCustomer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Log audit
    await createAuditLog(
      "UPDATE",
      "VOUCHER",
      voucher.id,
      { 
        code: voucher.code, 
        action: "extend_expiration",
        oldExpiresAt: voucher.expiresAt,
        newExpiresAt: newExpiresAt
      }
    );

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error("Error updating voucher:", error);
    return NextResponse.json(
      { error: "Failed to update voucher" },
      { status: 500 }
    );
  }
}

// DELETE - Delete unused voucher
export async function DELETE(request: NextRequest) {
  try {
    // Check delete permission
    const user = getAuthUser(request);
    const permissionError = checkDeletePermission(user);
    if (permissionError) {
      return NextResponse.json(
        { error: permissionError.error },
        { status: permissionError.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Voucher ID is required" },
        { status: 400 }
      );
    }

    // Check if voucher exists and is unused
    const voucher = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    // Only allow deleting unused vouchers
    if (voucher.status === "REDEEMED") {
      return NextResponse.json(
        { error: "Cannot delete redeemed voucher" },
        { status: 400 }
      );
    }

    // Delete voucher
    await prisma.voucher.delete({
      where: { id },
    });

    // Log audit
    await createAuditLog(
      "DELETE",
      "VOUCHER",
      voucher.id,
      { 
        code: voucher.code,
        status: voucher.status,
        minutes: voucher.minutes
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting voucher:", error);
    return NextResponse.json(
      { error: "Failed to delete voucher" },
      { status: 500 }
    );
  }
}

// Helper function to generate voucher code
function generateVoucherCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding similar looking characters
  let code = prefix + "-";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
