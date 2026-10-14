import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Edit3,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Mail,
  Send,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { ActionExecutionResult } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ResultViewProps {
  actionResult: ActionExecutionResult;
  onTransform: (transformationPrompt: string) => void;
  onTryAnother: () => void;
  isTransforming: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({
  actionResult,
  onTransform,
  onTryAnother,
  isTransforming,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [editedText, setEditedText] = useState(actionResult.resultText);
  const [customTransformInput, setCustomTransformInput] = useState('');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Synchronize when actionResult changes
  React.useEffect(() => {
    setEditedText(actionResult.resultText);
  }, [actionResult.resultText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SnapAction: ${actionResult.actionName}`,
          text: editedText,
        });
        setShareFeedback('Shared successfully!');
        setTimeout(() => setShareFeedback(null), 2500);
      } catch (err) {
        // User may have cancelled
      }
    } else {
      // Fallback copy
      handleCopy();
      setShareFeedback('Copied to clipboard (Device sharing not supported)');
      setTimeout(() => setShareFeedback(null), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(editedText.substring(0, 1500));
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`SnapAction: ${actionResult.actionName}`);
    const body = encodeURIComponent(editedText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSmsShare = () => {
    const body = encodeURIComponent(editedText.substring(0, 1000));
    window.open(`sms:?body=${body}`, '_blank');
  };

  const handleTransformSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTransformInput.trim() || isTransforming) return;
    onTransform(customTransformInput.trim());
    setCustomTransformInput('');
  };

  // Transformation suggestions for action chaining
  const transformChains = [
    {
      label: '📊 Convert into Table',
      prompt:
        'Convert all information, metrics, line items, and details from this result into a clean, well-formatted Markdown table with clear column headers (e.g. Item, Description, Value, Category). Ensure valid Markdown table syntax.',
    },
    { label: 'Make Shorter', prompt: 'Make this significantly shorter and more concise while keeping all core facts.' },
    { label: 'Make More Professional', prompt: 'Rewrite in an executive, high-polish, professional tone.' },
    { label: 'Turn Into LinkedIn Post', prompt: 'Adapt this into an engaging LinkedIn post with a hook and 3 hashtags.' },
    { label: 'Translate to Spanish', prompt: 'Translate this entire output accurately into Spanish.' },
    { label: 'Format as Bullet Points', prompt: 'Reformat all information into clear, organized bullet points.' },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Transformation Chain Breadcrumbs */}
      {actionResult.transformationChain && actionResult.transformationChain.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs text-slate-500 dark:text-slate-400 no-scrollbar">
          {actionResult.transformationChain.map((step, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
                  idx === actionResult.transformationChain.length - 1
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {step}
              </span>
              {idx < actionResult.transformationChain.length - 1 && (
                <span className="text-slate-400">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main Result Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-black/40 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Result
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {actionResult.actionName}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {!isEditing && (
              <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode('formatted')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'formatted'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Table View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'raw'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Raw
                </button>
              </div>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="relative">
          {isTransforming && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl z-10 space-y-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Transforming into table...
              </span>
            </div>
          )}

          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={12}
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
            />
          ) : viewMode === 'raw' ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-blue-500 selection:text-white overflow-x-auto">
              {editedText}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-750 text-sm text-slate-800 dark:text-slate-200 leading-relaxed selection:bg-blue-500 selection:text-white overflow-hidden">
              <MarkdownRenderer content={editedText} />
            </div>
          )}
        </div>

        {/* Primary Action Buttons: Copy, Share, Try Another */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleCopy}
            className={`py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={handleNativeShare}
            className="py-3 px-3 rounded-2xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button
            onClick={onTryAnother}
            className="py-3 px-3 rounded-2xl font-semibold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Another
          </button>
        </div>

        {shareFeedback && (
          <div className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-1">
            {shareFeedback}
          </div>
        )}

        {/* Send To quick native destinations */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Send To
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNativeShare}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              Apps
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200/50 dark:border-emerald-800/50 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp
            </button>
            <button
              onClick={handleEmailShare}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-200/50 dark:border-blue-800/50 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Gmail
            </button>
            <button
              onClick={handleSmsShare}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              SMS
            </button>
          </div>
        </div>
      </div>

      {/* Result Transformation (Action Chaining) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Transform or Chain Result
          </h4>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Refine without re-uploading your screenshot:
        </p>

        {/* Quick transformation chips */}
        <div className="flex flex-wrap gap-1.5">
          {transformChains.map((chain, idx) => (
            <button
              key={idx}
              onClick={() => onTransform(chain.prompt)}
              disabled={isTransforming}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{chain.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>

        {/* Custom refinement input */}
        <form onSubmit={handleTransformSubmit} className="relative pt-1">
          <input
            type="text"
            placeholder="Type a custom instruction (e.g. 'Add a bullet on pricing', 'Translate to German')..."
            value={customTransformInput}
            onChange={(e) => setCustomTransformInput(e.target.value)}
            disabled={isTransforming}
            className="w-full pl-4 pr-11 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={!customTransformInput.trim() || isTransforming}
            className="absolute right-1.5 top-2.5 w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-opacity cursor-pointer"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
