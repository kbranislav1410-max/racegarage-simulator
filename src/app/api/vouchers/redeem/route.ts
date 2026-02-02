import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma/client";
import { createAuditLog } from "@/lib/audit";

const redeemVoucherSchema = z.object({
  code: z.string().min(1),
  customerId: z.string().min(1),
});

// POST - Redeem a voucher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = redeemVoucherSchema.parse(body);

    // Find the voucher
    const voucher = await prisma.voucher.findUnique({
      where: { code: validatedData.code },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    // Check if voucher is already redeemed
    if (voucher.status === "REDEEMED") {
      return NextResponse.json(
        { error: "Voucher has already been redeemed" },
        { status: 400 }
      );
    }

    // Check if voucher is valid
    if (voucher.status !== "NEW" && voucher.status !== "SENT") {
      return NextResponse.json(
        { error: "Voucher is not valid for redemption" },
        { status: 400 }
      );
    }

    // Redeem the voucher
    const updatedVoucher = await prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        status: "REDEEMED",
        redeemedAt: new Date(),
        redeemedByCustomerId: validatedData.customerId,
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
      "REDEEM",
      "VOUCHER",
      updatedVoucher.id,
      {
        code: updatedVoucher.code,
        customerId: validatedData.customerId,
      }
    );

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid redemption data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error redeeming voucher:", error);
    return NextResponse.json(
      { error: "Failed to redeem voucher" },
      { status: 500 }
    );
  }
}
