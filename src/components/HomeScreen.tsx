import React, { useRef, useState, useEffect } from 'react';
import { Plus, UploadCloud, Clipboard, Camera, Share2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_SCREENSHOTS, svgToPngBase64, SampleItem } from '../utils/samples';
import { optimizeScreenshot } from '../utils/imageCompressor';
import { SnapActionLogo } from './SnapActionLogo';

interface HomeScreenProps {
  onImageSelected: (imageBase64: string, mimeType: string, filename?: string) => void;
  isProcessing?: boolean;
  onOpenPdfStudio?: () => void;
  onOpenToolsDirectory?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onImageSelected,
  isProcessing,
  onOpenPdfStudio,
  onOpenToolsDirectory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [sampleLoadingId, setSampleLoadingId] = useState<string | null>(null);

  // Global paste handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPasteError('Please select a valid image screenshot');
      return;
    }
    setPasteError(null);
    try {
      const optimized = await optimizeScreenshot(file, 1280, 0.85);
      onImageSelected(optimized.base64, optimized.mimeType, file.name);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (base64) {
          onImageSelected(base64, file.type, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClipboardClick = async () => {
    setPasteError(null);
    try {
      if (!navigator.clipboard?.read) {
        setPasteError('Clipboard read not supported by browser. Press Ctrl+V / Cmd+V instead.');
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          try {
            const file = new File([blob], 'clipboard-screenshot.png', { type: imageType });
            const optimized = await optimizeScreenshot(file, 1280, 0.85);
            onImageSelected(optimized.base64, optimized.mimeType, 'clipboard-screenshot.png');
          } catch {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              if (base64) onImageSelected(base64, imageType, 'clipboard-screenshot.png');
            };
            reader.readAsDataURL(blob);
          }
          return;
        }
      }
      setPasteError('No image found in clipboard. Copy a screenshot first!');
    } catch (err: any) {
      console.warn('Clipboard read error', err);
      setPasteError('Clipboard permission needed or press Ctrl+V / Cmd+V directly.');
    }
  };

  const handleSampleClick = async (sample: SampleItem) => {
    try {
      setSampleLoadingId(sample.id);
      const svg = sample.getSvg();
      const pngBase64 = await svgToPngBase64(svg, 800, 600);
      onImageSelected(pngBase64, 'image/png', `${sample.id}-sample-screenshot.png`);
    } catch (err) {
      console.error('Failed to load sample', err);
    } finally {
      setSampleLoadingId(null);
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SnapAction AI',
        text: 'Turn any screenshot into useful actions instantly.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleClipboardClick();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto transition-colors ${
        isDragging ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
      }`}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Hero Header with Official SnapAction AI Logo */}
      <div className="text-center mb-8 space-y-4">
        {/* Official Branded Emblem Badge */}
        <div className="flex flex-col items-center">
          <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-blue-500/10 mb-2">
            <SnapActionLogo size={80} variant="icon-only" showGlow />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide mt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Screenshot → Understand → Recommend → Act
          </div>

          {onOpenToolsDirectory && (
            <button
              onClick={onOpenToolsDirectory}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer shadow-2xs mt-2"
            >
              <span>🛠️</span>
              <span>8 Powerful AI Tools</span>
              <span className="text-[11px] font-medium text-indigo-500 dark:text-indigo-400 underline ml-0.5">
                How to use & benefits →
              </span>
            </button>
          )}
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center">
            <span>SnapActio</span>
            <span className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 bg-clip-text text-transparent">
              n
            </span>
            <span className="ml-1.5">AI</span>
          </h1>

          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1.5">
            Screenshot Anything.{' '}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Turn It Into Action.
            </span>
          </p>
        </div>
      </div>

      {/* Drag & Drop Visual Indicator Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-blue-600/10 dark:bg-blue-500/20 backdrop-blur-sm border-4 border-dashed border-blue-500 flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-white dark:bg-slate-900 px-8 py-6 rounded-3xl shadow-2xl text-center space-y-2">
            <UploadCloud className="w-14 h-14 text-blue-600 dark:text-blue-400 mx-auto animate-bounce" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">Drop screenshot right here</p>
            <p className="text-sm text-slate-500">We will instantly analyze it</p>
          </div>
        </div>
      )}

      {/* Central Card with Massive CTA Button */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800 text-center space-y-6 relative overflow-hidden">
        {/* Subtle ambient gradient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Large Central Action Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white p-5 sm:p-6 shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-90 transition-transform">
              <Plus className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight">
              + Add Screenshot
            </span>
          </div>
        </button>

        {/* Supporting Trigger Methods */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 transition-colors group cursor-pointer"
          >
            <UploadCloud className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 transition-colors" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Drag & Drop
            </span>
          </button>

          <button
            onClick={handleClipboardClick}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 transition-colors group cursor-pointer"
          >
            <Clipboard className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 transition-colors" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paste Screenshot
            </span>
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 transition-colors group cursor-pointer"
          >
            <Camera className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 transition-colors" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Take Photo
            </span>
          </button>

          <button
            onClick={handleShareClick}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 transition-colors group cursor-pointer"
          >
            <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 transition-colors" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Share Screenshot
            </span>
          </button>
        </div>

        {/* Small Supporting Message */}
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pt-1">
          We&apos;ll understand it and suggest what to do next.
        </p>

        {pasteError && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs text-center border border-amber-200 dark:border-amber-800">
            {pasteError}
          </div>
        )}
      </div>

      {/* Smart PDF Studio Fast Launch Card */}
      {onOpenPdfStudio && (
        <div className="w-full mt-6">
          <button
            onClick={onOpenPdfStudio}
            className="w-full text-left p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-100">
                  <span>📄</span> Smart PDF Studio
                </div>
                <div className="text-base sm:text-lg font-black tracking-tight">
                  Turn Messy Notes Into Professional Documents
                </div>
                <div className="text-xs text-blue-100/90 line-clamp-1">
                  Random Notes → Understand → Organize → Professionally Write → PDF & DOCX
                </div>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0 ml-3">
                <span className="text-base font-bold">→</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Examples section: Try a screenshot */}
      <div className="w-full mt-6 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Try a screenshot
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            1-tap instant test
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SAMPLE_SCREENSHOTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample)}
              disabled={sampleLoadingId === sample.id || isProcessing}
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <span className="text-2xl mb-1">{sample.emoji}</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate w-full">
                {sample.title}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full mt-0.5">
                {sample.id === 'chat' && 'Slack chat'}
                {sample.id === 'job' && 'LinkedIn job'}
                {sample.id === 'chart' && 'Tata Motors'}
                {sample.id === 'receipt' && 'Cafe invoice'}
                {sample.id === 'product' && 'Headphones'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy note under home screen */}
      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
        <span>🔒</span>
        <span>Your screenshot is used only to perform the action you request.</span>
      </div>
    </div>
  );
};
