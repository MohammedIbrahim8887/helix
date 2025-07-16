import { AccountGenerations } from "@/generated/prisma";
import { ApiResponse } from "@/types/api/common";
import { auth } from "@/utils/auth/auth";
import { prisma } from "@/utils/configs/prisma.config";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const deleteSchema = z.object({ id: z.string().uuid() });

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const body = await request.json().catch(() => null);
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, message: "Invalid payload", status: "error" },
        { status: 400 }
      );
    }

    const { id } = parsed.data;
    const session = await auth.api.getSession(request);

    if (!session?.user?.id) {
      return NextResponse.json(
        { data: null, message: "Unauthorized", status: "error" },
        { status: 401 }
      );
    }

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json(
        { data: null, message: "Account not found", status: "error" },
        { status: 404 }
      );
    }

    const caption = await prisma.accountGenerations.findUnique({
      where: { id },
    });

    if (!caption || caption.accountId !== account.id) {
      return NextResponse.json(
        { data: null, message: "Caption not found or access denied", status: "error" },
        { status: 404 }
      );
    }

    await prisma.accountGenerations.delete({ where: { id } });

    return NextResponse.json(
      { data: null, message: "Caption deleted successfully", status: "success" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/caption:", error);
    return NextResponse.json(
      { data: null, message: "Internal server error", status: "error" },
      { status: 500 }
    );
  }
}