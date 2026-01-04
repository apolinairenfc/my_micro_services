import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-[var(--color-bg-soft)]',
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
