import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import bcrypt from "bcryptjs";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { canManageUsers } from "@/lib/permissions";

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Only SUPER_ADMIN can manage users" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/users] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Only SUPER_ADMIN can manage users" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    // Validation
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: "Email, name, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["SUPER_ADMIN", "ADMIN", "USER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be SUPER_ADMIN, ADMIN, or USER" },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("[POST /api/users] Error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
