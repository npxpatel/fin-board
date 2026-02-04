import type { ApiFieldInfo } from '@/types/api';

export function extractValue(obj: unknown, path: string): unknown {
  const parts = path
    .split('.')
    .flatMap((p) =>
      p.includes('[') ? [p.split('[')[0], '[' + p.split('[').slice(1).join('[')] : [p]
    )
    .filter(Boolean);
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;

    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      current = (current as unknown[])[parseInt(match[1], 10)];
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }

  return current;
}

export function flattenObject(
  obj: unknown,
  prefix = '',
  result: ApiFieldInfo[] = []
): ApiFieldInfo[] {
  if (obj === null || obj === undefined) {
    return result;
  }

  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      const sample = obj[0];
      result.push({
        path: prefix,
        type: 'array',
        sampleValue: sample,
      });
      flattenObject(sample, `${prefix}[0]`, result);
    }
    return result;
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flattenObject(value, newPath, result);
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          result.push({
            path: newPath,
            type: 'array',
            sampleValue: value[0],
          });
          flattenObject(value[0], `${newPath}[0]`, result);
        } else {
          result.push({ path: newPath, type: 'array', sampleValue: null });
        }
      } else {
        result.push({
          path: newPath,
          type: typeof value,
          sampleValue: value,
        });
      }
    }
  }

  return result;
}

export function getLabelFromPath(path: string): string {
  const parts = path.split(/[.[\]]/).filter(Boolean);
  return parts[parts.length - 1] || path;
}

export function isArrayField(data: unknown, path: string): boolean {
  return Array.isArray(extractValue(data, path));
}

export function formatCellValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return '-';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export function toNum(v: unknown): number {
  if (typeof v === 'number' && !isNaN(v)) return v;
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

export function stripArrayPath(path: string): string {
  return path.replace(/^\[?\d+\]?\.?/, '');
}
