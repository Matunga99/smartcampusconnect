import React from 'react';

interface ScrollableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollableWrapper({ children, className = '' }: ScrollableWrapperProps) {
  return (
    <div className={`flex flex-col h-full overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}
