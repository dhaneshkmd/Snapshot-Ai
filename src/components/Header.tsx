import React from 'react';
import { Sparkles, Clock, Settings as SettingsIcon, Home, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentTab: 'home' | 'history' | 'settings';
  onSelectTab: (tab: 'home' | 'history' | 'settings') => void;
  historyCount: number;
  darkMode: boolean;
  onToggleTheme: () => void;
  onResetToHome: () => void;
  pwaInstallPrompt?: any;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  historyCount,
  darkMode,
  onToggleTheme,
  onResetToHome,
  pwaInstallPrompt,
  onInstallPwa,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onResetToHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              SnapAction
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                AI
              </span>
            </span>
          </div>
        </button>

        {/* Action icons / Navigation */}
        <div className="flex items-center gap-1.5">
          {pwaInstallPrompt && (
            <button
              onClick={onInstallPwa}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
            >
              Install App
            </button>
          )}

          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={() => onSelectTab('history')}
            aria-label="View history"
            className={`w-9 h-9 rounded-xl relative flex items-center justify-center transition-colors ${
              currentTab === 'history'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            aria-label="Settings"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              currentTab === 'settings'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {currentTab !== 'home' && (
            <button
              onClick={onResetToHome}
              className="ml-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
            >
              <Home className="w-3.5 h-3.5" />
              New
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
