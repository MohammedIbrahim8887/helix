import { AccountGenerations } from "@/types/api/caption";
import { ApiPaginatedResponse } from "@/types/api/common";
import { auth } from "@/utils/auth/auth";
import { prisma } from "@/utils/configs/prisma.config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiPaginatedResponse<AccountGenerations>>> {
  try {
    const session = await auth.api.getSession(request);

    const account = await prisma.account.findFirst({
      where: { userId: session!.user.id },
    });

    if (!account) {
      return NextResponse.json(
        {
          data: [],
          message: "Account not found",
          status: "error",
          page: 0,
          total: 0,
          totalPages: 0,
          currentPage: 0,
          limit: 0,
        },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(searchParams.get("limit")) || 12, 1);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = {
      accountId: account.id,
      ...(search && {
        caption: { contains: search, mode: "insensitive" as const },
      }),
    };

    const total = await prisma.accountGenerations.count({ where });

    const totalPages = Math.ceil(total / limit);

    const generations = await prisma.accountGenerations.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      data: generations,
      total,
      totalPages,
      page,
      limit,
      currentPage: page,
      message: "Captions fetched successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error getting all captions:", error);
    return NextResponse.json(
      {
        data: [],
        message: (error as Error).message || "Failed to get all captions",
        status: "error",
        page: 0,
        total: 0,
        totalPages: 0,
        currentPage: 0,
        limit: 0,
      },
      { status: 500 }
    );
  }
}
