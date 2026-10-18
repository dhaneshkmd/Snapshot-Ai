import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, Eye, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { AnalysisResult, SuggestedAction } from '../types';

interface ActionSelectionViewProps {
  imageThumbnail: string;
  analysis: AnalysisResult;
  onSelectAction: (actionName: string, actionPrompt: string) => void;
  onOpenMoreActions: () => void;
  onRetake: () => void;
  isExecutingAction: boolean;
}

export const ActionSelectionView: React.FC<ActionSelectionViewProps> = ({
  imageThumbnail,
  analysis,
  onSelectAction,
  onOpenMoreActions,
  onRetake,
  isExecutingAction,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showFullImage, setShowFullImage] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || isExecutingAction) return;
    onSelectAction('Custom Request', customPrompt.trim());
  };

  const handlePromptChipClick = (prompt: string) => {
    setCustomPrompt(prompt);
    onSelectAction('Ask SnapAction', prompt);
  };

  // Quick prompt chip inspirations based on content type
  const promptSuggestions = [
    'CV Keywords & Resume Sentences',
    'Create Image JSON Prompt',
    'Create Video JSON Prompt',
    'Generate Title, Caption & Hashtags',
    'Extract SEO & Keywords',
    'Convert into Table',
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Intent & Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-black/40 space-y-4">
        {/* Top Header with detected intent & thumbnail chip */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Looks like:
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                ⚡ Processed Locally • 0 Gemini Tokens
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {analysis.title || analysis.contentType}
            </h2>
          </div>

          {/* Clickable thumbnail */}
          <button
            onClick={() => setShowFullImage(true)}
            className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity group cursor-pointer shadow-sm"
            title="View screenshot"
          >
            <img
              src={imageThumbnail}
              alt="Screenshot"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>

        {/* Natural Intention Phrasing */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-start gap-2.5">
          <span className="text-base select-none">💡</span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {analysis.detectedIntent}
            </p>
            {analysis.summary && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {analysis.summary}
              </p>
            )}
          </div>
        </div>

        {/* Extracted Key Entities */}
        {analysis.entities && analysis.entities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {analysis.entities.map((entity, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
              >
                <span className="font-medium text-slate-400 dark:text-slate-500">
                  {entity.label}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {entity.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Local Parsed Text & Markdown Toggle */}
        {analysis.cleanMarkdown && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowExtractedText(!showExtractedText)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showExtractedText ? 'Hide' : 'View'} Extracted Text / Markdown</span>
            </button>
            {showExtractedText && (
              <div className="mt-2 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto whitespace-pre-wrap selection:bg-blue-500 selection:text-white border border-slate-200 dark:border-slate-700">
                {analysis.cleanMarkdown}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary Actions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            What would you like to do?
          </h3>
          <button
            onClick={onRetake}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Change screenshot
          </button>
        </div>

        {/* Magic Action Button: ✨ Do Something Useful */}
        {analysis.magicAction && (
          <button
            onClick={() =>
              onSelectAction(analysis.magicAction.name, analysis.magicAction.actionPrompt)
            }
            disabled={isExecutingAction}
            className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-100">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  ✨ Do Something Useful
                </div>
                <div className="text-base font-bold tracking-tight">
                  {analysis.magicAction.name}
                </div>
                <div className="text-xs text-amber-100/90 line-clamp-1">
                  {analysis.magicAction.description}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0 ml-3">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </button>
        )}

        {/* 3 Most Relevant Actions */}
        <div className="grid grid-cols-1 gap-2.5">
          {analysis.suggestedActions.slice(0, 3).map((action, index) => (
            <button
              key={action.id || index}
              onClick={() => onSelectAction(action.name, action.actionPrompt)}
              disabled={isExecutingAction}
              className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm active:scale-[0.99] transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {action.description}
                </div>
              </div>
              <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shrink-0">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* More Actions Button */}
        <button
          onClick={onOpenMoreActions}
          className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs text-center border border-slate-200/70 dark:border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>More Actions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Universal Action: Ask SnapAction */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Ask SnapAction
          </h4>
        </div>

        <form onSubmit={handleCustomSubmit} className="relative">
          <input
            type="text"
            placeholder="What do you want to do with this screenshot?"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={isExecutingAction}
            className="w-full pl-4 pr-11 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={!customPrompt.trim() || isExecutingAction}
            className="absolute right-2 top-2 w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-opacity cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {promptSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePromptChipClick(suggestion)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Full Screenshot Modal */}
      {showFullImage && (
        <div
          onClick={() => setShowFullImage(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden p-2 relative">
            <img
              src={imageThumbnail}
              alt="Screenshot full view"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
            <p className="text-center text-xs text-white/70 py-2">
              Tap anywhere to close preview
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
