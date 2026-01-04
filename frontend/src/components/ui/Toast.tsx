import { useEffect, useState } from 'react';
import { subscribeToasts, ToastMessage } from '../../lib/toast';
import { cn } from '../../lib/utils';

const styles: Record<string, string> = {
  success: 'border-[var(--color-success)] text-[var(--color-success)]',
  error: 'border-[var(--color-error)] text-[var(--color-error)]',
  info: 'border-[var(--color-accent)] text-[var(--color-accent)]',
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 3500);
    });
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-2xl border bg-[var(--color-card)] px-4 py-3 text-sm font-medium shadow-soft',
            styles[toast.type]
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
