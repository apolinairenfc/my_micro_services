import { ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';

interface DropdownItem {
  label: string;
  onClick: () => void;
}

interface DropdownProps {
  label: ReactNode;
  items: DropdownItem[];
}

const Dropdown = ({ label, items }: DropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold"
        onClick={() => setOpen((prev) => !prev)}
      >
        {label}
      </button>
      {open && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-2 shadow-soft'
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--color-bg-soft)]"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
