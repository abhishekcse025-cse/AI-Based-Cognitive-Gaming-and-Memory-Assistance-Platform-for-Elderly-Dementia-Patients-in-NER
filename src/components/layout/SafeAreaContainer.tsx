import React from 'react';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Handles notch/safe-area padding for tablets and phones.
 * Uses env(safe-area-inset-*) which is defined as CSS variables in index.css.
 */
export function SafeAreaContainer({ children, className = '' }: SafeAreaContainerProps) {
  return (
    <div
      className={className}
      style={{
        paddingTop: 'var(--safe-top)',
        paddingBottom: 'var(--safe-bottom)',
        paddingLeft: 'var(--safe-left)',
        paddingRight: 'var(--safe-right)',
      }}
    >
      {children}
    </div>
  );
}
