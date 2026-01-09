import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <input
      className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500 ${className}`}
      disabled={disabled}
      {...props}
    />
  );
};
