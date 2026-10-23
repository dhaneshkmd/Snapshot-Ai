import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeftRight, Image as ImageIcon } from 'lucide-react';
import { HazardObservation } from '../../modules/hse/hseTypes';

interface BeforeAfterComparisonProps {
  beforePhotoSrc: string;
  afterPhotoSrc?: string | null;
  onUploadAfterPhoto: (base64: string) => void;
  observations: HazardObservation[];
  closureNotes: string;
  onChangeClosureNotes: (notes: string) => void;
  isVerifiedByInspector: boolean;
  onToggleInspectorVerification: (verified: boolean) => void;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  beforePhotoSrc,
  afterPhotoSrc,
  onUploadAfterPhoto,
  observations,
  closureNotes,
  onChangeClosureNotes,
  isVerifiedByInspector,
  onToggleInspectorVerification,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('side-by-side');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      if (b64) onUploadAfterPhoto(b64);
    };
    reader.readAsDataURL(file);
  };

  const openCount = observations.filter((o) => o.actionStatus !== 'Closed').length;

  return (
    <div className="space-y-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
            Before & After Verification
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Compare initial findings with implemented controls
          </p>
        </div>

        {afterPhotoSrc && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                viewMode === 'side-by-side' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                viewMode === 'slider' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Split View
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Comparison Area */}
      {!afterPhotoSrc ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Initial Photograph (Before)
            </span>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-56">
              <img src={beforePhotoSrc} alt="Before" className="w-full h-56 object-cover" />
            </div>
          </div>

          <div className="space-y-1 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Rectification Photograph (After)
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[224px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors group"
            >
              <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Upload Corrective Action Photo
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Take or select a photo of the completed safety control
              </span>
            </button>
          </div>
        </div>
      ) : viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="uppercase text-rose-600 dark:text-rose-400">Before (Unsafe State)</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
              <img src={beforePhotoSrc} alt="Before" className="w-full h-56 object-cover" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="uppercase text-emerald-600 dark:text-emerald-400">After (Rectified State)</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Change Photo
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
              <img src={afterPhotoSrc} alt="After" className="w-full h-56 object-cover" />
            </div>
          </div>
        </div>
      ) : (
        /* Slider Mode */
        <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 select-none">
          <img
            src={beforePhotoSrc}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={afterPhotoSrc}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: '100%' }}
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-slate-800 font-bold text-[10px]">
              ⇄
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
            After
          </div>
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
            Before
          </div>
        </div>
      )}

      {/* Mandatory Inspector Sign-off Guardrail (Requirement 10) */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 space-y-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>Standard Guardrail:</strong> Do not automatically assume a hazard is eliminated merely because it is no longer visible in the second photo. Formal on-site verification by a competent person is mandatory for closure sign-off.
          </p>
        </div>

        <label className="flex items-center gap-2.5 pt-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isVerifiedByInspector}
            onChange={(e) => onToggleInspectorVerification(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-0"
          />
          <span>Inspector has verified physical control closure and approved residual risk</span>
        </label>
      </div>

      {/* Closure Review Notes */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
          Closure Verification Notes & Permit References
        </label>
        <textarea
          rows={2}
          value={closureNotes}
          onChange={(e) => onChangeClosureNotes(e.target.value)}
          placeholder="State verification observations, e.g. 'Trench box installed by contractor; edge guardrails verified at 1.1m; air test completed...'"
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
        />
      </div>
    </div>
  );
};
