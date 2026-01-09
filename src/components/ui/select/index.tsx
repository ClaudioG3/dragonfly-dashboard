"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}

interface SelectTriggerProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: ReactNode;
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  disabled = false,
  children,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  id,
  children,
  className = "",
}) => {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <button
      id={id}
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white ${className}`}
    >
      {children}
      <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder = "Select..." }) => {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const { open, setOpen } = React.useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      {children}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  const { onValueChange, setOpen, value: selectedValue } = React.useContext(SelectContext);

  return (
    <div
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
      className={`cursor-pointer px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
        selectedValue === value ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20" : ""
      }`}
    >
      {children}
    </div>
  );
};
