'use client';

import { BarChart3, Plus, Sun, Moon } from 'lucide-react';
import { useDashboardStore, type DashboardState } from '@/store/dashboard-store';

export function Header() {
  const widgetCount = useDashboardStore((s: DashboardState) => s.widgets.length);
  const openAddModal = useDashboardStore((s: DashboardState) => s.openAddModal);
  const theme = useDashboardStore((s: DashboardState) => s.theme);
  const toggleTheme = useDashboardStore((s: DashboardState) => s.toggleTheme);

  return (
    <header className="flex items-center justify-between border-b border-zinc-700/50 bg-zinc-900/50 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Finance Dashboard</h1>
          <p className="text-sm text-zinc-400">
            {widgetCount} active widget{widgetCount !== 1 ? 's' : ''} · Real-time
            data
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus className="h-5 w-5" />
          Add Widget
        </button>
      </div>
    </header>
  );
}
