import React, { useState } from 'react';
import {
  Clock,
  Star,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
  Search,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onOpenItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRenameItem: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  onBackToHome: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyItems,
  onOpenItem,
  onDeleteItem,
  onToggleFavorite,
  onRenameItem,
  onClearAll,
  onBackToHome,
}) => {
  const [search, setSearch] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = historyItems.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.contentType.toLowerCase().includes(search.toLowerCase()) ||
      item.lastAction.toLowerCase().includes(search.toLowerCase());
    const matchesFav = !filterFavorites || item.isFavorite;
    return matchesSearch && matchesFav;
  });

  const handleStartRename = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameItem(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Screenshot History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {historyItems.length} {historyItems.length === 1 ? 'saved action' : 'saved actions'}
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search & Favorites Filter */}
      {historyItems.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1 transition-colors cursor-pointer ${
              filterFavorites
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-current' : ''}`} />
            Starred
          </button>
        </div>
      )}

      {/* History List */}
      {historyItems.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">No history yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Take or upload a screenshot to see your transformed actions saved here.
          </p>
          <button
            onClick={onBackToHome}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
          >
            Add Screenshot
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">
          No matching items found.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenItem(item)}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 cursor-pointer relative"
            >
              {/* Thumbnail or Fallback Icon */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0 space-y-0.5">
                {editingId === item.id ? (
                  <form
                    onSubmit={(e) => handleSaveRename(item.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white w-full"
                    />
                    <button
                      type="submit"
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <button
                      onClick={(e) => handleStartRename(item, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 transition-opacity"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 truncate">
                    {item.lastAction}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400 text-[11px] shrink-0">
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {item.lastResult}
                </p>
              </div>

              {/* Actions: Favorite / Delete */}
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    item.isFavorite
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={item.isFavorite ? 'Remove star' : 'Star action'}
                >
                  <Star
                    className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`}
                  />
                </button>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
