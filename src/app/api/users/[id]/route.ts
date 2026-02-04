import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import bcrypt from "bcryptjs";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { canManageUsers } from "@/lib/permissions";

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromRequest(request);
    
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Only SUPER_ADMIN can manage users" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { email, name, password, role } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent super admin from changing their own role to something else
    if (currentUser.id === id && role && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role && !["SUPER_ADMIN", "ADMIN", "USER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be SUPER_ADMIN, ADMIN, or USER" },
        { status: 400 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (password) {
      // Hash new password if provided
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[PUT /api/users/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromRequest(request);
    
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Only SUPER_ADMIN can manage users" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Prevent super admin from deleting themselves
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/users/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
