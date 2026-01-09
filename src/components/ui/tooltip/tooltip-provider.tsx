"use client";

import React, { ReactNode, useState } from "react";
import Tooltip from "./Tooltip";

interface TooltipProviderProps {
  children: ReactNode;
}

interface TooltipProps {
  children: ReactNode;
}

interface TooltipTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

interface TooltipContentProps {
  children: ReactNode;
}

const TooltipContext = React.createContext<{
  content?: ReactNode;
  setContent?: (content: ReactNode) => void;
}>({});

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  const [content, setContent] = useState<ReactNode>(null);

  return (
    <TooltipContext.Provider value={{ content, setContent }}>
      {content ? (
        <Tooltip content={content} placement="top">
          {children}
        </Tooltip>
      ) : (
        children
      )}
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, asChild }) => {
  return <>{children}</>;
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ children }) => {
  const { setContent } = React.useContext(TooltipContext);

  React.useEffect(() => {
    setContent?.(children);
  }, [children, setContent]);

  return null;
};
