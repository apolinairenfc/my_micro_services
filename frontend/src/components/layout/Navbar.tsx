import ThemeToggle from '../ThemeToggle';
import { clearAuth, getUser } from '../../store/auth';
import Button from '../ui/Button';
import { toast } from '../../lib/toast';

const Navbar = () => {
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    toast.info('Logged out.');
    window.location.assign('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            My Micro Services
          </p>
          <h1 className="text-lg font-semibold">Chat Orchestrator</h1>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden text-right text-sm md:block">
              <p className="font-semibold">{user.username}</p>
              <p className="text-xs text-[var(--color-muted)]">{user.email}</p>
            </div>
          )}
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
