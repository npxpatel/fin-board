import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { WidgetConfig, WidgetData } from '@/types/widget';

export type Theme = 'light' | 'dark';

export interface DashboardState {
  widgets: WidgetData[];
  theme: Theme;
  isAddModalOpen: boolean;
  editingWidgetId: string | null;
  addWidget: (config: Omit<WidgetConfig, 'id'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, config: Partial<WidgetConfig>) => void;
  setWidgetData: (id: string, data: unknown, error?: string | null) => void;
  setWidgetLoading: (id: string, isLoading: boolean) => void;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  openAddModal: () => void;
  openEditModal: (id: string) => void;
  closeAddModal: () => void;
  exportConfig: () => string;
  importConfig: (json: string) => boolean;
}

type PersistedState = Pick<DashboardState, 'widgets' | 'theme'>;

export const useDashboardStore = create<DashboardState>()(
  persist<DashboardState, [], [], PersistedState>(
    (set) => ({
      widgets: [],
      theme: 'dark',
      isAddModalOpen: false,
      editingWidgetId: null,

      addWidget: (config) =>
        set((state) => ({
          widgets: [
            ...state.widgets,
            {
              config: { ...config, id: uuidv4() },
              data: null,
              lastUpdated: '',
              isLoading: true,
              error: null,
            },
          ],
        })),

      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.config.id !== id),
        })),

      updateWidget: (id, config) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.config.id === id
              ? { ...w, config: { ...w.config, ...config } }
              : w
          ),
        })),

      setWidgetData: (id, data, error = null) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.config.id === id
              ? {
                  ...w,
                  data,
                  error,
                  lastUpdated: new Date().toLocaleTimeString(),
                  isLoading: false,
                }
              : w
          ),
        })),

      setWidgetLoading: (id, isLoading) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.config.id === id ? { ...w, isLoading } : w
          ),
        })),

      reorderWidgets: (startIndex, endIndex) =>
        set((state) => {
          const result = [...state.widgets];
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { widgets: result };
        }),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      openAddModal: () => set({ isAddModalOpen: true, editingWidgetId: null }),
      openEditModal: (id: string) => set({ isAddModalOpen: true, editingWidgetId: id }),
      closeAddModal: () => set({ isAddModalOpen: false, editingWidgetId: null }),

      exportConfig: (): string => {
        const state = useDashboardStore.getState();
        return JSON.stringify(
          {
            widgets: state.widgets.map((w: WidgetData) => w.config),
            theme: state.theme,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      },

      importConfig: (json) => {
        try {
          const parsed = JSON.parse(json);
          const configs: WidgetConfig[] = parsed.widgets || [];
          const theme: Theme = parsed.theme || 'dark';

          set((state) => ({
            widgets: configs.map((config) => ({
              config: { ...config, id: uuidv4() },
              data: null,
              lastUpdated: '',
              isLoading: true,
              error: null,
            })),
            theme,
          }));
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'finance-dashboard-storage',
      partialize: (state): PersistedState => ({
        widgets: state.widgets.map((w) => ({
          ...w,
          data: null,
          isLoading: false,
          error: null,
          lastUpdated: '',
        })),
        theme: state.theme,
      }),
    }
  )
);
