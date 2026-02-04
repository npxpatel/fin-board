'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { extractValue, isArrayField, formatCellValue, stripArrayPath } from '@/lib/data-mapper';
import type { WidgetData } from '@/types/widget';
import type { SelectedField } from '@/types/widget';

type Row = { id: number; cells: { id: string; value: string }[] };

function getLabel(f: SelectedField): string {
  return f.label || f.path;
}

function buildRowsFromArray(data: unknown[], fields: SelectedField[], limit = 1000): Row[] {
  return data.slice(0, limit).map((item, rowIndex) => ({
    id: rowIndex,
    cells: fields.map((f) => ({
      id: `${f.path}-${rowIndex}`,
      value: formatCellValue(extractValue(item, stripArrayPath(f.path))),
    })),
  }));
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

function getHeaderFromPath(fullPath: string, basePath: string): string {
  const escaped = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return fullPath.replace(new RegExp(`^${escaped}\\[0\\]\\.?`), '').replace(/^[^.]*\[0\]\.?/, '') || fullPath.split(/[.[\]]/).pop() || fullPath;
}

function buildTableData(data: unknown, fields: SelectedField[]): { headers: string[]; rows: Row[] } {
  if (!data) return { headers: [], rows: [] };

  if (Array.isArray(data)) {
    const headers = fields.map(getLabel);
    const rows = buildRowsFromArray(data, fields);
    return { headers, rows };
  }

  const arrayPath = getArrayPath(data, fields);
  if (arrayPath) {
    const arr = extractValue(data, arrayPath);
    if (Array.isArray(arr)) {
      const nestedFields = fields.filter((f) => f.path !== arrayPath && f.path.startsWith(arrayPath));
      const headers = nestedFields.length > 0
        ? nestedFields.map((f) => getLabel(f) || getHeaderFromPath(f.path, arrayPath) || f.path.split(/[.[\]]/).pop() || 'Value')
        : arr[0] && typeof arr[0] === 'object'
          ? Object.keys(arr[0] as Record<string, unknown>)
          : ['Value'];
      const rows = arr.slice(0, 1000).map((item, rowIndex) => ({
        id: rowIndex,
        cells: headers.map((header) => ({
          id: `${header}-${rowIndex}`,
          value: formatCellValue(extractValue(item, header)),
        })),
      }));
      return { headers, rows };
    }
  }

  if (fields.length === 1) {
    const field = fields[0];
    const value = extractValue(data, field.path);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      const entries = Object.entries(obj);
      if (entries.length > 0) {
        const rows = entries.map(([key, val], index) => ({
          id: index,
          cells: [
            { id: `${key}-key`, value: key },
            { id: `${key}-value`, value: formatCellValue(val) },
          ],
        }));
        return { headers: ['Key', 'Value'], rows };
      }
    }
  }

  const rows = fields.map((field, index) => ({
    id: index,
    cells: [
      { id: `${field.path}-key`, value: getLabel(field) },
      { id: `${field.path}-value`, value: formatCellValue(extractValue(data, field.path)) },
    ],
  }));
  return { headers: ['Field', 'Value'], rows };
}

function filterRows(rows: Row[], search: string): Row[] {
  if (!search) return rows;
  const s = search.toLowerCase();
  return rows.filter((row) => row.cells.some((c) => c.value.toLowerCase().includes(s)));
}

function sortRows(rows: Row[], sortKey: string | null, headers: string[], dir: 'asc' | 'desc'): Row[] {
  if (!sortKey || headers.length === 0) return rows;
  const idx = headers.indexOf(sortKey);
  if (idx < 0) return rows;
  return [...rows].sort((a, b) => {
    const av = a.cells[idx]?.value ?? '';
    const bv = b.cells[idx]?.value ?? '';
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function WidgetTable({ widget }: { widget: WidgetData }) {
  const { config, data } = widget;
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const fields = config.selectedFields.length > 0 ? config.selectedFields : [{ path: 'data', label: 'Data' }];

  const { headers, rows } = useMemo(() => buildTableData(data, fields), [data, fields]);

  const filteredRows = useMemo(() => {
    let r = filterRows(rows, search);
    r = sortRows(r, sortKey, headers, sortDir);
    return r;
  }, [rows, search, sortKey, headers, sortDir]);

  const handleSort = (header: string) => {
    setSortKey(header);
    setSortDir((d) => (sortKey === header && d === 'asc' ? 'desc' : 'asc'));
  };

  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 py-2 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-600">
        <table className="min-w-[400px] w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-600 bg-zinc-800/50">
              {headers.map((header, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(header)}
                  className="cursor-pointer px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-white"
                >
                  <span className="flex items-center gap-1">
                    {header}
                    {sortKey === header && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredRows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-zinc-800/50">
                {row.cells.map((cell) => (
                  <td key={cell.id} className="max-w-[200px] truncate px-3 py-2 text-zinc-300" title={cell.value}>
                    {cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-xs text-zinc-500">
        {filteredRows.length} {filteredRows.length === 1 ? 'item' : 'items'}
      </p>
    </div>
  );
}
