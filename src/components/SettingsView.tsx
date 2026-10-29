import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Trash2,
  Moon,
  Sun,
  Smartphone,
  Sparkles,
  Info,
  CheckCircle,
  Cpu,
  Layers,
  Zap,
  HardDrive,
  Download,
  XCircle,
  Activity,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { AppSettings } from '../types';
import { SnapActionLogo } from './SnapActionLogo';
import { SmartAIRouter, AIPreference } from '../modules/router/smartAIRouter';
import { ChromeBuiltinEngine, ChromeBuiltinCapabilities } from '../modules/ai/chromeBuiltinEngine';
import { WebLLMEngine, WebLLMProgress } from '../modules/ai/webllmEngine';
import { TransformersEngine } from '../modules/ai/transformersEngine';
import { SUPPORTED_LOCAL_MODELS } from '../modules/ai/modelRegistry';

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
  // Local AI Engines Live Status
  const [hasWebGpu, setHasWebGpu] = useState<boolean | null>(null);
  const [chromeCaps, setChromeCaps] = useState<ChromeBuiltinCapabilities | null>(null);
  const [webllmProgress, setWebllmProgress] = useState<WebLLMProgress>({
    status: WebLLMEngine.isReady() ? 'ready' : 'idle',
    progress: WebLLMEngine.isReady() ? 100 : 0,
    text: WebLLMEngine.isReady() ? 'Model loaded in WebGPU memory' : 'Model not loaded (loads lazily on request)',
  });
  const [selectedWebllmModel, setSelectedWebllmModel] = useState<string>(
    WebLLMEngine.getActiveModel()?.id || 'SmolLM2-360M-Instruct-q4f16_1-MLC'
  );
  const [testSentimentResult, setTestSentimentResult] = useState<string | null>(null);
  const [isTestingSentiment, setIsTestingSentiment] = useState(false);
  const [routerStats, setRouterStats] = useState(SmartAIRouter.getStats());

  useEffect(() => {
    // 1. Probe WebGPU
    WebLLMEngine.isSupported().then((res) => setHasWebGpu(res.supported));

    // 2. Probe Chrome Built-in AI
    ChromeBuiltinEngine.checkCapabilities().then((caps) => setChromeCaps(caps));

    // 3. Listen to WebLLM download/load progress
    const unsubscribeWebllm = WebLLMEngine.onProgress((p) => {
      setWebllmProgress(p);
    });

    return () => {
      unsubscribeWebllm();
    };
  }, []);

  const handleModelChange = (modelId: string) => {
    setSelectedWebllmModel(modelId);
    WebLLMEngine.setActiveModel(modelId);
  };

  const handlePreloadModel = async () => {
    try {
      await WebLLMEngine.getEngine();
    } catch (e) {
      console.warn('Preload failed or cancelled', e);
    }
  };

  const handleUnloadModel = async () => {
    await WebLLMEngine.unload();
    setWebllmProgress({
      status: 'idle',
      progress: 0,
      text: 'Engine unloaded; VRAM memory freed.',
    });
  };

  const handleTestSentiment = async () => {
    setIsTestingSentiment(true);
    setTestSentimentResult(null);
    try {
      const sample = 'This product is exceptionally well crafted, very responsive, and saves tremendous time!';
      const res = await TransformersEngine.analyzeSentiment(sample);
      setTestSentimentResult(`Result: ${res.sentiment} (${Math.round(res.score * 100)}%) via ${res.engine}`);
      setRouterStats(SmartAIRouter.getStats());
    } catch (e: any) {
      setTestSentimentResult(`Error: ${e?.message}`);
    } finally {
      setIsTestingSentiment(false);
    }
  };

  const currentPreference: AIPreference = settings.aiPreference || 'automatic';

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Local AI
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Three-engine on-device AI integration, preferences, and privacy controls
        </p>
      </div>

      {/* 1. AI Processing Preference (Primary Architecture Section) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            AI Processing Preference
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Smart AI Router intelligently selects between on-device engines (Transformers.js, Chrome Built-in AI, WebLLM) and authorized cloud fallback.
        </p>

        <div className="space-y-2">
          {[
            {
              id: 'automatic' as AIPreference,
              title: '🟢 Automatic (Recommended)',
              desc: 'Prioritizes free on-device processing where capable; transparently falls back to cloud only for complex multimodal reasoning or rare languages.',
            },
            {
              id: 'prefer_on_device' as AIPreference,
              title: '⚡ Prefer On-Device',
              desc: 'Enforces on-device WebLLM, Chrome Built-in AI, and Transformers.js whenever possible for maximum local privacy and zero API token cost.',
            },
            {
              id: 'cloud_with_permission' as AIPreference,
              title: '☁️ Cloud AI With Permission',
              desc: 'Requires user confirmation before making any upstream cloud API calls; defaults to local heuristics otherwise.',
            },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => onUpdateSettings({ ...settings, aiPreference: option.id })}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                currentPreference === option.id
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">{option.title}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {option.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Three-Engine Local AI Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">🛠️</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Three Local AI Engines
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                WebLLM · Transformers.js · Chrome Built-in AI
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              hasWebGpu
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {hasWebGpu ? 'WebGPU Active' : 'WebGPU Unavailable'}
          </span>
        </div>

        {/* Engine 1: Hugging Face Transformers.js */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-750 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🤗</span>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Engine 1: Transformers.js
                </div>
                <div className="text-[10px] text-slate-500">
                  Lightweight on-device sentiment, intent classification & embeddings (WASM / WebGPU)
                </div>
              </div>
            </div>
            <button
              onClick={handleTestSentiment}
              disabled={isTestingSentiment}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isTestingSentiment ? 'Testing...' : 'Test Sentiment'}
            </button>
          </div>
          {testSentimentResult && (
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
              {testSentimentResult}
            </div>
          )}
        </div>

        {/* Engine 2: WebLLM */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-750 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚡</span>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Engine 2: WebLLM (WebGPU Generative AI)
                </div>
                <div className="text-[10px] text-slate-500">
                  Runs small instruction models directly in browser VRAM
                </div>
              </div>
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Active WebLLM Model
            </label>
            <select
              value={selectedWebllmModel}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={webllmProgress.status === 'downloading' || webllmProgress.status === 'loading'}
              className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {SUPPORTED_LOCAL_MODELS.filter((m) => m.runtime === 'web_llm').map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.sizeFormatted}) — {m.qualityBenchmark.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          {/* Status / Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[280px]">
                {webllmProgress.text}
              </span>
              {webllmProgress.progress > 0 && (
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {webllmProgress.progress}%
                </span>
              )}
            </div>

            {(webllmProgress.status === 'downloading' || webllmProgress.status === 'loading') && (
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${webllmProgress.progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Actions: Preload, Cancel, Unload */}
          <div className="flex items-center gap-2 pt-1">
            {webllmProgress.status === 'downloading' ? (
              <button
                onClick={() => WebLLMEngine.cancelInitialization()}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Cancel Download
              </button>
            ) : webllmProgress.status === 'ready' ? (
              <button
                onClick={handleUnloadModel}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                title="Free WebGPU memory"
              >
                Unload from VRAM
              </button>
            ) : (
              <button
                onClick={handlePreloadModel}
                disabled={!hasWebGpu}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                Preload Model ({SUPPORTED_LOCAL_MODELS.find((m) => m.id === selectedWebllmModel)?.sizeFormatted || '240 MB'})
              </button>
            )}
          </div>
        </div>

        {/* Engine 3: Chrome Built-in AI */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-750 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🌐</span>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Engine 3: Chrome Built-in AI
                </div>
                <div className="text-[10px] text-slate-500">
                  Zero-download native Gemini Nano, Summarizer, Writer & Translator
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                chromeCaps?.supported
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {chromeCaps?.supported ? 'Available' : 'Not Detected'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className={chromeCaps?.languageModel !== 'no' ? 'text-emerald-500' : 'text-slate-400'}>
                {chromeCaps?.languageModel !== 'no' ? '●' : '○'}
              </span>
              <span>Gemini Nano Prompt: {chromeCaps?.languageModel || 'no'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className={chromeCaps?.translator ? 'text-emerald-500' : 'text-slate-400'}>
                {chromeCaps?.translator ? '●' : '○'}
              </span>
              <span>Translator API: {chromeCaps?.translator ? 'yes' : 'no'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className={chromeCaps?.summarizer !== 'no' ? 'text-emerald-500' : 'text-slate-400'}>
                {chromeCaps?.summarizer !== 'no' ? '●' : '○'}
              </span>
              <span>Summarizer API: {chromeCaps?.summarizer || 'no'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className={chromeCaps?.writer !== 'no' ? 'text-emerald-500' : 'text-slate-400'}>
                {chromeCaps?.writer !== 'no' ? '●' : '○'}
              </span>
              <span>Writer API: {chromeCaps?.writer || 'no'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cost Control & On-Device Token Savings Tracker */}
      <div className="bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-violet-600/10 rounded-3xl p-5 border border-blue-500/20 dark:border-blue-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Local Processing & Cost Control Telemetry
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            {routerStats.percentLocal}% On-Device
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {routerStats.onDeviceActions}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
              Local Actions
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
              {routerStats.tokensSaved.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
              Tokens Saved
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {routerStats.cloudActions}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
              Cloud Calls
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
          Every action executed via Internal Code, Transformers.js, WebLLM, or Chrome Built-in AI reduces server latency and eliminates external API token consumption.
        </p>
      </div>

      {/* 4. Privacy Guarantee Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-transparent rounded-3xl p-5 border border-emerald-500/20 dark:border-emerald-500/30 space-y-3">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Screenshot Privacy Guarantee</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          Your screenshot is used <strong>only to perform the action you request</strong>.
        </p>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
          <li>On-device models process text completely offline in memory</li>
          <li>No automated external messages or emails sent without your review</li>
          <li>Screenshots are never sold or used to train third-party public models</li>
        </ul>
      </div>

      {/* 5. General Preferences Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          General Preferences
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

      {/* Diagnostics Modal Trigger */}
      {onOpenDiagnostics && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI System Health & Diagnostics
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live server metrics, latency benchmarks & local router telemetry
            </p>
          </div>
          <button
            onClick={onOpenDiagnostics}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
          >
            Diagnostics
          </button>
        </div>
      )}

      {/* About with Official Logo */}
      <div className="flex flex-col items-center justify-center text-center text-xs text-slate-400 dark:text-slate-500 space-y-2 pt-4">
        <SnapActionLogo size={36} variant="horizontal" />
        <p className="text-[11px] max-w-xs text-slate-500 dark:text-slate-400">
          Screenshot Anything. Turn It Into Action.
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Powered by WebLLM, Transformers.js, Chrome Built-in AI & Gemini Cloud Gateway
        </p>
      </div>
    </div>
  );
};
