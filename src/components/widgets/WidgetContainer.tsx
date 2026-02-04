'use client';

import { useState } from 'react';
import {
  LayoutGrid,
  RefreshCw,
  Settings,
  Trash2,
  Loader2,
  AlertCircle,
  Table,
  LineChart,
} from 'lucide-react';
import { useWidgetData } from '@/hooks/useWidgetData';
import { useDashboardStore, type DashboardState } from '@/store/dashboard-store';
import { WidgetCard } from './WidgetCard';
import { WidgetTable } from './WidgetTable';
import { WidgetChart } from './WidgetChart';
import type { WidgetDisplayMode } from '@/types/widget';

const MODES: WidgetDisplayMode[] = ['card', 'table', 'chart'];

export function WidgetContainer({ widgetId }: { widgetId: string }) {
  const { widget, refetch } = useWidgetData(widgetId);
  const removeWidget = useDashboardStore((s: DashboardState) => s.removeWidget);
  const updateWidget = useDashboardStore((s: DashboardState) => s.updateWidget);

  if (!widget) return null;

  const { config, isLoading, error } = widget;

  const handleModeChange = (mode: WidgetDisplayMode) => {
    if (mode === config.displayMode) return;
    updateWidget(config.id, { displayMode: mode });
  };

  const renderContent = () => {
    if (isLoading && !widget.data) {
      return (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-red-400">
          <AlertCircle className="h-10 w-10" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 rounded bg-zinc-700 px-3 py-1 text-sm hover:bg-zinc-600"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (config.displayMode) {
      case 'table':
        return <WidgetTable widget={widget} />;
      case 'chart':
        return <WidgetChart widget={widget} />;
      default:
        return <WidgetCard widget={widget} />;
    }
  };

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-emerald-500" />
          <div className="space-y-1">
            <h3 className="font-semibold text-white">{config.name}</h3>
            <p className="text-xs text-zinc-500">
              Refresh every {config.refreshInterval}s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-zinc-800/70 p-1">
            {MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeChange(mode)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs capitalize transition-colors ${
                  config.displayMode === mode
                    ? 'bg-emerald-500 text-white'
                    : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
                title={`Show as ${mode}`}
              >
                {mode === 'card' && <LayoutGrid className="h-3 w-3" />}
                {mode === 'table' && <Table className="h-3 w-3" />}
                {mode === 'chart' && <LineChart className="h-3 w-3" />}
                <span>{mode}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => refetch()}
              className="rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => {}}
              className="rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => removeWidget(config.id)}
              className="rounded p-2 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {renderContent()}

      {widget.lastUpdated && (
        <p className="mt-4 text-center text-xs text-zinc-500">
          Last updated: {widget.lastUpdated}
        </p>
      )}
    </div>
  );
}

