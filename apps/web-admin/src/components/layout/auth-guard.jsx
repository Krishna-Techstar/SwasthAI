"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminStore } from "@/store/admin-store";

const PUBLIC_PATHS = ["/login"];

export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // Track client-side mount independently — don't rely on Zustand persist callback
  // because Next.js SSR can cause the persist middleware to never fire its callback
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated && !isPublicPath) {
      router.replace("/login");
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [mounted, isAuthenticated, isPublicPath, pathname, router]);

  // Wait for client mount to prevent SSR/CSR flash
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand/20 border-t-brand" />
          <span className="text-xs text-txt-muted">Loading...</span>
        </div>
      </div>
    );
  }

  // On public pages, render children directly (login page)
  if (isPublicPath) {
    return isAuthenticated ? null : children;
  }

  // On protected pages, require auth
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
