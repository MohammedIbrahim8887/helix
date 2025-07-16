import { auth } from "@/utils/auth/auth";
import { prisma } from "@/utils/configs/prisma.config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);
    
    const account = await prisma.account.findUnique({
      where: {
        id: session!.user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const captionId = searchParams.get("id");

    if (!captionId) {
      return NextResponse.json(
        { error: "Caption ID is required" },
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
        { error: "Caption not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ caption });
  } catch (error) {
    console.error("Error getting caption:", error);
    return NextResponse.json(
      { error: "Failed to get caption" },
      { status: 500 }
    );
  }
}
