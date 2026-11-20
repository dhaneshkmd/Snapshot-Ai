import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Eye,
  Server,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
} from 'lucide-react';
import { SnapActionIntelligenceRouter } from '../modules/router/intelligenceRouter';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingVision, setIsTestingVision] = useState(false);
  const [routerTelemetry, setRouterTelemetry] = useState<any>(null);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (e) {
      console.error('Failed to fetch health data:', e);
    } finally {
      setIsLoading(false);
      setRouterTelemetry(SnapActionIntelligenceRouter.getTelemetry());
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const handleTestVisionModel = async () => {
    setIsTestingVision(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/health/test-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setTestResult(data);
      // Refresh health counts
      await fetchHealth();
    } catch (e: any) {
      setTestResult({
        status: 'error',
        error: e.message || 'Vision test failed',
      });
    } finally {
      setIsTestingVision(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI System Health & Diagnostics
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Live
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AIProviderService & SnapAction Intelligence Router
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={fetchHealth}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh Diagnostics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Architecture Operating Principle Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              Hybrid Intelligence Routing Constitution
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Use AI when AI is required</strong> (Multimodal worksite vision, natural multilingual replies).
              <strong> Use internal programming when sufficient</strong> (OCR caching, 5x5 risk calculations, docx/csv export).
            </p>
          </div>

          {/* Model Roles & Provider Status */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Vision Model Role
              </span>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-orange-500" />
                {healthData?.metrics?.activeVisionModel || 'gemini-2.5-flash'}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                Multimodal Image Capable
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Text Model Role
              </span>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                {healthData?.metrics?.activeTextModel || 'gemini-2.5-flash'}
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">
                Fast Low-Latency Inference
              </span>
            </div>
          </div>

          {/* Interactive Vision Model Test Button */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Verify Vision Pipeline
              </div>
              <button
                onClick={handleTestVisionModel}
                disabled={isTestingVision}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingVision ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Testing Vision...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-3 h-3" />
                    Test Vision Model
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Sends an end-to-end multimodal image payload through AIProviderService to verify real vision inference.
            </p>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-[11px] font-mono border ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                }`}
              >
                {testResult.status === 'success' ? (
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Status: PASSED ({testResult.latencyMs}ms)
                    </div>
                    <div>Model: {testResult.modelUsed}</div>
                    <div>Output: "{testResult.output}"</div>
                  </div>
                ) : (
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Error: {testResult.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Routes & Telemetry */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Active Server Routes (All Operational)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {(healthData?.activeRoutes || ['/api/analyze-screenshot', '/api/execute-action', '/api/local-ocr', '/api/health']).map(
                (route: string) => (
                  <div
                    key={route}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <span className="font-mono text-slate-700 dark:text-slate-300">{route}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Session Metrics */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Provider Telemetry & Router State
            </span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {healthData?.metrics?.totalRequests ?? 0}
                </div>
                <div className="text-[10px] text-slate-400">Total API Calls</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <div className="text-base font-black text-emerald-600">
                  {healthData?.metrics?.successfulRequests ?? 0}
                </div>
                <div className="text-[10px] text-slate-400">Successes</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <div className="text-base font-black text-blue-600">
                  {healthData?.metrics?.lastLatencyMs ? `${healthData.metrics.lastLatencyMs}ms` : '—'}
                </div>
                <div className="text-[10px] text-slate-400">Last Latency</div>
              </div>
            </div>
            {routerTelemetry && (
              <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between">
                <span>Last Routed Task: {routerTelemetry.lastTask}</span>
                <span className="font-semibold text-blue-600">{routerTelemetry.lastMode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
