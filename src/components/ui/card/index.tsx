import { ReactNode } from "react";

// Props interfaces for Card, CardTitle, and CardDescription
interface CardProps {
  children?: ReactNode; // Optional additional content
  className?: string; // Optional className for styling
}

interface CardTitleProps {
  children: ReactNode;
  className?: string; // Optional className for styling
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string; // Optional className for styling
}

// Card Component
const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

// CardHeader Component
const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

// CardContent Component
const CardContent: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>;
};

// CardTitle Component
const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => {
  return (
    <h4 className={`mb-1 font-medium text-gray-800 text-theme-xl dark:text-white/90 ${className}`}>
      {children}
    </h4>
  );
};

// CardDescription Component
const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = "" }) => {
  return <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>;
};

// Named exports for better flexibility
export { Card, CardHeader, CardContent, CardTitle, CardDescription };
