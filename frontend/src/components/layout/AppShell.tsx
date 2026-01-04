import { ReactNode, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <div className="flex">
        <Sidebar isMobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="gradient-surface flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
