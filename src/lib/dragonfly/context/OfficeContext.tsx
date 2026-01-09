"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { OfficeDTO } from "../contracts";

// ============================================
// OFFICE CONTEXT
// ============================================
// Manages selected office state for ADMIN users
// For SUBMITTER/APPROVER: auto-populated from session

interface OfficeContextState {
  selectedOfficeId: string | null;
  selectedOfficeName: string | null;
  setSelectedOffice: (office: OfficeDTO) => void;
  clearSelectedOffice: () => void;
  isInitialized: boolean;
}

const OfficeContext = createContext<OfficeContextState | undefined>(undefined);

// LocalStorage keys for ADMIN office persistence
const SELECTED_OFFICE_ID_KEY = "dragonfly.selectedOfficeId";
const SELECTED_OFFICE_NAME_KEY = "dragonfly.selectedOfficeName";

export function OfficeProvider({ children }: { children: ReactNode }) {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [selectedOfficeName, setSelectedOfficeName] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount (for ADMIN users)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOfficeId = localStorage.getItem(SELECTED_OFFICE_ID_KEY);
      const storedOfficeName = localStorage.getItem(SELECTED_OFFICE_NAME_KEY);

      if (storedOfficeId && storedOfficeName) {
        setSelectedOfficeId(storedOfficeId);
        setSelectedOfficeName(storedOfficeName);
      }
      setIsInitialized(true);
    }
  }, []);

  const setSelectedOffice = (office: OfficeDTO) => {
    setSelectedOfficeId(office.id);
    setSelectedOfficeName(office.name);

    // Persist for ADMIN users
    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_OFFICE_ID_KEY, office.id);
      localStorage.setItem(SELECTED_OFFICE_NAME_KEY, office.name);
    }
  };

  const clearSelectedOffice = () => {
    setSelectedOfficeId(null);
    setSelectedOfficeName(null);

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(SELECTED_OFFICE_ID_KEY);
      localStorage.removeItem(SELECTED_OFFICE_NAME_KEY);
    }
  };

  return (
    <OfficeContext.Provider
      value={{
        selectedOfficeId,
        selectedOfficeName,
        setSelectedOffice,
        clearSelectedOffice,
        isInitialized,
      }}
    >
      {children}
    </OfficeContext.Provider>
  );
}

export function useOfficeContext() {
  const context = useContext(OfficeContext);
  if (context === undefined) {
    throw new Error("useOfficeContext must be used within an OfficeProvider");
  }
  return context;
}
