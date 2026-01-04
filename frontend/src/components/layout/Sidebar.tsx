import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const Sidebar = () => {
  return (
    <aside className="hidden w-64 border-r border-[var(--color-border)] bg-[var(--color-bg-soft)] p-6 lg:block">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Navigation
        </p>
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/app/discussions"
            className={({ isActive }) =>
              cn(
                'rounded-xl px-4 py-3 text-sm font-semibold transition',
                isActive
                  ? 'bg-[var(--color-card)] text-[var(--color-text)] shadow-soft'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              )
            }
          >
            Discussions
          </NavLink>
        </nav>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-xs text-[var(--color-muted)]">
          API #3 connector controls discussions + messages through API #1 and API #2.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
