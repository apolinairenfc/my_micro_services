import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

const SidebarContent = () => (
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
      <NavLink
        to="/app/admin"
        className={({ isActive }) =>
          cn(
            'rounded-xl px-4 py-3 text-sm font-semibold transition',
            isActive
              ? 'bg-[var(--color-card)] text-[var(--color-text)] shadow-soft'
              : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
          )
        }
      >
        Admin Playground
      </NavLink>
    </nav>
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-xs text-[var(--color-muted)]">
      API #3 connector controls discussions + messages through API #1 and API #2.
    </div>
  </div>
);

const Sidebar = ({ isMobileOpen, onClose }: SidebarProps) => {
  return (
    <>
      <aside className="hidden w-64 border-r border-[var(--color-border)] bg-[var(--color-bg-soft)] p-6 lg:block">
        <SidebarContent />
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div className="h-full w-72 bg-[var(--color-bg-soft)] p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Menu</p>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
