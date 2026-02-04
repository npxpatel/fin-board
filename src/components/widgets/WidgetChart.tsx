'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { extractValue, isArrayField, toNum, stripArrayPath } from '@/lib/data-mapper';
import type { WidgetData } from '@/types/widget';
import type { SelectedField } from '@/types/widget';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function formatYAxis(value: number) {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(2);
}

function getLabel(f: SelectedField, fallback: string) {
  return f.label || f.path || fallback;
}

function buildPointsFromArray(
  arr: unknown[],
  fields: SelectedField[],
  limit = 100
): Record<string, unknown>[] {
  return arr.slice(0, limit).map((item, index) => {
    const point: Record<string, unknown> = { index };
    fields.forEach((f) => {
      const path = stripArrayPath(f.path);
      point[getLabel(f, path)] = toNum(extractValue(item, path));
    });
    return point;
  });
}

function getNumericKeys(points: Record<string, unknown>[]): string[] {
  if (points.length === 0) return [];
  const first = points[0] || {};
  return Object.keys(first).filter((k) => k !== 'index' && typeof first[k] === 'number');
}

function buildBarItems(
  data: unknown,
  fields: SelectedField[]
): { name: string; value: number; isNumeric: boolean; originalValue: unknown }[] {
  return fields.map((f) => {
    const v = extractValue(data, f.path);
    const num = toNum(v);
    const isNum = typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '');
    return {
      name: getLabel(f, 'value'),
      value: isNum ? num : 0,
      isNumeric: isNum,
      originalValue: v,
    };
  });
}

function getArrayPath(data: unknown, fields: SelectedField[]): string | undefined {
  const directArray = fields.find((x) => x.path && isArrayField(data, x.path));
  if (directArray?.path) return directArray.path;
  
  const nested = fields.find((f) => f.path && f.path.includes('['));
  if (nested?.path) {
    const basePath = nested.path.split('[')[0];
    if (basePath && isArrayField(data, basePath)) return basePath;
  }
  
  return undefined;
}

function getRelativePath(fullPath: string, basePath: string): string {
  if (fullPath.startsWith(basePath + '[')) {
    return fullPath.replace(new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[\\d+\\]\\.?`), '');
  }
  if (fullPath.startsWith(basePath + '.')) return fullPath.slice(basePath.length + 1);
  return fullPath;
}

function buildChartData(
  data: unknown,
  fields: SelectedField[]
): { chartData: unknown[]; numericFields: string[]; chartType: 'line' | 'bar' } {
  if (!data) return { chartData: [], numericFields: [], chartType: 'bar' };

  if (Array.isArray(data)) {
    const points = buildPointsFromArray(data, fields);
    const numericFields = getNumericKeys(points);
    const chartType = points.length > 5 ? 'line' : 'bar';
    return { chartData: points, numericFields, chartType };
  }

  const arrayPath = getArrayPath(data, fields);
  if (arrayPath) {
    const arr = extractValue(data, arrayPath);
    if (Array.isArray(arr) && arr.length > 0) {
      const nestedFields = fields.filter(
        (f) => f.path !== arrayPath && (f.path.startsWith(arrayPath + '[') || f.path.startsWith(arrayPath + '.'))
      );
      const points = arr.slice(0, 100).map((item, index) => {
        const point: Record<string, unknown> = { index };
        if (nestedFields.length > 0) {
          nestedFields.forEach((f) => {
            const path = getRelativePath(f.path, arrayPath);
            point[getLabel(f, path)] = toNum(extractValue(item, path));
          });
        } else if (typeof item === 'object' && item !== null) {
          Object.entries(item as Record<string, unknown>).forEach(([k, v]) => {
            const n = toNum(v);
            if (!isNaN(n) && typeof v !== 'boolean' && v != null) point[k] = n;
          });
        }
        return point;
      });
      const numericFields = nestedFields.length > 0 ? getNumericKeys(points) : Object.keys(points[0] || {}).filter((k) => k !== 'index');
      return { chartData: points, numericFields, chartType: points.length > 5 ? 'line' : 'bar' };
    }
  }

  const chartData = buildBarItems(data, fields);
  return { chartData, numericFields: ['value'], chartType: 'bar' };
}

type BarEntry = { name?: string; value?: number; isNumeric?: boolean; originalValue?: unknown };

function barValue(d: unknown): number | null {
  const e = d as BarEntry;
  if (e?.value != null && e?.isNumeric && e.value > 0) return e.value;
  return null;
}

function barName(e: BarEntry, i: number): string {
  return (e?.name != null ? String(e.name) : `field-${i}`);
}

export function WidgetChart({ widget }: { widget: WidgetData }) {
  const { config, data } = widget;
  const fields = config.selectedFields;
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [useLogScale, setUseLogScale] = useState(false);

  const { chartData, numericFields, chartType } = useMemo(
    () => buildChartData(data, fields),
    [data, fields]
  );

  const hasLargeScaleDiff = useMemo(() => {
    if (chartType !== 'bar') return false;
    const values = chartData.map(barValue).filter((v): v is number => v != null);
    if (values.length < 2) return false;
    return Math.max(...values) / Math.min(...values) > 100;
  }, [chartData, chartType]);

  const displayData = useMemo(() => {
    if (!focusedField) return chartData;
    return chartData.filter((d) => barName(d as BarEntry, 0) === focusedField);
  }, [chartData, focusedField]);

  const toggleFocus = (name: string) => setFocusedField((prev) => (prev === name ? null : name));

  if (chartData.length === 0 || numericFields.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        No data to chart
      </div>
    );
  }

  const Chart = chartType === 'line' ? LineChart : BarChart;
  const tooltipFormatter = (value: number | undefined, _name?: string, item?: { payload?: BarEntry }) => {
    if (value == null) return ['', 'value'];
    const p = item?.payload;
    if (p?.isNumeric === false && p.originalValue != null) return [String(p.originalValue), 'value'];
    return [value.toLocaleString(), 'value'];
  };

  return (
    <div className="flex h-full flex-col p-2">
      <div className="mb-1 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          {focusedField && (
            <>
              <span className="text-xs text-zinc-400">
                Showing: <span className="font-medium text-emerald-400">{focusedField}</span>
              </span>
              <button onClick={() => setFocusedField(null)} className="rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white">
                ✕
              </button>
            </>
          )}
        </div>
        {hasLargeScaleDiff && chartType === 'bar' && !focusedField && (
          <button
            onClick={() => setUseLogScale((x) => !x)}
            className={`rounded px-2 py-0.5 text-xs transition-colors ${
              useLogScale ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
            title="Log scale"
          >
            Log
          </button>
        )}
      </div>
      <div className="min-h-[200px] flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <Chart data={displayData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" />
            <XAxis
              dataKey={chartType === 'line' ? 'index' : 'name'}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: '#475569' }}
              tickFormatter={formatYAxis}
              width={60}
              scale={useLogScale ? 'log' : 'auto'}
              domain={useLogScale ? ['auto', 'auto'] : [0, 'auto']}
              allowDataOverflow={useLogScale}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={tooltipFormatter}
            />
            {chartType === 'line' && numericFields.length > 1 && (
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            )}
            {chartType === 'line' ? (
              numericFields.map((field, i) => (
                <Line key={field} type="monotone" dataKey={field} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              ))
            ) : (
              <Bar dataKey="value" radius={[4, 4, 0, 0]} onClick={(d) => d?.name && toggleFocus(d.name)} style={{ cursor: 'pointer' }} legendType="none">
                {displayData.map((entry, i) => {
                  const name = barName(entry as BarEntry, i);
                  const idx = chartData.findIndex((d) => barName(d as BarEntry, 0) === name);
                  const colorIdx = idx >= 0 ? idx : i;
                  const num = barValue(entry);
                  return <Cell key={`cell-${i}`} fill={COLORS[colorIdx % COLORS.length]} opacity={num != null ? 1 : 0.3} />;
                })}
              </Bar>
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
      {chartType === 'bar' && (
        <div className="flex flex-wrap justify-center gap-4 pb-1 pt-2">
          {chartData.map((entry, i) => {
            const name = barName(entry as BarEntry, i);
            const num = barValue(entry);
            const clickable = num != null;
            return (
              <div key={name} className="group relative">
                <button
                  onClick={() => clickable && toggleFocus(name)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    !clickable ? 'cursor-not-allowed text-zinc-600' : focusedField === name ? 'font-medium text-emerald-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${!clickable ? 'opacity-30' : ''}`} style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {name}
                </button>
                {!clickable && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded border border-red-500 bg-zinc-900 px-2 py-1 text-xs text-red-400 opacity-0 transition-opacity group-hover:opacity-100">
                    Non-numeric
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
