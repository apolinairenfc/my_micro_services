import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-soft',
        className
      )}
      {...props}
    />
  );
};

export default Card;
