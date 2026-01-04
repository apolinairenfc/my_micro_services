import { ReactNode } from 'react';
import Card from './Card';

interface DialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

const Dialog = ({ open, title, description, onClose, children }: DialogProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-lg space-y-4">
        {(title || description) && (
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && <p className="text-sm text-[var(--color-muted)]">{description}</p>}
          </div>
        )}
        {children}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm font-semibold text-[var(--color-muted)]"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dialog;
