"use client";

import { useState, useEffect } from "react";
import { useDragonflySession } from "@/lib/dragonfly/auth";
import { useOfficeContext } from "@/lib/dragonfly/context/OfficeContext";
import { getAllOffices } from "@/lib/dragonfly/mock/offices";
import { OfficeDTO, UserRole } from "@/lib/dragonfly/contracts";

// ============================================
// OFFICE SELECTOR
// ============================================
// Shows current office for all roles
// ADMIN: can switch offices via dropdown
// APPROVER/SUBMITTER: read-only badge

export function OfficeSelector() {
  const { user } = useDragonflySession();
  const { selectedOfficeId, selectedOfficeName, setSelectedOffice } = useOfficeContext();
  const [offices, setOffices] = useState<OfficeDTO[]>([]);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (isAdmin) {
      const availableOffices = getAllOffices();
      setOffices(availableOffices);
    }
  }, [isAdmin]);

  const handleOfficeChange = (officeId: string) => {
    const office = offices.find((o) => o.id === officeId);
    if (office) {
      setSelectedOffice(office);
      // Reload to refresh data for new office
      window.location.reload();
    }
  };

  // For APPROVER/SUBMITTER: show read-only badge
  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Office:</span>
        <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium">
          {selectedOfficeName || user?.office_name || "Unknown"}
        </span>
      </div>
    );
  }

  // For ADMIN: show dropdown selector
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="office-selector" className="text-sm text-gray-600 dark:text-gray-400">
        Office:
      </label>
      <select
        id="office-selector"
        value={selectedOfficeId || ""}
        onChange={(e) => handleOfficeChange(e.target.value)}
        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {!selectedOfficeId && <option value="">-- Select office --</option>}
        {offices.map((office) => (
          <option key={office.id} value={office.id}>
            {office.name} {office.code ? `(${office.code})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
