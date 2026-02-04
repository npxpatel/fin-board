export type WidgetDisplayMode = 'card' | 'table' | 'chart';

export interface SelectedField {
  path: string;
  label: string;
}

export interface WidgetConfig {
  id: string;
  name: string;
  apiUrl: string;
  refreshInterval: number; // seconds
  displayMode: WidgetDisplayMode;
  selectedFields: SelectedField[];
}

export interface WidgetData {
  config: WidgetConfig;
  data: unknown;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
}
