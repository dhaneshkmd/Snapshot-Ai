import React from 'react';
import {
  ShieldCheck,
  Trash2,
  Moon,
  Sun,
  Smartphone,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import { AppSettings } from '../types';
import { SnapActionLogo } from './SnapActionLogo';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearHistory: () => void;
  pwaInstallPrompt?: any;
  onInstallPwa?: () => void;
  onOpenDiagnostics?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  pwaInstallPrompt,
  onInstallPwa,
  onOpenDiagnostics,
}) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Privacy
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Preferences, privacy guardrails, and account tiers
        </p>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-transparent rounded-3xl p-5 border border-emerald-500/20 dark:border-emerald-500/30 space-y-3">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Screenshot Privacy Guarantee</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          Your screenshot is used <strong>only to perform the action you request</strong>.
        </p>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
          <li>No automated external messages or emails sent without your review</li>
          <li>No automated job applications or web form submissions</li>
          <li>No automated financial trading or transactions</li>
          <li>Screenshots are never sold or used to train third-party public models</li>
        </ul>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Preferences
        </h3>

        {/* Auto-delete toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5 pr-4">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Auto-delete screenshots after analysis
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only retains the generated text output and removes image thumbnails from device memory.
            </p>
          </div>
          <button
            onClick={() =>
              onUpdateSettings({
                ...settings,
                autoDeleteScreenshots: !settings.autoDeleteScreenshots,
              })
            }
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              settings.autoDeleteScreenshots
                ? 'bg-blue-600'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                settings.autoDeleteScreenshots ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Theme Preference */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Appearance
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your interface color style
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'system' })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                settings.theme === 'system'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              System
            </button>
          </div>
        </div>

        {/* PWA Install */}
        {pwaInstallPrompt && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Add to Home Screen / Mobile App
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Install as a progressive web app for quick native screenshot sharing.
              </p>
            </div>
            <button
              onClick={onInstallPwa}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm cursor-pointer shrink-0"
            >
              Install
            </button>
          </div>
        )}

        {/* Clear Data */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              Clear History & Cache
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Remove all stored screenshots and action results from this device.
            </p>
          </div>
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer shrink-0"
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* AI System Health & Diagnostics (Section 19) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">⚡</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AI System Health & Diagnostics
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AIProviderService live metrics, vision test & router status
              </p>
            </div>
          </div>
          {onOpenDiagnostics && (
            <button
              onClick={onOpenDiagnostics}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
            >
              Open Diagnostics
            </button>
          )}
        </div>
      </div>

      {/* Plan Overview (Section 27) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Plan & Limits
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Active: Free Tier
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/60 space-y-1">
            <div className="text-xs font-bold text-blue-700 dark:text-blue-300">FREE</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              Unlimited multimodal screenshot understanding, 3 top actions & native share.
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1 opacity-80">
            <div className="text-xs font-bold text-slate-900 dark:text-white">PRO (Coming)</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Saved custom workflows, extended history & batch screenshot processing.
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1 opacity-80">
            <div className="text-xs font-bold text-slate-900 dark:text-white">BUSINESS</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Shared team workflows, automated routing & API webhook integration.
            </div>
          </div>
        </div>
      </div>

      {/* About with Official Logo */}
      <div className="flex flex-col items-center justify-center text-center text-xs text-slate-400 dark:text-slate-500 space-y-2 pt-4">
        <SnapActionLogo size={36} variant="horizontal" />
        <p className="text-[11px] max-w-xs text-slate-500 dark:text-slate-400">
          Screenshot Anything. Turn It Into Action.
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Powered by Gemini Multimodal Visual Engine & Local Intelligence
        </p>
      </div>
    </div>
  );
};
