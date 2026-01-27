import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createAuditLog } from "@/lib/audit";

// GET - Fetch all partner vouchers
export async function GET() {
  try {
    const partnerVouchers = await prisma.partnerVoucher.findMany({
      include: {
        session: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // UNCLAIMED first
        { rideDate: "desc" }, // Then by most recent
      ],
    });

    return NextResponse.json(partnerVouchers);
  } catch (error) {
    console.error("Error fetching partner vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner vouchers" },
      { status: 500 }
    );
  }
}

// PATCH - Update claim status
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
    const { status } = body;

    if (status !== "CLAIMED" && status !== "UNCLAIMED") {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedVoucher = await prisma.partnerVoucher.update({
      where: { id },
      data: {
        status,
        claimedAt: status === "CLAIMED" ? new Date() : null,
      },
      include: {
        session: {
          include: {
            customer: true,
          },
        },
      },
    });

    // Audit log
    await createAuditLog(
      "PARTNER_VOUCHER_UPDATE",
      "partner_voucher",
      id,
      {
        code: updatedVoucher.code,
        partner: updatedVoucher.partner,
        status,
        claimedAt: updatedVoucher.claimedAt,
      }
    );

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error("Error updating partner voucher:", error);
    return NextResponse.json(
      { error: "Failed to update partner voucher" },
      { status: 500 }
    );
  }
}
