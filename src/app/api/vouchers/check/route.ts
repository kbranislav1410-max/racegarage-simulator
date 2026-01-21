import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Kód voucheru je povinný" },
        { status: 400 }
      );
    }

    // Find voucher by code
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
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

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher s týmto kódom nebol nájdený" },
        { status: 404 }
      );
    }

    return NextResponse.json(voucher);
  } catch (error) {
    console.error("Error checking voucher:", error);
    return NextResponse.json(
      { error: "Chyba pri kontrole voucheru" },
      { status: 500 }
    );
  }
}
