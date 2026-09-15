import React from 'react';
import { clsx } from 'clsx';

interface LargeTouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'large' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Base button primitive — enforces 64px minimum touch target per design system.
 * All interactive actions should use this component.
 */
export function LargeTouchButton({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  className,
  ...rest
}: LargeTouchButtonProps) {
  const isDisabled = disabled || isLoading;

  const baseClasses = [
    // Touch target enforcement
    'relative inline-flex items-center justify-center gap-3',
    'font-semibold rounded-2xl transition-all duration-200',
    'select-none focus-visible:ring-4 focus-visible:ring-offset-2',
    'active:scale-95',
    fullWidth ? 'w-full' : '',
  ];

  const sizeClasses = {
    default: 'h-16 px-7 text-lg',        // 64px height
    large: 'h-20 px-8 text-xl',           // 80px height
    icon: 'h-16 w-16 p-0',               // 64×64 icon button
  };

  const variantClasses = {
    primary: [
      'bg-[rgb(var(--color-primary))] text-white',
      'hover:bg-[rgb(var(--color-primary-dark))]',
      'focus-visible:ring-[rgb(var(--color-primary))]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'shadow-lg shadow-[rgba(124,92,252,0.3)]',
    ].join(' '),
    secondary: [
      'bg-[rgb(var(--color-secondary))] text-white',
      'hover:bg-[rgb(var(--color-secondary-light))]',
      'focus-visible:ring-[rgb(var(--color-secondary))]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'shadow-lg shadow-[rgba(249,115,22,0.3)]',
    ].join(' '),
    ghost: [
      'bg-transparent text-[rgb(var(--color-text-primary))]',
      'border-2 border-[rgba(var(--color-text-primary),0.15)]',
      'hover:bg-[rgba(var(--color-primary),0.08)]',
      'hover:border-[rgba(var(--color-primary),0.3)]',
      'focus-visible:ring-[rgb(var(--color-primary))]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' '),
    danger: [
      'bg-[rgb(var(--color-error))] text-white',
      'hover:opacity-90',
      'focus-visible:ring-[rgb(var(--color-error))]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' '),
  };

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={clsx(baseClasses, sizeClasses[size], variantClasses[variant], className)}
    >
      {isLoading ? (
        <>
          <span
            className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <span>Just a moment…</span>
        </>
      ) : (
        <>
          {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
          {children}
          {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
