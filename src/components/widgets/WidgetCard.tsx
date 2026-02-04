'use client';

import { extractValue } from '@/lib/data-mapper';
import type { WidgetData } from '@/types/widget';

function format(v: unknown): string {
  if (v == null) return '-';
  if (typeof v === 'number') return v > 1000 || v < 0.01 ? v.toExponential(2) : v.toLocaleString();
  return String(v);
}

export function WidgetCard({ widget }: { widget: WidgetData }) {
  const { config, data } = widget;
  const fields = config.selectedFields.length > 0 ? config.selectedFields : [{ path: 'data', label: 'Value' }];

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const value = field.path ? extractValue(data, field.path) : data;
        return (
          <div key={field.path || field.label} className="rounded-lg bg-zinc-800/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{field.label}</p>
            <p className="mt-1 truncate text-2xl font-semibold text-white">{format(value)}</p>
          </div>
        );
      })}
    </div>
  );
}
