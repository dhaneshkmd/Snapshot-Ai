import { AppSettings, HistoryItem } from '../types';

const HISTORY_KEY = 'snapaction_history_v1';
const SETTINGS_KEY = 'snapaction_settings_v1';

export function getStoredSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read settings', e);
  }
  return {
    autoDeleteScreenshots: false,
    theme: 'system',
  };
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function getStoredHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read history', e);
  }
  return [];
}

export function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
  const current = getStoredHistory();
  const settings = getStoredSettings();

  const newItem: HistoryItem = {
    ...item,
    id: 'snap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    // Respect auto-delete setting:
    thumbnail: settings.autoDeleteScreenshots ? '' : item.thumbnail,
  };

  const updated = [newItem, ...current.slice(0, 49)]; // keep latest 50 items
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history item', e);
  }
  return newItem;
}

export function updateHistoryItem(id: string, updates: Partial<HistoryItem>): void {
  const current = getStoredHistory();
  const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update history', e);
  }
}

export function deleteHistoryItem(id: string): void {
  const current = getStoredHistory();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete history item', e);
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}
