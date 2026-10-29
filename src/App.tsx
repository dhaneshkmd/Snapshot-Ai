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
import { SmartPdfStudio } from './components/pdfStudio/SmartPdfStudio';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { ToolsDirectoryModal } from './components/ToolsDirectoryModal';
import {
  LanguageOption,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
} from './modules/languages/languageData';
import { extractCommentsFromOCR, DetectedComment } from './modules/comments/commentDetector';
import { SmartAIRouter } from './modules/router/smartAIRouter';

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
  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'settings' | 'pdf'>('home');
  const [stage, setStage] = useState<'upload' | 'analyzing' | 'recommend' | 'result' | 'comment_reply'>('upload');
  const [pdfInitialText, setPdfInitialText] = useState<string>('');
  const [pdfInitialImage, setPdfInitialImage] = useState<string | undefined>(undefined);
  
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
  const [isToolsDirectoryOpen, setIsToolsDirectoryOpen] = useState(false);
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
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
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
      const extractedContent = data.cleanMarkdown || data.rawText || data.summary || '';
      setPdfInitialText(extractedContent);
      setPdfInitialImage(base64);
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
        setPdfInitialText(parsed.cleanMarkdown || parsed.rawText || '');
        setPdfInitialImage(base64);
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

  // 2. Select & Execute Action: Smart AI Router (Internal Code, Chrome Built-in AI, WebLLM, Transformers.js, Cloud AI)
  const handleSelectAction = async (actionName: string, actionPrompt: string) => {
    if (!currentImage || !analysisResult) return;
    setError(null);
    setLastFailedAction({ actionName, actionPrompt });
    setIsExecutingAction(true);

    try {
      const smartResult = await SmartAIRouter.executeAction({
        actionName,
        actionPrompt,
        contextSummary: analysisResult.summary || analysisResult.detectedIntent,
        cleanMarkdown: parsedScreenshot?.cleanMarkdown,
        extractedText: parsedScreenshot?.rawText,
        targetLanguageCode: globalLanguage.code,
        targetLanguageName: globalLanguage.name,
        userPreference: settings.aiPreference,
        imageBase64: (!parsedScreenshot?.rawText || parsedScreenshot.rawText.length < 10) ? currentImage.base64 : undefined,
      });

      const newExecutionResult: ActionExecutionResult = {
        actionName,
        resultText: smartResult.resultText,
        executedAt: smartResult.executedAt,
        transformationChain: [actionName],
        engineBadge: smartResult.engineBadge,
        engineUsed: smartResult.engineUsed,
        tokensSaved: smartResult.tokensSaved,
        latencyMs: smartResult.latencyMs,
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
        lastResult: smartResult.resultText.substring(0, 150) + (smartResult.resultText.length > 150 ? '...' : ''),
        engineBadge: smartResult.engineBadge,
      });

      setHistoryItems(getStoredHistory());
    } catch (err: any) {
      console.error('Failed to execute action:', err);
      setError(formatErrorMessage(err, 'Failed to execute action.'));
    } finally {
      setIsExecutingAction(false);
    }
  };

  // 3. Result Transformation (Chaining through SmartAIRouter)
  const handleTransformResult = async (transformationPrompt: string) => {
    if (!actionResult || !analysisResult) return;
    setIsTransforming(true);
    setError(null);

    try {
      const smartResult = await SmartAIRouter.executeAction({
        actionName: `Transform: ${transformationPrompt.substring(0, 30)}...`,
        actionPrompt: transformationPrompt,
        contextSummary: analysisResult.summary,
        cleanMarkdown: actionResult.resultText,
        extractedText: actionResult.resultText,
        targetLanguageCode: globalLanguage.code,
        targetLanguageName: globalLanguage.name,
        userPreference: settings.aiPreference,
      });

      const updatedChain = [...actionResult.transformationChain, transformationPrompt.substring(0, 25)];
      setActionResult({
        ...actionResult,
        resultText: smartResult.resultText,
        transformationChain: updatedChain,
        engineBadge: smartResult.engineBadge,
        engineUsed: smartResult.engineUsed,
        tokensSaved: (actionResult.tokensSaved || 0) + smartResult.tokensSaved,
        latencyMs: smartResult.latencyMs,
      });

      // Update latest history item with refined result
      const historyList = getStoredHistory();
      if (historyList.length > 0) {
        updateHistoryItem(historyList[0].id, {
          lastResult: smartResult.resultText.substring(0, 150),
          lastAction: transformationPrompt.substring(0, 25),
          engineBadge: smartResult.engineBadge,
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
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenToolsDirectory={() => setIsToolsDirectoryOpen(true)}
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
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
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

        {/* Tab: Smart PDF Studio */}
        {currentTab === 'pdf' && (
          <SmartPdfStudio
            key={pdfInitialImage ? pdfInitialImage.slice(0, 40) : (pdfInitialText ? pdfInitialText.slice(0, 30) : 'default-pdf-studio')}
            onBackToMain={() => setCurrentTab('home')}
            globalLanguage={globalLanguage}
            onOpenLanguageSelector={() => setIsGlobalLangModalOpen(true)}
            onOpenToolsDirectory={() => setIsToolsDirectoryOpen(true)}
            initialText={pdfInitialText}
            initialImageBase64={pdfInitialImage}
            onSaveToHistory={(item) => {
              saveHistoryItem(item);
              setHistoryItems(getStoredHistory());
            }}
          />
        )}

        {/* Tab: Home Flow */}
        {currentTab === 'home' && (
          <>
            {stage === 'upload' && (
              <HomeScreen
                onImageSelected={handleImageSelected}
                onOpenPdfStudio={() => {
                  setPdfInitialText('');
                  setPdfInitialImage(undefined);
                  setCurrentTab('pdf');
                }}
                onOpenToolsDirectory={() => setIsToolsDirectoryOpen(true)}
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
                onOpenPdfStudio={() => {
                  const content = parsedScreenshot?.cleanMarkdown || parsedScreenshot?.rawText || analysisResult?.summary || '';
                  setPdfInitialText(content);
                  setPdfInitialImage(currentImage.base64);
                  setCurrentTab('pdf');
                }}
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

      {/* Developer AI System Health & Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* SnapAction AI Tools Directory & User Guide Modal (8 Tools) */}
      <ToolsDirectoryModal
        isOpen={isToolsDirectoryOpen}
        onClose={() => setIsToolsDirectoryOpen(false)}
        onNavigateToTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'home') setStage('upload');
        }}
        onOpenLanguageSelector={() => setIsGlobalLangModalOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />
    </div>
  );
}
