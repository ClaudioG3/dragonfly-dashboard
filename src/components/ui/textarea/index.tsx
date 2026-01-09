import React, { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <textarea
      className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500 ${className}`}
      disabled={disabled}
      {...props}
    />
  );
};
