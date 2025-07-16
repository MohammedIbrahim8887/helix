import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/auth", "/api/auth", "/api/uploadthing"];

  const protectedRoutes = ["/dashboard", "/captions"];

  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/api/auth") {
      return pathname.startsWith(route);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session && isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (session && pathname === "/auth") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware authentication error:", error);

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api/auth|api/uploadthing|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
