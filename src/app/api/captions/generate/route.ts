import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth/auth";
import { prisma } from "@/utils/configs/prisma.config";
import { generateCaption } from "@/utils/helpers/ai/generate-caption";
import { ApiResponse } from "@/types/api/common";
import { AccountGenerations } from "@/generated/prisma";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AccountGenerations>>> {
  try {
    const session = await auth.api.getSession(request);
    if (!session) {
      return NextResponse.json(
        {
          data: {} as AccountGenerations,
          message: "Unauthorized",
          status: "error",
        },
        { status: 401 }
      );
    }

    const { key } = await request.json();
    const isRegenerate =
      request.nextUrl.searchParams.get("type") === "regenerate";

    if (!key) {
      return NextResponse.json(
        {
          data: {} as AccountGenerations,
          message: "Image key is required",
          status: "error",
        },
        { status: 400 }
      );
    }

    const imageUrl = `https://utfs.io/f/${key}`;
    const result = await generateCaption(imageUrl);

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id },
    });
    if (!account) {
      return NextResponse.json(
        {
          data: {} as AccountGenerations,
          message: "Account not found",
          status: "error",
        },
        { status: 404 }
      );
    }

    let generation: AccountGenerations;

    const existing = await prisma.accountGenerations.findFirst({
      where: { accountId: account.id, key },
    });
    if (isRegenerate && existing) {
      generation = await prisma.accountGenerations.update({
        where: { id: existing.id },
        data: { caption: result.text, updatedAt: new Date() },
      });
    } else {
      generation = await prisma.accountGenerations.create({
        data: { accountId: account.id, key, caption: result.text },
      });
    }

    return NextResponse.json({
      data: generation,
      message: "Caption generated successfully",
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: {} as AccountGenerations,
        message: (error as Error).message || "Failed to generate caption",
        status: "error",
      },
      { status: 500 }
    );
  }
}
