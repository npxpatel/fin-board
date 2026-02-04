'use client';

import { useEffect, useRef } from 'react';
import { fetchApiData } from '@/lib/api-client';
import { useDashboardStore, type DashboardState } from '@/store/dashboard-store';

export function useWidgetData(widgetId: string) {
  const widget = useDashboardStore((s: DashboardState) => s.widgets.find((w: DashboardState['widgets'][number]) => w.config.id === widgetId));
  const setWidgetData = useDashboardStore((s: DashboardState) => s.setWidgetData);
  const setWidgetLoading = useDashboardStore((s: DashboardState) => s.setWidgetLoading);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    if (!widget) return;
    setWidgetLoading(widgetId, true);

    try {
      const data = await fetchApiData(
        widget.config.apiUrl,
        true,
        widget.config.refreshInterval * 1000
      );
      setWidgetData(widgetId, data, null);
    } catch (error) {
      setWidgetData(
        widgetId,
        null,
        error instanceof Error ? error.message : 'Failed to fetch'
      );
    }
  };

  useEffect(() => {
    if (!widget) return;

    fetchData();

    intervalRef.current = setInterval(
      fetchData,
      widget.config.refreshInterval * 1000
    );

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [widget?.config.apiUrl, widget?.config.refreshInterval]);

  return { widget, refetch: fetchData };
}
