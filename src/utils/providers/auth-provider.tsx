"use client";

import { useSession } from "@/utils/auth/auth-client";
import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending) return;

    const isAuthPage = pathname === "/auth";
    const isDashboardRoute = pathname.startsWith("/dashboard");

    if (session) {
      if (isAuthPage) {
        redirect("/dashboard");
      }
    } else {
      if (isDashboardRoute) {
        redirect("/");
      }
    }
  }, [session, pathname, isPending]);

  if (isPending) {
    return null;
  }

  return <>{children}</>;
}