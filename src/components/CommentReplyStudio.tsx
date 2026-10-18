import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Languages,
  Check,
  Copy,
  Share2,
  Edit3,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Scale,
  Sliders,
  ChevronDown,
  ArrowRight,
  Globe,
  Loader2,
  ShieldAlert,
  Send,
  RefreshCw,
  PlusCircle,
  ChevronRight,
  Layers,
  Wand2,
} from 'lucide-react';
import { LanguageOption, getLanguageByCode } from '../modules/languages/languageData';
import {
  REPLY_STYLES,
  DEFAULT_REPLY_STYLES,
  getStyleById,
  suggestStylesForComment,
  ReplyStyle,
} from '../modules/styles/replyStyleRegistry';
import { DetectedComment } from '../modules/comments/commentDetector';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { ReplyStyleModal } from './ReplyStyleModal';
import { tryGenerateLocalReply } from '../modules/reply/localReplyTemplateEngine';

interface CommentReplyStudioProps {
  comments: DetectedComment[];
  selectedCommentId: string;
  onSelectCommentId: (id: string) => void;
  globalLanguage: LanguageOption;
  onUpdateGlobalLanguage: (lang: LanguageOption) => void;
  onBackToActions?: () => void;
  favoriteStyleIds: string[];
  onToggleFavoriteStyle: (styleId: string) => void;
}

export type ReplyLength = 'short' | 'medium' | 'detailed';
export type ReplyIntensity = 'gentle' | 'balanced' | 'strong';
export type ReplyPosition = 'neutral' | 'agree' | 'disagree' | 'partial' | 'question';

export interface AlternativeReply {
  label: string;
  text: string;
}

export const CommentReplyStudio: React.FC<CommentReplyStudioProps> = ({
  comments,
  selectedCommentId,
  onSelectCommentId,
  globalLanguage,
  onUpdateGlobalLanguage,
  onBackToActions,
  favoriteStyleIds,
  onToggleFavoriteStyle,
}) => {
  // Target comment
  const activeComment = comments.find((c) => c.id === selectedCommentId) || comments[0] || {
    id: 'c_custom',
    author: 'Author',
    text: '',
    language: getLanguageByCode('en'),
  };

  // State
  const [commentText, setCommentText] = useState(activeComment.text);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<LanguageOption>(globalLanguage);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  // Translation of original comment
  const [translatedComment, setTranslatedComment] = useState<string | null>(null);
  const [isTranslatingComment, setIsTranslatingComment] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  // Reply Controls
  const [primaryStyleId, setPrimaryStyleId] = useState('professional');
  const [secondaryStyleId, setSecondaryStyleId] = useState<string | null>(null);
  const [replyLength, setReplyLength] = useState<ReplyLength>('medium');
  const [replyIntensity, setReplyIntensity] = useState<ReplyIntensity>('balanced');
  const [replyPosition, setReplyPosition] = useState<ReplyPosition>('neutral');
  const [customInstruction, setCustomInstruction] = useState('');
  const [userDraftReply, setUserDraftReply] = useState('');
  const [isDraftMode, setIsDraftMode] = useState(false);

  // Result state
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [editedReplyText, setEditedReplyText] = useState('');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Alternatives state
  const [alternatives, setAlternatives] = useState<AlternativeReply[]>([]);
  const [isGeneratingAlternatives, setIsGeneratingAlternatives] = useState(false);

  // Keep comment text in sync when user switches comment
  useEffect(() => {
    if (activeComment) {
      setCommentText(activeComment.text);
      setTranslatedComment(null);
      setShowTranslated(false);
      setGeneratedReply('');
      setAlternatives([]);
    }
  }, [activeComment.id, activeComment.text]);

  // Keep targetLanguage synced with globalLanguage default
  useEffect(() => {
    setTargetLanguage(globalLanguage);
  }, [globalLanguage.code]);

  const activePrimaryStyle = getStyleById(primaryStyleId);
  const activeSecondaryStyle = secondaryStyleId ? getStyleById(secondaryStyleId) : null;
  const suggestedStyles = suggestStylesForComment(commentText);

  // 1. Translate Comment in-place
  const handleTranslateComment = async () => {
    if (showTranslated && translatedComment) {
      setShowTranslated(false);
      return;
    }

    if (translatedComment) {
      setShowTranslated(true);
      return;
    }

    setIsTranslatingComment(true);
    try {
      const res = await fetch('/api/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionName: 'Translate Comment',
          actionPrompt: `Accurately translate this comment into natural, fluent ${targetLanguage.name} (${targetLanguage.nativeName}). Preserve proper nouns and original sentiment. Output ONLY the translated text directly with no filler.`,
          contextSummary: `Comment translation to ${targetLanguage.name}`,
          extractedText: commentText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTranslatedComment(data.result?.trim() || 'Translation failed');
        setShowTranslated(true);
      }
    } catch (e) {
      console.error('Translation error', e);
    } finally {
      setIsTranslatingComment(false);
    }
  };

  // 2. Generate Reply
  const handleGenerateReply = async (customPromptOverride?: string) => {
    if (!commentText.trim()) return;

    setErrorMsg(null);
    setIsGenerating(true);
    setAlternatives([]);

    // Check Level 0 / 1 local template engine (0 Gemini tokens)
    const localMatch = tryGenerateLocalReply(
      commentText,
      targetLanguage.code,
      primaryStyleId,
      replyPosition
    );

    if (localMatch.matched && localMatch.replyText && !customInstruction && !userDraftReply) {
      setGeneratedReply(localMatch.replyText);
      setEditedReplyText(localMatch.replyText);
      setIsGenerating(false);
      return;
    }

    // Call Level 3 Gemini Gateway with strict token minimization
    try {
      const promptToSend =
        customPromptOverride ||
        `Generate a reply to this social comment in ${targetLanguage.name} (${targetLanguage.nativeName}).
Selected Primary Style: ${activePrimaryStyle.name} (${activePrimaryStyle.instruction})
${activeSecondaryStyle ? `Secondary Style Blend: ${activeSecondaryStyle.name} (${activeSecondaryStyle.instruction})` : ''}
Position/Stance: ${replyPosition}
Desired Length: ${replyLength} (Short=1-2 sentences, Medium=1-2 paragraphs, Detailed=comprehensive)
Intensity Level: ${replyIntensity}
${userDraftReply.trim() ? `User Draft to Improve: "${userDraftReply.trim()}"` : ''}
${customInstruction.trim() ? `User Custom Guidance: "${customInstruction.trim()}"` : ''}

Strict Formatting & Cultural Rules:
- The output MUST be written natively in ${targetLanguage.name} (${targetLanguage.nativeName}) using authentic grammar, idioms, and natural script.
- Do NOT output robotic or literal word-for-word translation.
- If target language is right-to-left (e.g. Arabic, Urdu), format appropriately.
- Output ONLY the ready-to-post reply directly without conversational meta-introductions (no "Here is a reply:").`;

      const res = await fetch('/api/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionName: `Multilingual Reply: ${activePrimaryStyle.name} (${targetLanguage.name})`,
          actionPrompt: promptToSend,
          contextSummary: `Social Comment Reply on ${activeComment.platform || 'Social Platform'}`,
          extractedText: `Target Comment: "${commentText}"\nAuthor: ${activeComment.author || 'User'}`,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate reply. Please try again.');
      }

      const data = await res.json();
      const output = (data.result || '').trim();
      setGeneratedReply(output);
      setEditedReplyText(output);
    } catch (err: any) {
      console.error('Reply generation failed', err);
      setErrorMsg(err?.message || 'Could not generate reply. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Generate 3 Alternatives (Direct, Diplomatic, Engaging) on demand
  const handleGenerateAlternatives = async () => {
    if (!commentText.trim() || isGeneratingAlternatives) return;
    setIsGeneratingAlternatives(true);

    try {
      const res = await fetch('/api/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionName: 'Generate 3 Reply Variations',
          actionPrompt: `Generate 3 distinct alternative replies to this comment in ${targetLanguage.name} (${targetLanguage.nativeName}):
1. Option A (Direct & Concise)
2. Option B (Diplomatic & Thoughtful)
3. Option C (Engaging & Conversational)

Format with clear headers:
### Option A: Direct
[Reply text]

### Option B: Diplomatic
[Reply text]

### Option C: Engaging
[Reply text]

Write strictly in ${targetLanguage.name}. No English translation unless target language is English.`,
          contextSummary: `Comment alternatives in ${targetLanguage.name}`,
          extractedText: `Comment: "${commentText}"`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.result || '';
        const parsedAlts: AlternativeReply[] = [];

        const partsA = text.split(/### Option B/i);
        const optA = partsA[0]?.replace(/### Option A[^\n]*\n?/i, '').trim();

        if (partsA[1]) {
          const partsB = partsA[1].split(/### Option C/i);
          const optB = partsB[0]?.replace(/^[:\s\-]+/, '').trim();
          const optC = partsB[1]?.replace(/^[:\s\-]+/, '').trim();

          if (optA) parsedAlts.push({ label: 'Option A: Direct', text: optA });
          if (optB) parsedAlts.push({ label: 'Option B: Diplomatic', text: optB });
          if (optC) parsedAlts.push({ label: 'Option C: Engaging', text: optC });
        }

        if (parsedAlts.length > 0) {
          setAlternatives(parsedAlts);
        } else {
          // Fallback single alternative
          setAlternatives([{ label: 'Alternative Perspective', text }]);
        }
      }
    } catch (e) {
      console.error('Failed to generate alternatives', e);
    } finally {
      setIsGeneratingAlternatives(false);
    }
  };

  // 4. Quick Refinements
  const handleRefine = (refinementType: string) => {
    let instruction = '';
    switch (refinementType) {
      case 'shorter':
        instruction = `Make this reply significantly shorter and crisper while preserving core meaning in ${targetLanguage.name}.`;
        break;
      case 'longer':
        instruction = `Expand this reply with more substantive explanation and detail in ${targetLanguage.name}.`;
        break;
      case 'professional':
        instruction = `Rewrite this reply in an executive, high-polish professional tone in ${targetLanguage.name}.`;
        break;
      case 'polite':
        instruction = `Make this reply exceptionally polite, courteous, and respectful in ${targetLanguage.name}.`;
        break;
      case 'assertive':
        instruction = `Make this reply more assertive, firm, and confident in ${targetLanguage.name}.`;
        break;
      case 'humorous':
        instruction = `Inject clever, relatable wit and tasteful humor into this reply in ${targetLanguage.name}.`;
        break;
      case 'simplify':
        instruction = `Rewrite using very simple, plain language words in ${targetLanguage.name}.`;
        break;
    }
    handleGenerateReply(
      `Refine existing reply: "${editedReplyText}".\nInstruction: ${instruction}\nTarget Language: ${targetLanguage.name}. Output only the refined text.`
    );
  };

  // 5. Copy & Share handlers
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedReplyText || generatedReply);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleShare = async () => {
    const text = editedReplyText || generatedReply;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reply in ${targetLanguage.name}`,
          text,
        });
        setShareFeedback('Shared!');
        setTimeout(() => setShareFeedback(null), 2000);
      } catch (e) {
        // user cancel
      }
    } else {
      handleCopy();
      setShareFeedback('Copied to clipboard!');
      setTimeout(() => setShareFeedback(null), 2000);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(editedReplyText || generatedReply);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Platform & Language Override */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Comment Reply Studio
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                v2
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Multilingual & Multi-style social responses
            </p>
          </div>
        </div>

        {/* Global/Studio Language Trigger */}
        <button
          onClick={() => setIsLangModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <span className="text-sm">{targetLanguage.flag}</span>
          <span>{targetLanguage.nativeName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* 1. FOCUS COMMENT SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-black/40 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/50">
              {activeComment.platform || 'Social Comment'}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {activeComment.author}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditingComment(!isEditingComment)}
              className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isEditingComment ? 'Done' : 'Edit Text'}
            </button>
          </div>
        </div>

        {/* Comment Text Box */}
        {isEditingComment ? (
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            "{showTranslated && translatedComment ? translatedComment : commentText}"
          </div>
        )}

        {/* Translation Banner & Comment Switcher */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Detected: {activeComment.language?.flag} {activeComment.language?.name}
            </span>
            {showTranslated && (
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                Translated to {targetLanguage.name}
              </span>
            )}
          </div>

          <button
            onClick={handleTranslateComment}
            disabled={isTranslatingComment}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isTranslatingComment ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-3.5 h-3.5" />
                {showTranslated ? 'View Original' : `Translate to ${targetLanguage.nativeName}`}
              </>
            )}
          </button>
        </div>

        {/* Switch Between Detected Comments Carousel if multi-comment screenshot */}
        {comments.length > 1 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Detected {comments.length} Comments in Screenshot (Tap to Focus):
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {comments.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCommentId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                    c.id === selectedCommentId
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  #{idx + 1} {c.author.slice(0, 15)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. REPLY STYLE CONTROLS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Style Selection Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Reply Style
              {activeSecondaryStyle && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                  Blend: {activePrimaryStyle.name} + {activeSecondaryStyle.name}
                </span>
              )}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {activePrimaryStyle.description}
            </p>
          </div>

          <button
            onClick={() => setIsStyleModalOpen(true)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            More Styles (96)
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Prominent Default Style Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEFAULT_REPLY_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setPrimaryStyleId(style.id)}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                primaryStyleId === style.id
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                  : 'border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold">{style.name}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                {style.description}
              </div>
            </button>
          ))}
        </div>

        {/* Context-Suggested Styles */}
        {suggestedStyles.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">✨ Suggested:</span>
            {suggestedStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setPrimaryStyleId(style.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  primaryStyleId === style.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        )}

        {/* Controls: Length, Stance/Position, Intensity */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Position Selector */}
          <div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Your Position / Stance
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(
                [
                  { id: 'neutral', label: 'Neutral' },
                  { id: 'agree', label: 'Agree' },
                  { id: 'disagree', label: 'Disagree' },
                  { id: 'partial', label: 'Partial' },
                  { id: 'question', label: 'Ask' },
                ] as const
              ).map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setReplyPosition(pos.id)}
                  className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    replyPosition === pos.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length & Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Length */}
            <div>
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Reply Length
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['short', 'medium', 'detailed'] as const).map((len) => (
                  <button
                    key={len}
                    onClick={() => setReplyLength(len)}
                    className={`py-1 text-xs capitalize font-semibold rounded-xl transition-all cursor-pointer ${
                      replyLength === len
                        ? 'bg-slate-800 dark:bg-slate-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity (if style supports or disagreement) */}
            {activePrimaryStyle.compatibleIntensity && (
              <div>
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Intensity
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['gentle', 'balanced', 'strong'] as const).map((int) => (
                    <button
                      key={int}
                      onClick={() => setReplyIntensity(int)}
                      className={`py-1 text-xs capitalize font-semibold rounded-xl transition-all cursor-pointer ${
                        replyIntensity === int
                          ? 'bg-slate-800 dark:bg-slate-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {int}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional: User Custom Instruction or Improve Draft Toggle */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Anything you want to add? (Optional)
              </span>
              <button
                type="button"
                onClick={() => setIsDraftMode(!isDraftMode)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isDraftMode ? 'Hide Draft Mode' : '✍️ Improve My Own Draft'}
              </button>
            </div>

            {isDraftMode && (
              <textarea
                value={userDraftReply}
                onChange={(e) => setUserDraftReply(e.target.value)}
                placeholder="Paste or type your rough thoughts/draft here (e.g. 'I disagree because safety is our top priority')..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            )}

            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g. 'Keep it friendly', 'Include workplace safety point', 'Ask for evidence'..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Primary Action Button: Generate Reply */}
        <button
          onClick={() => handleGenerateReply()}
          disabled={isGenerating}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Crafting {activePrimaryStyle.name} Reply in {targetLanguage.nativeName}...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Reply in {targetLanguage.flag} {targetLanguage.nativeName}
            </>
          )}
        </button>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}
      </div>

      {/* 3. GENERATED RESULT CARD */}
      {generatedReply && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-black/40 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {targetLanguage.flag} {targetLanguage.nativeName} Reply
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {activePrimaryStyle.name}
              </span>
            </div>

            <button
              onClick={() => setIsEditingReply(!isEditingReply)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditingReply ? 'Preview' : 'Edit'}
            </button>
          </div>

          {/* Reply Content Box */}
          <div className="relative">
            {isEditingReply ? (
              <textarea
                value={editedReplyText}
                onChange={(e) => setEditedReplyText(e.target.value)}
                rows={5}
                dir={targetLanguage.isRtl ? 'rtl' : 'ltr'}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-sans"
              />
            ) : (
              <div
                dir={targetLanguage.isRtl ? 'rtl' : 'ltr'}
                className="p-4 rounded-2xl bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100/50 dark:border-slate-750 text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-sans selection:bg-blue-500 selection:text-white"
              >
                {editedReplyText}
              </div>
            )}
          </div>

          {/* Copy, Share, WhatsApp Action Row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleCopy}
              className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm active:scale-95'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Reply
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>

            <button
              onClick={handleWhatsApp}
              className="py-2.5 px-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          </div>

          {shareFeedback && (
            <div className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {shareFeedback}
            </div>
          )}

          {/* Refine / Action Chaining Chips */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Refinements:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'Shorter', key: 'shorter' },
                { label: 'Longer', key: 'longer' },
                { label: 'More Professional', key: 'professional' },
                { label: 'More Polite', key: 'polite' },
                { label: 'More Assertive', key: 'assertive' },
                { label: 'Add Wit', key: 'humorous' },
                { label: 'Simplify', key: 'simplify' },
              ].map((refine) => (
                <button
                  key={refine.key}
                  onClick={() => handleRefine(refine.key)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  {refine.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate 3 Alternatives Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleGenerateAlternatives}
              disabled={isGeneratingAlternatives}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAlternatives ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Direct, Diplomatic & Engaging Variations...
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Generate 3 Alternative Variations (Direct, Diplomatic, Engaging)
                </>
              )}
            </button>

            {/* Render Alternatives if generated */}
            {alternatives.length > 0 && (
              <div className="space-y-2.5 mt-3 animate-in fade-in duration-200">
                {alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {alt.label}
                      </span>
                      <button
                        onClick={() => {
                          setEditedReplyText(alt.text);
                          setGeneratedReply(alt.text);
                        }}
                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
                      >
                        Use This
                      </button>
                    </div>
                    <p
                      dir={targetLanguage.isRtl ? 'rtl' : 'ltr'}
                      className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
                    >
                      {alt.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back to actions or home */}
      {onBackToActions && (
        <div className="text-center pt-2">
          <button
            onClick={onBackToActions}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
          >
            ← Back to All Actions
          </button>
        </div>
      )}

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        selectedLanguage={targetLanguage}
        onSelectLanguage={(lang) => {
          setTargetLanguage(lang);
          onUpdateGlobalLanguage(lang);
        }}
        title="Select Reply Language"
      />

      {/* Reply Style Library Modal (96 Styles) */}
      <ReplyStyleModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        selectedStyleId={primaryStyleId}
        secondaryStyleId={secondaryStyleId}
        onSelectStyle={(styleId, isSecondary) => {
          if (isSecondary) {
            setSecondaryStyleId(styleId || null);
          } else {
            setPrimaryStyleId(styleId);
          }
        }}
        favoriteStyleIds={favoriteStyleIds}
        onToggleFavorite={onToggleFavoriteStyle}
      />
    </div>
  );
};
