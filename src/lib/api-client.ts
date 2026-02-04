const CACHE_KEY_PREFIX = 'api_cache_';
const CACHE_DURATION_MS = 60000; // 1 minute default

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

function getCacheKey(url: string): string {
  return CACHE_KEY_PREFIX + btoa(url);
}

export async function fetchApiData(
  url: string,
  useCache = true,
  cacheDurationMs = CACHE_DURATION_MS
): Promise<unknown> {
  const cacheKey = getCacheKey(url);

  if (useCache) {
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheDurationMs) {
      return cached.data;
    }
  }

  try {
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (useCache) {
      memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch API data');
  }
}

export function clearCacheForUrl(url: string): void {
  memoryCache.delete(getCacheKey(url));
}

export function clearAllCache(): void {
  memoryCache.clear();
}
