"use client";

import { useState, useEffect } from "react";
import { MOCK_USERS } from "@/lib/dragonfly/mockData";
import { UserRole } from "@/lib/dragonfly/contracts";

// ============================================
// DEV ROLE SWITCHER
// ============================================
// Floating button for switching between mock users in development
// Only renders in development mode

const MOCK_ROLE_KEY = "dragonfly.mockRole";
const MOCK_USER_ID_KEY = "dragonfly.mockUserId";

type MockRoleType = "admin" | "approver" | "submitter";

const ROLE_CYCLE: MockRoleType[] = ["admin", "approver", "submitter"];

export function DevRoleSwitcher() {
  const [currentRole, setCurrentRole] = useState<MockRoleType>("admin");
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setIsVisible(true);

      // Load current role from localStorage
      const storedRole = localStorage.getItem(MOCK_ROLE_KEY) as MockRoleType;
      if (storedRole && ROLE_CYCLE.includes(storedRole)) {
        setCurrentRole(storedRole);
      }
    }
  }, []);

  const switchRole = () => {
    const currentIndex = ROLE_CYCLE.indexOf(currentRole);
    const nextIndex = (currentIndex + 1) % ROLE_CYCLE.length;
    const nextRole = ROLE_CYCLE[nextIndex];

    // Find the mock user for the next role
    let mockUser;
    if (nextRole === "admin") {
      mockUser = MOCK_USERS.find((u) => u.role === UserRole.ADMIN);
    } else if (nextRole === "approver") {
      mockUser = MOCK_USERS.find((u) => u.role === UserRole.APPROVER);
    } else {
      mockUser = MOCK_USERS.find((u) => u.role === UserRole.SUBMITTER);
    }

    if (mockUser) {
      // Update localStorage
      localStorage.setItem(MOCK_ROLE_KEY, nextRole);
      localStorage.setItem(MOCK_USER_ID_KEY, mockUser.id);

      // Update the session
      const sessionKey = "dragonfly_session";
      const session = {
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          office_id: mockUser.office_id,
          office_name: mockUser.office_name,
        },
        accessToken: `mock-token-${mockUser.id}-${Date.now()}`,
      };
      localStorage.setItem(sessionKey, JSON.stringify(session));

      // If switching away from ADMIN, clear selected office
      if (nextRole !== "admin") {
        localStorage.removeItem("dragonfly.selectedOfficeId");
        localStorage.removeItem("dragonfly.selectedOfficeName");
      }

      // Reload to apply changes
      window.location.reload();
    }
  };

  if (!isVisible) {
    return null;
  }

  const roleLabels = {
    admin: "ADMIN",
    approver: "APPROVER",
    submitter: "SUBMITTER",
  };

  const roleColors = {
    admin: "bg-purple-600 hover:bg-purple-700",
    approver: "bg-blue-600 hover:bg-blue-700",
    submitter: "bg-green-600 hover:bg-green-700",
  };

  const currentUser = MOCK_USERS.find((u) => {
    if (currentRole === "admin") return u.role === UserRole.ADMIN;
    if (currentRole === "approver") return u.role === UserRole.APPROVER;
    return u.role === UserRole.SUBMITTER;
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <button
        onClick={switchRole}
        className={`${roleColors[currentRole]} text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 text-sm font-medium`}
        title="Click to switch role"
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs opacity-75">DEV MODE</span>
          <span className="font-bold">{roleLabels[currentRole]}</span>
          {currentUser && (
            <span className="text-xs opacity-90">{currentUser.office_name}</span>
          )}
        </div>
      </button>
    </div>
  );
}
