import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    default:
      "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800",
    ghost:
      "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
