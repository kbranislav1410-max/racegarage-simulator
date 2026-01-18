import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

// Validation schema
const createVoucherSchema = z.object({
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

    // Generate unique voucher code
    const code = generateVoucherCode();

    const voucher = await prisma.voucher.create({
      data: {
        code,
        minutes: validatedData.minutes,
        soldToEmail: validatedData.soldToEmail,
        soldToName: validatedData.soldToName,
        status: "NEW",
      },
    });

    // Log audit
    await logAudit({
      action: "CREATE",
      entity: "VOUCHER",
      entityId: voucher.id,
      payload: { code: voucher.code, minutes: voucher.minutes },
    });

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid voucher data", details: error.errors },
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

// Helper function to generate voucher code
function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding similar looking characters
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
