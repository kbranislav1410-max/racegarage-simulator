import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password: inputPassword } = body;

    console.log('[LOGIN] Attempting login for email:', email);

    if (!email || !inputPassword) {
      console.log('[LOGIN] Missing email or password');
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    console.log('[LOGIN] User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('[LOGIN] User role:', user.role);
    }

    // Always perform password comparison to prevent timing attacks
    // Use a dummy hash if user not found
    const passwordHash = user?.password || "$2a$10$dummyhashtopreventtimingattack1234567890";
    const isValidPassword = await bcrypt.compare(inputPassword, passwordHash);

    console.log('[LOGIN] Password validation:', isValidPassword ? 'Valid' : 'Invalid');

    if (!user || !isValidPassword) {
      console.log('[LOGIN] Authentication failed');
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    console.log('[LOGIN] Login successful for user:', user.email);

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    });
  } catch (error) {
    console.error('[LOGIN] Error details:', error);
    console.error('[LOGIN] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[LOGIN] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
