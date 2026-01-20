import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createAuditLog } from "@/lib/audit";

// DELETE /api/payments/[id] - Delete payment record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if payment record exists
    const paymentRecord = await prisma.paymentRecord.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!paymentRecord) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Delete payment record
    await prisma.paymentRecord.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog("DELETE", "PaymentRecord", id, {
      customer: paymentRecord.customer
        ? `${paymentRecord.customer.firstName} ${paymentRecord.customer.lastName}`
        : "Unknown",
      amountCents: paymentRecord.amountCents,
      method: paymentRecord.method,
      receiver: paymentRecord.receiver,
    });

    return NextResponse.json({ message: "Payment record deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment record:", error);
    return NextResponse.json(
      { error: "Failed to delete payment record" },
      { status: 500 }
    );
  }
}
