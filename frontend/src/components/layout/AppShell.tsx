import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="gradient-surface flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
