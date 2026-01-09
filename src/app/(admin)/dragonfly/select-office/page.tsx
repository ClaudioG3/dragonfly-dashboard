"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDragonflySession } from "@/lib/dragonfly/auth";
import { getAllOffices } from "@/lib/dragonfly/mock/offices";
import { useOfficeContext } from "@/lib/dragonfly/context/OfficeContext";
import { OfficeDTO } from "@/lib/dragonfly/contracts";

export default function SelectOfficePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: sessionLoading } = useDragonflySession();
  const { setSelectedOffice } = useOfficeContext();

  const [offices, setOffices] = useState<OfficeDTO[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load offices on mount
  useEffect(() => {
    const availableOffices = getAllOffices();
    setOffices(availableOffices);

    // Pre-select home office if available
    if (user?.office_id) {
      const homeOffice = availableOffices.find((o) => o.id === user.office_id);
      if (homeOffice) {
        setSelectedOfficeId(homeOffice.id);
      }
    }
  }, [user]);

  const handleContinue = () => {
    if (!selectedOfficeId) {
      return;
    }

    setIsSubmitting(true);

    const selectedOffice = offices.find((o) => o.id === selectedOfficeId);
    if (selectedOffice) {
      // Save to context (which persists to localStorage)
      setSelectedOffice(selectedOffice);

      // Redirect to original destination or default to invoices
      const redirectTo = searchParams.get("redirect") || "/dragonfly/invoices";
      router.replace(redirectTo);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Select Office
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Please select an office to continue. You can change this selection later.
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="office-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Office
              </label>
              <select
                id="office-select"
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">-- Select an office --</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name} {office.code ? `(${office.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedOfficeId || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You are logged in as <span className="font-medium">{user?.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
