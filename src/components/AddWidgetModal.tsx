'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Loader2, Plus, Check } from 'lucide-react';
import { useDashboardStore, type DashboardState } from '@/store/dashboard-store';
import type { WidgetDisplayMode, SelectedField } from '@/types/widget';
import type { ApiFieldInfo } from '@/types/api';
import { getLabelFromPath } from '@/lib/data-mapper';

export function AddWidgetModal() {
  const closeAddModal = useDashboardStore((s: DashboardState) => s.closeAddModal);
  const addWidget = useDashboardStore((s: DashboardState) => s.addWidget);
  const updateWidget = useDashboardStore((s: DashboardState) => s.updateWidget);
  const isOpen = useDashboardStore((s: DashboardState) => s.isAddModalOpen);
  const editingWidgetId = useDashboardStore((s: DashboardState) => s.editingWidgetId);
  const widgets = useDashboardStore((s: DashboardState) => s.widgets);

  const [name, setName] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<WidgetDisplayMode>('card');
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [fieldSearch, setFieldSearch] = useState('');
  const [availableFields, setAvailableFields] = useState<ApiFieldInfo[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  const handleTest = useCallback(async () => {
    if (!apiUrl.trim()) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: apiUrl.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setAvailableFields(data.fields || []);
        setTestResult({
          success: true,
          message: `API connection successful! ${data.fields?.length || 0} top-level fields found.`,
        });
      } else {
        setTestResult({ success: false, message: data.error || 'Test failed' });
      }
    } catch {
      setTestResult({ success: false, message: 'Network error' });
    } finally {
      setIsTesting(false);
    }
  }, [apiUrl]);

  const addField = (field: ApiFieldInfo) => {
    if (selectedFields.some((f) => f.path === field.path)) return;
    setSelectedFields((prev) => [
      ...prev,
      { path: field.path, label: getLabelFromPath(field.path) },
    ]);
  };

  const removeField = (path: string) => {
    setSelectedFields((prev) => prev.filter((f) => f.path !== path));
  };

  const editingWidget = editingWidgetId ? widgets.find((w) => w.config.id === editingWidgetId) : null;

  useEffect(() => {
    if (editingWidget && isOpen) {
      setName(editingWidget.config.name);
      setApiUrl(editingWidget.config.apiUrl);
      setRefreshInterval(editingWidget.config.refreshInterval);
      setDisplayMode(editingWidget.config.displayMode);
      setSelectedFields(editingWidget.config.selectedFields);
      if (editingWidget.data) {
        setTestResult({ success: true, message: 'Widget loaded' });
      }
    } else if (!editingWidgetId && isOpen) {
      setName('');
      setApiUrl('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
      setRefreshInterval(30);
      setDisplayMode('card');
      setSelectedFields([]);
      setFieldSearch('');
      setAvailableFields([]);
      setTestResult(null);
    }
  }, [editingWidgetId, isOpen, editingWidget]);

  const handleSubmit = () => {
    if (!name.trim() || !apiUrl.trim()) return;
    const config = {
      name: name.trim(),
      apiUrl: apiUrl.trim(),
      refreshInterval,
      displayMode,
      selectedFields: selectedFields.length > 0 ? selectedFields : [{ path: '', label: 'data' }],
    };
    if (editingWidgetId) {
      updateWidget(editingWidgetId, config);
    } else {
      addWidget(config);
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setName('');
    setApiUrl('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
    setRefreshInterval(30);
    setDisplayMode('card');
    setSelectedFields([]);
    setFieldSearch('');
    setAvailableFields([]);
    setTestResult(null);
    closeAddModal();
  };

  const filteredFields = availableFields.filter((f) => {
    const matchesSearch = fieldSearch ? f.path.toLowerCase().includes(fieldSearch.toLowerCase()) : true;
    return matchesSearch;
  });

  const isValid = name.trim() && apiUrl.trim() && (testResult?.success || editingWidgetId);

  const formatSampleValue = (v: unknown): string => {
    if (v == null) return 'null';
    if (typeof v === 'number') {
      if (v > 1e6) return `${(v / 1e6).toFixed(1)}M`;
      if (v > 1e3) return `${(v / 1e3).toFixed(1)}K`;
      return v.toFixed(2);
    }
    const str = String(v);
    return str.length > 15 ? str.slice(0, 15) + '...' : str;
  };

  const getFieldDisplayName = (path: string): string => {
    const parts = path.split(/[.[\]]/).filter(Boolean);
    return parts[parts.length - 1] || path;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{editingWidgetId ? 'Edit Widget' : 'Add New Widget'}</h2>
          <button
            onClick={resetAndClose}
            className="rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Widget Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bitcoin Price Tracker"
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              API URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {isTesting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Test'
                )}
              </button>
            </div>
            {testResult && (
              <p
                className={`mt-2 text-sm ${
                  testResult.success ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {testResult.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              min={5}
              max={3600}
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value) || 30)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {(testResult?.success || editingWidgetId) && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Select Fields to Display
                </label>
                <div className="flex gap-2">
                  {(['card', 'table', 'chart'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDisplayMode(mode)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                        displayMode === mode
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <input
                    type="text"
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    placeholder="Search for fields..."
                    className="mb-2 w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500"
                  />
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-600 bg-zinc-800/50">
                    {filteredFields.map((field) => (
                      <div
                        key={field.path}
                        className="flex items-center gap-2 border-b border-zinc-700/50 px-3 py-2 transition-colors hover:bg-zinc-700/30 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-zinc-200">
                              {getFieldDisplayName(field.path)}
                            </span>
                            <span className="shrink-0 rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-400">
                              {field.type}
                            </span>
                          </div>
                          <div className="mt-0.5 truncate text-xs text-zinc-500">
                            {field.path}
                          </div>
                        </div>
                        {field.sampleValue != null && (
                          <span className="shrink-0 text-xs text-zinc-400">
                            {formatSampleValue(field.sampleValue)}
                          </span>
                        )}
                        <button
                          onClick={() => addField(field)}
                          className="shrink-0 rounded p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/20"
                          title="Add field"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-300">
                    Selected Fields
                  </p>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-600 bg-zinc-800/50">
                    {selectedFields.map((f) => (
                      <div
                        key={f.path}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <span className="text-sm text-zinc-300">{f.label}</span>
                        <button
                          onClick={() => removeField(f.path)}
                          className="rounded p-1 text-red-400 hover:bg-red-500/20"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-700 bg-zinc-900/50 px-6 py-4">
          <button
            onClick={resetAndClose}
            className="rounded-lg px-4 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {editingWidgetId ? 'Save Changes' : 'Add Widget'}
          </button>
        </div>
      </div>
    </div>
  );
}
