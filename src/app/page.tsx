'use client';

import { Header } from '@/components/Header';
import { AddWidgetModal } from '@/components/AddWidgetModal';
import { DashboardGrid } from '@/components/DashboardGrid';
import { useDashboardStore, type DashboardState } from '@/store/dashboard-store';
import { BarChart3, Download, Upload } from 'lucide-react';
import { useRef } from 'react';

export default function Home() {
  const widgets = useDashboardStore((s: DashboardState) => s.widgets);
  const exportConfig = useDashboardStore((s: DashboardState) => s.exportConfig);
  const importConfig = useDashboardStore((s: DashboardState) => s.importConfig);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const json = reader.result as string;
      if (importConfig(json)) {
        window.location.reload();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isEmpty = widgets.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <AddWidgetModal />

      <main className="container mx-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-24">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-500/20">
              <BarChart3 className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white">
              Build Your Finance Dashboard
            </h2>
            <p className="mb-12 max-w-lg text-center text-zinc-400">
              Create custom widgets by connecting to any finance API. Track
              stocks, crypto, forex, or economic indicators - all in real time.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => useDashboardStore.getState().openAddModal()}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-600"
              >
                Add Your First Widget
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-zinc-600 px-6 py-3 text-zinc-300 hover:bg-zinc-800"
              >
                <Upload className="h-5 w-5" />
                Import Config
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end gap-2 px-6 pt-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <Download className="h-4 w-4" />
                Export Config
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
            </div>
            <DashboardGrid />
          </>
        )}
      </main>
    </div>
  );
}
