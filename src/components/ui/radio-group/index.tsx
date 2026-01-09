"use client";

import React, { ReactNode, InputHTMLAttributes } from "react";

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}

interface RadioGroupItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value"> {
  value: string;
  id?: string;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  disabled = false,
  children,
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
      <div className="space-y-2">{children}</div>
    </RadioGroupContext.Provider>
  );
};

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  id,
  disabled: itemDisabled,
  ...props
}) => {
  const { value: groupValue, onValueChange, disabled: groupDisabled } = React.useContext(RadioGroupContext);
  const disabled = itemDisabled || groupDisabled;
  const checked = groupValue === value;

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={() => !disabled && onValueChange?.(value)}
      disabled={disabled}
      className="h-4 w-4 cursor-pointer border-gray-300 text-brand-500 focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700"
      {...props}
    />
  );
};
