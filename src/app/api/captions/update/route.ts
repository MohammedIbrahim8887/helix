import { auth } from "@/utils/auth/auth";
import { prisma } from "@/utils/configs/prisma.config";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api/common";
import { AccountGenerations } from "@/generated/prisma";

export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<AccountGenerations>>> {
  try {
    const session = await auth.api.getSession(request);
    const { id, caption } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          data: null as any,
          message: "Caption ID is required",
          status: "error" as const,
        },
        { status: 400 }
      );
    }

    if (!caption || typeof caption !== "string") {
      return NextResponse.json(
        {
          data: null as any,
          message: "Valid caption text is required",
          status: "error" as const,
        },
        { status: 400 }
      );
    }

    const account = await prisma.account.findFirst({
      where: { userId: session!.user.id },
    });

    if (!account) {
      return NextResponse.json(
        {
          data: null as any,
          message: "Account not found",
          status: "error" as const,
        },
        { status: 404 }
      );
    }

    // Verify the caption belongs to the user before updating
    const existingCaption = await prisma.accountGenerations.findFirst({
      where: {
        id,
        accountId: account.id,
      },
    });

    if (!existingCaption) {
      return NextResponse.json(
        {
          data: null as any,
          message: "Caption not found or you don't have permission to edit it",
          status: "error" as const,
        },
        { status: 404 }
      );
    }

    // Update the caption
    const updatedCaption = await prisma.accountGenerations.update({
      where: { id },
      data: {
        caption: caption.trim(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      data: updatedCaption,
      message: "Caption updated successfully",
      status: "success" as const,
    });
  } catch (error) {
    console.error("Error updating caption:", error);
    return NextResponse.json(
      {
        data: null as any,
        message: (error as Error).message || "Failed to update caption",
        status: "error" as const,
      },
      { status: 500 }
    );
  }
} 