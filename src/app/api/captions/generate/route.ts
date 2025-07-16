import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth/auth";
import { prisma } from "@/utils/configs/prisma.config";
import { generateCaption } from "@/utils/helpers/ai/generate-caption";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);

    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: "Image key is required" },
        { status: 400 }
      );
    }

    const imageUrl = `https://utfs.io/f/${key}`;

    const result = await generateCaption(imageUrl);

    const account = await prisma.account.findFirst({
      where: { userId: session!.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const generation = await prisma.accountGenerations.create({
      data: {
        accountId: account.id,
        key,
        caption: result.text,
      },
    });

    return NextResponse.json({
      success: true,
      caption: result.text,
      generationId: generation.id,
    });
  } catch (error) {
    console.error("Error generating caption:", error);
    return NextResponse.json(
      { error: "Failed to generate caption" },
      { status: 500 }
    );
  }
}
