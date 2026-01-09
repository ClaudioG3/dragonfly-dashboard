"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDragonflySession } from "@/lib/dragonfly/auth";
import { useOfficeContext, OfficeProvider } from "@/lib/dragonfly/context/OfficeContext";
import { DevRoleSwitcher } from "@/components/dragonfly/DevRoleSwitcher";
import { OfficeSelector } from "@/components/dragonfly/OfficeSelector";
import { UserRole } from "@/lib/dragonfly/contracts";

// ============================================
// DRAGONFLY LAYOUT WITH OFFICE GUARD
// ============================================
// Wraps all Dragonfly pages
// Enforces office selection rules based on role

function DragonflyLayoutInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: sessionLoading } = useDragonflySession();
  const { selectedOfficeId, setSelectedOffice, isInitialized } = useOfficeContext();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for both session and office context to initialize
    if (sessionLoading || !isInitialized) {
      return;
    }

    // Skip guard for select-office page itself
    if (pathname === "/dragonfly/select-office") {
      setIsReady(true);
      return;
    }

    if (!user) {
      // No user session - redirect to signin
      router.replace("/signin");
      return;
    }

    // Office selection logic based on role
    if (user.role === UserRole.ADMIN) {
      // ADMIN must explicitly select an office
      if (!selectedOfficeId) {
        // Redirect to select-office page with return URL
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/dragonfly/select-office?redirect=${returnUrl}`);
        return;
      }
    } else {
      // APPROVER or SUBMITTER: auto-select from user profile
      if (user.office_id && user.office_name) {
        if (!selectedOfficeId || selectedOfficeId !== user.office_id) {
          // Auto-set office from user profile
          setSelectedOffice({
            id: user.office_id,
            name: user.office_name,
            is_active: true,
          });
        }
      }
    }

    setIsReady(true);
  }, [sessionLoading, isInitialized, user, selectedOfficeId, pathname, router, setSelectedOffice]);

  // Show loading state while initializing
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render children with office selector (if not on select-office page)
  const showOfficeSelector = pathname !== "/dragonfly/select-office" && user;

  return (
    <div className="min-h-screen">
      {showOfficeSelector && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dragonfly Invoice Management
            </h2>
            <OfficeSelector />
          </div>
        </div>
      )}
      <div>{children}</div>
      <DevRoleSwitcher />
    </div>
  );
}

export default function DragonflyLayout({ children }: { children: ReactNode }) {
  return (
    <OfficeProvider>
      <DragonflyLayoutInner>{children}</DragonflyLayoutInner>
    </OfficeProvider>
  );
}
