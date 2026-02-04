'use client';

import { Plus } from 'lucide-react';
import { useDashboardStore, type DashboardState } from '@/store/dashboard-store';

export function AddWidgetPlaceholder() {
  const openAddModal = useDashboardStore((s: DashboardState) => s.openAddModal);

  return (
    <button
      onClick={openAddModal}
      className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-emerald-500/50 bg-zinc-900/30 p-8 transition-colors hover:border-emerald-500 hover:bg-zinc-900/50"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
        <Plus className="h-8 w-8 text-emerald-500" />
      </div>
      <span className="font-semibold text-white">Add Widget</span>
      <p className="max-w-xs text-center text-sm text-zinc-400">
        Connect to a finance API and create a custom widget
      </p>
    </button>
  );
}
