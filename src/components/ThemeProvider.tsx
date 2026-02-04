'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import type { DashboardState } from '@/store/dashboard-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useDashboardStore((s: DashboardState) => s.theme);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
