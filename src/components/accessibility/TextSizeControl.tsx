import { clsx } from 'clsx';
import type { TextSize } from '../../types/types';
import { useAccessibility } from '../../context/AccessibilityContext';

interface TextSizeControlProps {
  className?: string;
}

const SIZE_OPTIONS: { value: TextSize; label: string; sample: string }[] = [
  { value: 'standard', label: 'Standard', sample: 'Aa' },
  { value: 'large', label: 'Large', sample: 'Aa' },
  { value: 'extra-large', label: 'Extra Large', sample: 'Aa' },
];

const SAMPLE_SIZES: Record<TextSize, string> = {
  'standard': 'text-base',
  'large': 'text-xl',
  'extra-large': 'text-3xl',
};

export function TextSizeControl({ className }: TextSizeControlProps) {
  const { settings, setTextSize } = useAccessibility();

  return (
    <div className={clsx('space-y-3', className)}>
      <p
        id="text-size-label"
        className="font-semibold text-[rgb(var(--color-text-primary))]"
        style={{ fontSize: 'var(--text-lg)' }}
      >
        Text Size
      </p>
      <div
        role="radiogroup"
        aria-labelledby="text-size-label"
        className="flex gap-3"
      >
        {SIZE_OPTIONS.map(({ value, label, sample }) => {
          const isSelected = settings.textSize === value;
          return (
            <button
              key={value}
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTextSize(value)}
              className={clsx(
                'flex-1 flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 min-h-[80px]',
                isSelected
                  ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.08)] text-[rgb(var(--color-primary))]'
                  : 'border-[rgba(var(--color-text-primary),0.15)] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]'
              )}
            >
              <span
                className={clsx('font-bold', SAMPLE_SIZES[value])}
                aria-hidden="true"
              >
                {sample}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
