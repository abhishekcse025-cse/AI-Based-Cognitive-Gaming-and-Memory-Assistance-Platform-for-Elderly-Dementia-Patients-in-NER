import React from 'react';
import { clsx } from 'clsx';

interface IconLabelProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  layout?: 'vertical' | 'horizontal';
  iconSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Icon + large label pairing used consistently across cards and buttons.
 * Ensures icon and text are always visually balanced.
 */
export function IconLabel({
  icon,
  label,
  sublabel,
  layout = 'vertical',
  iconSize = 'md',
  className,
}: IconLabelProps) {
  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const layoutClasses = {
    vertical: 'flex-col text-center',
    horizontal: 'flex-row text-left',
  };

  return (
    <div className={clsx('flex items-center gap-3', layoutClasses[layout], className)}>
      <span
        className={clsx(
          'flex items-center justify-center flex-shrink-0',
          iconSizeClasses[iconSize]
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className={layout === 'vertical' ? 'mt-2' : ''}>
        <span
          className="block font-bold leading-tight"
          style={{ fontSize: 'var(--text-xl)' }}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className="block text-[rgb(var(--color-text-secondary))] mt-1"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
