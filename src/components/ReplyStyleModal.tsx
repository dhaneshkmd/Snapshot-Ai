import React, { useState } from 'react';
import { X, Search, Sparkles, Star, Check } from 'lucide-react';
import {
  REPLY_STYLES,
  ReplyStyle,
  ReplyStyleCategory,
  searchReplyStyles,
} from '../modules/styles/replyStyleRegistry';

interface ReplyStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStyleId: string;
  secondaryStyleId?: string | null;
  onSelectStyle: (styleId: string, isSecondary?: boolean) => void;
  favoriteStyleIds: string[];
  onToggleFavorite: (styleId: string) => void;
}

const CATEGORIES: ReplyStyleCategory[] = [
  'Everyday',
  'Agreement & Disagreement',
  'Assertive & Persuasive',
  'Humour & Creative',
  'Emotional & Relationship',
  'Professional & Specialist',
  'Social Media',
  'Cultural & Language',
];

export const ReplyStyleModal: React.FC<ReplyStyleModalProps> = ({
  isOpen,
  onClose,
  selectedStyleId,
  secondaryStyleId,
  onSelectStyle,
  favoriteStyleIds,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReplyStyleCategory | 'All' | 'Favorites'>('All');
  const [isSelectingSecondary, setIsSelectingSecondary] = useState(false);

  if (!isOpen) return null;

  let filtered = searchReplyStyles(searchQuery);
  if (selectedCategory === 'Favorites') {
    filtered = filtered.filter((s) => favoriteStyleIds.includes(s.id));
  } else if (selectedCategory !== 'All') {
    filtered = filtered.filter((s) => s.category === selectedCategory);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[82vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                Reply Style Library
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  96 Styles
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the exact tone, reasoning framing, and substance of your reply
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Style Combination Mode Switch */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Target:</span>
            <button
              onClick={() => setIsSelectingSecondary(false)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                !isSelectingSecondary
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Primary Style
            </button>
            <button
              onClick={() => setIsSelectingSecondary(true)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                isSelectingSecondary
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              + Secondary Blend
              {secondaryStyleId && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          </div>
          {secondaryStyleId && (
            <button
              onClick={() => onSelectStyle('', true)}
              className="text-[11px] text-red-500 hover:underline cursor-pointer"
            >
              Clear Blend
            </button>
          )}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search style (e.g. sarcastic, scientific, leadership, one-liner, witty)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-850">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            All (96)
          </button>
          {favoriteStyleIds.length > 0 && (
            <button
              onClick={() => setSelectedCategory('Favorites')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                selectedCategory === 'Favorites'
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              Starred ({favoriteStyleIds.length})
            </button>
          )}
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Styles Grid List */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching reply styles found. Try searching for "friendly", "disagreement", or "funny".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((style) => {
                const isPrimary = selectedStyleId === style.id;
                const isSecondary = secondaryStyleId === style.id;
                const isFav = favoriteStyleIds.includes(style.id);

                return (
                  <div
                    key={style.id}
                    onClick={() => {
                      onSelectStyle(style.id, isSelectingSecondary);
                      if (!isSelectingSecondary) {
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isPrimary
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-900/30 ring-1 ring-blue-500'
                        : isSecondary
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-900/30 ring-1 ring-indigo-500'
                        : 'border-slate-200/70 dark:border-slate-700/60 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          {style.name}
                          {isPrimary && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-blue-600 text-white font-bold rounded">
                              Primary
                            </span>
                          )}
                          {isSecondary && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-indigo-600 text-white font-bold rounded">
                              Blend
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(style.id);
                          }}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            isFav
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-300 hover:text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                        {style.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-750 font-medium">
                        {style.category}
                      </span>
                      <span className="capitalize">{style.defaultLength}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
