"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserSummary, UserRole } from "./contracts";
import { mockGetSession } from "./mockApi";

// ============================================
// SESSION HOOK
// ============================================

export function useDragonflySession() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = mockGetSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  const isApprover = user?.role === UserRole.APPROVER || user?.role === UserRole.ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN;

  return { user, loading, isApprover, isAdmin };
}

// ============================================
// AUTH GUARD HOC
// ============================================

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { requiredRole?: UserRole }
) {
  return function AuthGuardedComponent(props: P) {
    const router = useRouter();
    const { user, loading, isApprover } = useDragonflySession();

    useEffect(() => {
      if (!loading && !user) {
        router.replace("/signin");
      }

      // Role check if required
      if (!loading && user && options?.requiredRole) {
        if (options.requiredRole === UserRole.APPROVER && !isApprover) {
          router.replace("/dragonfly/invoices");
        }
      }
    }, [loading, user, router, isApprover]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
