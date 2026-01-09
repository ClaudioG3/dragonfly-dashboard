import React, { ReactNode } from "react";

interface AlertProps {
  children?: ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

interface AlertDescriptionProps {
  children: ReactNode;
  className?: string;
}

// Alert Component - simplified version compatible with shadcn/ui
export const Alert: React.FC<AlertProps> = ({
  children,
  variant = "default",
  className = ""
}) => {
  const variantClasses = variant === "destructive"
    ? "border-red-500/50 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900";

  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${variantClasses} ${className}`}
      role="alert"
    >
      <div className="flex gap-3">
        {children}
      </div>
    </div>
  );
};

// AlertDescription Component
export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
};
