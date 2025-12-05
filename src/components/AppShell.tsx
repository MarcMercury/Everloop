'use client';

import { usePathname } from 'next/navigation';
import GlobalNav from '@/components/navigation/GlobalNav';

// Pages that should NOT show the global navigation (auth pages, landing)
const NO_NAV_PATHS = ['/', '/login', '/signup'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !NO_NAV_PATHS.includes(pathname);

  if (!showNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalNav />
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
}
