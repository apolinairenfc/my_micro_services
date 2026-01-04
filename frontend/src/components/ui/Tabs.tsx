import { ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
}

const Tabs = ({ items }: TabsProps) => {
  const [active, setActive] = useState(items[0]?.id ?? '');

  const current = items.find((item) => item.id === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={cn(
              'rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold transition',
              active === item.id
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{current?.content}</div>
    </div>
  );
};

export default Tabs;
