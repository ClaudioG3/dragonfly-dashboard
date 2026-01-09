"use client";

import React, { ReactNode, useEffect } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogFooterProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

interface DialogDescriptionProps {
  children: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className="relative z-50">{children}</div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`relative rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>;
};

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return (
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
      {children}
    </h2>
  );
};

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  return <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>;
};
