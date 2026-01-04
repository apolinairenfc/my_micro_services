import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]',
        className
      )}
      {...props}
    />
  );
};

export default Badge;
