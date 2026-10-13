import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface AnalyzingViewProps {
  imageThumbnail: string;
}

export const AnalyzingView: React.FC<AnalyzingViewProps> = ({ imageThumbnail }) => {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  useEffect(() => {
    // Fast progressive steps to keep user engaged while Gemini computes
    const t1 = setTimeout(() => setStep1Done(true), 650);
    const t2 = setTimeout(() => setStep2Done(true), 1400);
    const t3 = setTimeout(() => setStep3Done(true), 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto text-center space-y-6">
      {/* Thumbnail with scanning effect */}
      <div className="relative w-48 h-64 sm:w-56 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-2 border-blue-500/30 bg-slate-900 group">
        <img
          src={imageThumbnail}
          alt="Analyzing screenshot"
          className="w-full h-full object-cover opacity-80"
        />

        {/* Luminous scanning beam */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-[scan_2s_ease-in-out_infinite]" />

        {/* Corner glow badges */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-semibold text-blue-300 flex items-center gap-1 border border-blue-500/20">
          <Sparkles className="w-3 h-3 text-blue-400 animate-spin" />
          Analyzing
        </div>
      </div>

      {/* Main Title */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Understanding your screenshot...
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Extracting visual meaning and intent
        </p>
      </div>

      {/* Progressive Step Checklist */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5 text-left">
        {/* Step 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step1Done ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
            )}
            <span
              className={`text-sm font-medium ${
                step1Done ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Reading content
            </span>
          </div>
          {step1Done && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              Done
            </span>
          )}
        </div>

        {/* Step 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step2Done ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : step1Done ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
            )}
            <span
              className={`text-sm font-medium ${
                step2Done
                  ? 'text-slate-900 dark:text-white'
                  : step1Done
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              Understanding context
            </span>
          </div>
          {step2Done && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              Done
            </span>
          )}
        </div>

        {/* Step 3 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step3Done ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : step2Done ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
            )}
            <span
              className={`text-sm font-medium ${
                step3Done
                  ? 'text-slate-900 dark:text-white'
                  : step2Done
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              Finding useful actions
            </span>
          </div>
          {step3Done && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              Ready
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
