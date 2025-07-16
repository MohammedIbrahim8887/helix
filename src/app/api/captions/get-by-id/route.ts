import { auth } from "@/utils/auth/auth";
import { prisma } from "@/utils/configs/prisma.config";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api/common";
import { AccountGenerations } from "@/generated/prisma";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AccountGenerations>>> {
  try {
    const session = await auth.api.getSession(request);
    
    const account = await prisma.account.findFirst({
      where: {
        userId: session!.user.id,
      },
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

    const { searchParams } = new URL(request.url);
    const captionId = searchParams.get("id");

    if (!captionId) {
      return NextResponse.json(
        {
          data: null as any,
          message: "Caption ID is required",
          status: "error" as const,
        },
        { status: 400 }
      );
    }

    const caption = await prisma.accountGenerations.findFirst({
      where: {
        id: captionId,
        accountId: account.id,
      },
    });

    if (!caption) {
      return NextResponse.json(
        {
          data: null as any,
          message: "Caption not found",
          status: "error" as const,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: caption,
      message: "Caption fetched successfully",
      status: "success" as const,
    });
  } catch (error) {
    console.error("Error getting caption:", error);
    return NextResponse.json(
      {
        data: null as any,
        message: (error as Error).message || "Failed to get caption",
        status: "error" as const,
      },
      { status: 500 }
    );
  }
}
