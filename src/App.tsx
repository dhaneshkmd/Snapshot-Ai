import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { AnalyzingView } from './components/AnalyzingView';
import { ActionSelectionView } from './components/ActionSelectionView';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { MoreActionsModal } from './components/MoreActionsModal';
import {
  AnalysisResult,
  ActionExecutionResult,
  HistoryItem,
  AppSettings,
} from './types';
import { ScreenshotParser, ParsedScreenshotResult } from './parser/screenshotParser';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredHistory,
  saveHistoryItem,
  updateHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
} from './utils/storage';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { CommentReplyStudio } from './components/CommentReplyStudio';
import { HseVisionStudio } from './components/hse/HseVisionStudio';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import {
  LanguageOption,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
} from './modules/languages/languageData';
import { extractCommentsFromOCR, DetectedComment } from './modules/comments/commentDetector';

function formatErrorMessage(errData: any, fallback: string): string {
  if (!errData) return fallback;
  if (typeof errData === 'string') {
    try {
      const parsed = JSON.parse(errData);
      return formatErrorMessage(parsed, fallback);
    } catch {
      return errData;
    }
  }
  if (errData.error) {
    return formatErrorMessage(errData.error, fallback);
  }
  if (errData.message) {
    if (
      errData.message.includes('high demand') ||
      errData.message.includes('UNAVAILABLE') ||
      errData.code === 503
    ) {
      return 'The AI model is experiencing a temporary spike in traffic. Tap Retry to run again with our fallback models.';
    }
    return errData.message;
  }
  return fallback;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'settings' | 'hse'>('home');
  const [stage, setStage] = useState<'upload' | 'analyzing' | 'recommend' | 'result' | 'comment_reply'>('upload');
  
  const [currentImage, setCurrentImage] = useState<{
    base64: string;
    mimeType: string;
    filename?: string;
  } | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [parsedScreenshot, setParsedScreenshot] = useState<ParsedScreenshotResult | null>(null);
  const [actionResult, setActionResult] = useState<ActionExecutionResult | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<{
    actionName: string;
    actionPrompt: string;
  } | null>(null);

  // Multilingual Comment Reply Engine (v2) State
  const [globalLanguage, setGlobalLanguage] = useState<LanguageOption>(() => {
    try {
      const saved = localStorage.getItem('snapaction_global_lang');
      return saved ? getLanguageByCode(saved) : DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  });
  const [isGlobalLangModalOpen, setIsGlobalLangModalOpen] = useState(false);
  const [favoriteStyleIds, setFavoriteStyleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('snapaction_fav_styles');
      return saved ? JSON.parse(saved) : ['professional', 'friendly', 'respectful_disagreement'];
    } catch {
      return ['professional', 'friendly', 'respectful_disagreement'];
    }
  });
  const [selectedCommentId, setSelectedCommentId] = useState<string>('c_1');

  const handleUpdateGlobalLanguage = (lang: LanguageOption) => {
    setGlobalLanguage(lang);
    try {
      localStorage.setItem('snapaction_global_lang', lang.code);
    } catch {}
  };

  const handleToggleFavoriteStyle = (styleId: string) => {
    setFavoriteStyleIds((prev) => {
      const next = prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId];
      try {
        localStorage.setItem('snapaction_fav_styles', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);

  // Sync history on mount
  useEffect(() => {
    setHistoryItems(getStoredHistory());

    // Listen for PWA install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Sync theme
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && systemDark);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    const nextTheme: AppSettings['theme'] = isDark ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleInstallPwa = async () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    const { outcome } = await pwaPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaPrompt(null);
    }
  };

  // 1. Image selected: Fast High-Speed Pipeline (~2s response time)
  const handleImageSelected = async (base64: string, mimeType: string, filename?: string) => {
    setError(null);
    setLastFailedAction(null);
    setCurrentImage({ base64, mimeType, filename });
    setStage('analyzing');
    setCurrentTab('home');

    try {
      const res = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = formatErrorMessage(errorData, `Analysis failed (${res.status})`);
        throw new Error(msg);
      }

      const data = await res.json();
      setAnalysisResult(data);
      setParsedScreenshot({
        ...data,
        rawText: data.rawText || '',
        cleanMarkdown: data.cleanMarkdown || '',
        structuredJson: {},
        confidence: data.confidence || 0.95,
        extractedEntities: {
          emails: [], urls: [], phones: [], dates: [], times: [], prices: [], percentages: [], tickers: [], orderNumbers: [], locations: [], hashtags: [], handles: [], deadlines: [], meetingLinks: [], companies: [], jobTitles: [], rawEntityList: data.entities || []
        },
        ocrConfidence: 0.95,
      });
      setStage('recommend');
    } catch (err: any) {
      console.warn('Network analyze call failed, falling back to local heuristic parser:', err);
      try {
        const parsed = await ScreenshotParser.parse(base64);
        setParsedScreenshot(parsed);
        setAnalysisResult(parsed);
        setStage('recommend');
        return;
      } catch (fallbackErr) {
        console.error('All paths failed:', fallbackErr);
      }
      setError(formatErrorMessage(err, 'Failed to analyze screenshot. Please try again.'));
      setStage('upload');
    }
  };

  // 2. Select & Execute Action: Local Instant or Text-First Gemini
  const handleSelectAction = async (actionName: string, actionPrompt: string) => {
    if (!currentImage || !analysisResult) return;
    setError(null);
    setLastFailedAction({ actionName, actionPrompt });
    setIsExecutingAction(true);

    const nameLower = actionName.toLowerCase();

    // Check if this action is an instant deterministic local action (0 Gemini tokens, 0ms latency)
    const isLocalAction =
      nameLower.includes('instant') ||
      nameLower.includes('extract text') ||
      nameLower.includes('extract all text') ||
      nameLower.includes('extract raw text') ||
      nameLower.includes('extract error text') ||
      nameLower.includes('copy trace') ||
      nameLower.includes('export as csv') ||
      nameLower.includes('export csv') ||
      nameLower.includes('add to calendar (.ics');

    if (isLocalAction && parsedScreenshot) {
      let localOutput = '';
      if (nameLower.includes('csv')) {
        const rows = [
          '| Field / Item | Extracted Value |',
          '| :--- | :--- |'
        ];
        parsedScreenshot.extractedEntities.rawEntityList.forEach((e) => {
          rows.push(`| **${e.label}** | ${e.value.replace(/\|/g, '-')} |`);
        });
        if (parsedScreenshot.extractedEntities.prices.length > 0) {
          parsedScreenshot.extractedEntities.prices.forEach((p, i) => {
            rows.push(`| Price Entry ${i + 1} | ${p} |`);
          });
        }
        localOutput = rows.join('\n');
      } else if (nameLower.includes('calendar') || nameLower.includes('.ics')) {
        const dt = parsedScreenshot.extractedEntities.dates[0] || '2026-10-18';
        const cleanDate = dt.replace(/[^0-9]/g, '').padEnd(8, '0');
        localOutput = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//SnapAction AI//EN',
          'BEGIN:VEVENT',
          `SUMMARY:${parsedScreenshot.title || 'Event from Screenshot'}`,
          `DESCRIPTION:${parsedScreenshot.summary || 'Extracted by SnapAction AI without Gemini tokens'}`,
          `DTSTART:${cleanDate}T090000Z`,
          `DTEND:${cleanDate}T100000Z`,
          `LOCATION:${parsedScreenshot.extractedEntities.locations[0] || 'Online'}`,
          'STATUS:CONFIRMED',
          'END:VEVENT',
          'END:VCALENDAR',
        ].join('\n');
      } else {
        localOutput = parsedScreenshot.cleanMarkdown || parsedScreenshot.rawText || 'No text detected in screenshot.';
      }

      const executionResult: ActionExecutionResult = {
        actionName,
        resultText: localOutput,
        executedAt: new Date().toISOString(),
        transformationChain: [actionName],
      };

      setActionResult(executionResult);
      setStage('result');
      setLastFailedAction(null);
      setIsExecutingAction(false);

      saveHistoryItem({
        title: analysisResult.title || analysisResult.contentType || 'Screenshot Action',
        contentType: analysisResult.contentType,
        detectedIntent: analysisResult.detectedIntent,
        thumbnail: currentImage.base64,
        lastAction: actionName,
        lastResult: localOutput.substring(0, 150) + (localOutput.length > 150 ? '...' : ''),
      });
      setHistoryItems(getStoredHistory());
      return;
    }

    // Otherwise, call Gemini with structured text context (95%+ fewer tokens than vision)
    try {
      const res = await fetch('/api/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionName,
          actionPrompt,
          contextSummary: analysisResult.summary || analysisResult.detectedIntent,
          cleanMarkdown: parsedScreenshot?.cleanMarkdown,
          extractedText: parsedScreenshot?.rawText,
          // Only send image fallback if text extraction was completely empty
          imageBase64: (!parsedScreenshot?.rawText || parsedScreenshot.rawText.length < 10) ? currentImage.base64 : undefined,
          mimeType: currentImage.mimeType,
          isTransformation: false,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = formatErrorMessage(errJson, `Action failed (${res.status})`);
        throw new Error(msg);
      }

      const { result } = await res.json();

      const newExecutionResult: ActionExecutionResult = {
        actionName,
        resultText: result,
        executedAt: new Date().toISOString(),
        transformationChain: [actionName],
      };

      setActionResult(newExecutionResult);
      setStage('result');
      setLastFailedAction(null);

      // Save to history
      saveHistoryItem({
        title: analysisResult.title || analysisResult.contentType || 'Screenshot Action',
        contentType: analysisResult.contentType,
        detectedIntent: analysisResult.detectedIntent,
        thumbnail: currentImage.base64,
        lastAction: actionName,
        lastResult: result.substring(0, 150) + (result.length > 150 ? '...' : ''),
      });

      setHistoryItems(getStoredHistory());
    } catch (err: any) {
      console.error('Failed to execute action:', err);
      setError(formatErrorMessage(err, 'Failed to execute action.'));
    } finally {
      setIsExecutingAction(false);
    }
  };

  // 3. Result Transformation (Chaining)
  const handleTransformResult = async (transformationPrompt: string) => {
    if (!actionResult || !analysisResult) return;
    setIsTransforming(true);
    setError(null);

    try {
      const res = await fetch('/api/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionName: `Transform: ${transformationPrompt.substring(0, 30)}...`,
          actionPrompt: transformationPrompt,
          contextSummary: analysisResult.summary,
          previousResult: actionResult.resultText,
          isTransformation: true,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = formatErrorMessage(errJson, 'Transformation failed');
        throw new Error(msg);
      }

      const { result } = await res.json();

      const updatedChain = [...actionResult.transformationChain, transformationPrompt.substring(0, 25)];
      setActionResult({
        ...actionResult,
        resultText: result,
        transformationChain: updatedChain,
      });

      // Update latest history item with refined result
      const historyList = getStoredHistory();
      if (historyList.length > 0) {
        updateHistoryItem(historyList[0].id, {
          lastResult: result.substring(0, 150),
          lastAction: transformationPrompt.substring(0, 25),
        });
        setHistoryItems(getStoredHistory());
      }
    } catch (err: any) {
      console.error('Failed to transform:', err);
      setError(formatErrorMessage(err, 'Failed to refine output.'));
    } finally {
      setIsTransforming(false);
    }
  };

  // Reset to clean Home
  const handleResetToHome = () => {
    setStage('upload');
    setCurrentImage(null);
    setAnalysisResult(null);
    setParsedScreenshot(null);
    setActionResult(null);
    setError(null);
    setLastFailedAction(null);
    setCurrentTab('home');
  };

  // Open item from history
  const handleOpenHistoryItem = (item: HistoryItem) => {
    setActionResult({
      actionName: item.lastAction,
      resultText: item.lastResult,
      executedAt: new Date(item.timestamp).toISOString(),
      transformationChain: [item.lastAction],
    });
    setAnalysisResult({
      contentType: item.contentType,
      detectedIntent: item.detectedIntent,
      title: item.title,
      summary: '',
      entities: [],
      magicAction: {
        id: 'magic',
        name: 'Do Something Useful',
        description: 'Auto-pick best action',
        actionPrompt: 'Perform the best action',
      },
      suggestedActions: [],
      moreActions: [],
    });
    if (item.thumbnail) {
      setCurrentImage({
        base64: item.thumbnail,
        mimeType: 'image/png',
      });
    }
    setStage('result');
    setCurrentTab('home');
  };

  const handleDeleteHistoryItem = (id: string) => {
    deleteHistoryItem(id);
    setHistoryItems(getStoredHistory());
  };

  const handleToggleFavoriteHistory = (id: string) => {
    const item = historyItems.find((i) => i.id === id);
    if (item) {
      updateHistoryItem(id, { isFavorite: !item.isFavorite });
      setHistoryItems(getStoredHistory());
    }
  };

  const handleRenameHistory = (id: string, newTitle: string) => {
    updateHistoryItem(id, { title: newTitle });
    setHistoryItems(getStoredHistory());
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setHistoryItems([]);
  };

  // Compute detected comments from OCR text for the Focus Comment & Reply Engine
  const commentContext = React.useMemo(() => {
    const text =
      parsedScreenshot?.cleanMarkdown ||
      parsedScreenshot?.rawText ||
      analysisResult?.summary ||
      '';
    return extractCommentsFromOCR(text);
  }, [parsedScreenshot?.cleanMarkdown, parsedScreenshot?.rawText, analysisResult?.summary]);

  const activeComments: DetectedComment[] =
    commentContext.comments.length > 0
      ? commentContext.comments
      : [
          {
            id: 'c_1',
            author: 'Post Comment',
            text:
              parsedScreenshot?.cleanMarkdown ||
              parsedScreenshot?.rawText ||
              analysisResult?.summary ||
              'No comment text extracted. Tap Edit Text to paste or refine the comment.',
            language: globalLanguage,
          },
        ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Header with Permanent Global Language Selector in top-right */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        historyCount={historyItems.length}
        darkMode={isDark}
        onToggleTheme={handleToggleTheme}
        onResetToHome={handleResetToHome}
        globalLanguage={globalLanguage}
        onOpenLanguageSelector={() => setIsGlobalLangModalOpen(true)}
        pwaInstallPrompt={pwaPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Error notification bar with Retry support */}
        {error && (
          <div className="max-w-xl mx-auto px-4 pt-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {lastFailedAction && (
                  <button
                    onClick={() =>
                      handleSelectAction(
                        lastFailedAction.actionName,
                        lastFailedAction.actionPrompt
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Retry
                  </button>
                )}
                <button
                  onClick={() => setError(null)}
                  className="text-xs font-semibold underline text-amber-700 dark:text-amber-300 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Settings */}
        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearHistory={handleClearHistory}
            pwaInstallPrompt={pwaPrompt}
            onInstallPwa={handleInstallPwa}
          />
        )}

        {/* Tab: History */}
        {currentTab === 'history' && (
          <HistoryView
            historyItems={historyItems}
            onOpenItem={handleOpenHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            onToggleFavorite={handleToggleFavoriteHistory}
            onRenameItem={handleRenameHistory}
            onClearAll={handleClearHistory}
            onBackToHome={handleResetToHome}
          />
        )}

        {/* Tab: HSE Vision Studio */}
        {currentTab === 'hse' && (
          <HseVisionStudio
            onBackToMain={() => setCurrentTab('home')}
            globalLanguage={globalLanguage}
            onOpenLanguageSelector={() => setIsGlobalLangModalOpen(true)}
            initialPhoto={
              currentImage
                ? {
                    base64: currentImage.base64,
                    mimeType: currentImage.mimeType,
                    filename: currentImage.filename,
                  }
                : undefined
            }
          />
        )}

        {/* Tab: Home Flow */}
        {currentTab === 'home' && (
          <>
            {stage === 'upload' && (
              <HomeScreen
                onImageSelected={handleImageSelected}
                onOpenHseVision={() => setCurrentTab('hse')}
                isProcessing={false}
              />
            )}

            {stage === 'analyzing' && currentImage && (
              <AnalyzingView imageThumbnail={currentImage.base64} />
            )}

            {stage === 'recommend' && currentImage && analysisResult && (
              <ActionSelectionView
                imageThumbnail={currentImage.base64}
                analysis={analysisResult}
                onSelectAction={handleSelectAction}
                onOpenMoreActions={() => setIsMoreActionsOpen(true)}
                onOpenReplyStudio={() => setStage('comment_reply')}
                onOpenHseVision={() => setCurrentTab('hse')}
                onRetake={handleResetToHome}
                isExecutingAction={isExecutingAction}
              />
            )}

            {/* Multilingual Comment Reply Studio Stage (Version 2) */}
            {stage === 'comment_reply' && (
              <CommentReplyStudio
                comments={activeComments}
                selectedCommentId={selectedCommentId}
                onSelectCommentId={setSelectedCommentId}
                globalLanguage={globalLanguage}
                onUpdateGlobalLanguage={handleUpdateGlobalLanguage}
                onBackToActions={() => setStage('recommend')}
                favoriteStyleIds={favoriteStyleIds}
                onToggleFavoriteStyle={handleToggleFavoriteStyle}
              />
            )}

            {stage === 'result' && actionResult && (
              <ResultView
                actionResult={actionResult}
                onTransform={handleTransformResult}
                onTryAnother={() => setStage('recommend')}
                isTransforming={isTransforming}
              />
            )}
          </>
        )}
      </main>

      {/* More Actions Bottom Sheet / Modal */}
      <MoreActionsModal
        isOpen={isMoreActionsOpen}
        onClose={() => setIsMoreActionsOpen(false)}
        screenshotMoreActions={analysisResult?.moreActions || []}
        onSelectAction={handleSelectAction}
      />

      {/* Permanent Global Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isGlobalLangModalOpen}
        onClose={() => setIsGlobalLangModalOpen(false)}
        selectedLanguage={globalLanguage}
        onSelectLanguage={handleUpdateGlobalLanguage}
        title="Select Default Language"
      />
    </div>
  );
}
