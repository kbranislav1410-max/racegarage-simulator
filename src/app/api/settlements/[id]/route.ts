import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getAuthUser, checkDeletePermission } from "@/lib/auth-helpers";

// GET /api/settlements/[id] - Get settlement details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const settlement = await prisma.monthlySettlement.findUnique({
      where: { id },
    });

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 }
      );
    }

    // Also fetch the related payments for this month
    const startDate = new Date(settlement.year, settlement.month - 1, 1);
    const endDate = new Date(settlement.year, settlement.month, 0, 23, 59, 59, 999);

    const payments = await prisma.paymentRecord.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
        session: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      settlement,
      payments,
    });
  } catch (error) {
    console.error("Error fetching settlement:", error);
    return NextResponse.json(
      { error: "Failed to fetch settlement" },
      { status: 500 }
    );
  }
}

// PATCH /api/settlements/[id] - Update settlement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, invoiceNumber, invoiceDate, paidDate, notes } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (invoiceNumber !== undefined) updateData.invoiceNumber = invoiceNumber;
    if (invoiceDate !== undefined) updateData.invoiceDate = invoiceDate ? new Date(invoiceDate) : null;
    if (paidDate !== undefined) updateData.paidDate = paidDate ? new Date(paidDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    // Auto-set invoice date when status changes to INVOICE_SENT
    if (status === "INVOICE_SENT" && !invoiceDate) {
      updateData.invoiceDate = new Date();
    }

    // Auto-set paid date when status changes to PAID
    if (status === "PAID" && !paidDate) {
      updateData.paidDate = new Date();
    }

    // Generate invoice number if status is INVOICE_SENT and no invoice number yet
    if (status === "INVOICE_SENT" && !invoiceNumber) {
      const settlement = await prisma.monthlySettlement.findUnique({
        where: { id },
      });
      if (settlement) {
        updateData.invoiceNumber = `${settlement.year}${String(settlement.month).padStart(2, '0')}001`;
      }
    }

    const settlement = await prisma.monthlySettlement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(settlement);
  } catch (error) {
    console.error("Error updating settlement:", error);
    return NextResponse.json(
      { error: "Failed to update settlement" },
      { status: 500 }
    );
  }
}

// DELETE /api/settlements/[id] - Delete settlement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check delete permission
    const user = getAuthUser(request);
    const permissionError = checkDeletePermission(user);
    if (permissionError) {
      return NextResponse.json(
        { error: permissionError.error },
        { status: permissionError.status }
      );
    }

    await prisma.monthlySettlement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting settlement:", error);
    return NextResponse.json(
      { error: "Failed to delete settlement" },
      { status: 500 }
    );
  }
}
