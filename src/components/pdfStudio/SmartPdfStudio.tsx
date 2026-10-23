import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  UploadCloud,
  Camera,
  Clipboard,
  Download,
  Share2,
  Copy,
  Edit3,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  ChevronDown,
  Layers,
  Printer,
  FileCode,
  ArrowRight,
  Eye,
  Info,
  Maximize2,
  Building,
  Calendar,
  User,
  Shield,
  RotateCcw,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import {
  SmartDocument,
  DocumentThemeId,
  DOCUMENT_THEMES,
  DOCUMENT_TEMPLATES,
  DocumentTemplateItem,
  DocumentLengthMode,
  QuickDocumentMode,
  WritingStyle,
  PageSize,
  PageOrientation,
  SAMPLE_NOTE_SCENARIOS,
  SampleNoteScenario,
  getTemplateById,
} from '../../modules/pdfStudio/documentTypes';
import { generateLocalFallbackDocument } from '../../modules/pdfStudio/localDocumentArchitect';
import { exportDocumentToDocx, triggerDownload } from '../../modules/pdfStudio/docxExporter';
import { printDocumentAsPdf, downloadVectorPdfDirect } from '../../modules/pdfStudio/pdfExporter';
import { LanguageOption } from '../../modules/languages/languageData';
import { optimizeScreenshot } from '../../utils/imageCompressor';

interface SmartPdfStudioProps {
  onBackToMain?: () => void;
  globalLanguage: LanguageOption;
  onOpenLanguageSelector: () => void;
  initialText?: string;
  initialImageBase64?: string;
  onSaveToHistory?: (item: any) => void;
}

export const SmartPdfStudio: React.FC<SmartPdfStudioProps> = ({
  onBackToMain,
  globalLanguage,
  onOpenLanguageSelector,
  initialText = '',
  initialImageBase64,
  onSaveToHistory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Studio Input State
  const [inputText, setInputText] = useState(initialText);
  const [inputImage, setInputImage] = useState<string | null>(initialImageBase64 || null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('auto');
  const [quickMode, setQuickMode] = useState<QuickDocumentMode>('professional_rewrite');
  const [lengthMode, setLengthMode] = useState<DocumentLengthMode>('standard');
  const [writingStyle, setWritingStyle] = useState<WritingStyle>('professional');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('All');

  // Generation & Status State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('Reading notes & analyzing context...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Generated Document State
  const [document, setDocument] = useState<SmartDocument | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'before_after' | 'edit'>('preview');
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Auto-generate if initialImageBase64 or rich initialText provided from outside
  useEffect(() => {
    if (initialImageBase64 && !document && !isGenerating) {
      handleGenerateDocument();
    }
  }, [initialImageBase64]);

  // Handle Pasting from Clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
      }
    } catch {
      // Fallback
    }
  };

  // Handle File Upload (txt, md, json, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      handleImageUpload(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  // Handle Image Upload (screenshot of handwritten notes or slides)
  const handleImageUpload = async (file: File) => {
    try {
      const optimized = await optimizeScreenshot(file, 1280, 0.85);
      setInputImage(optimized.base64);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const b64 = event.target?.result as string;
        if (b64) setInputImage(b64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load a quick sample scenario for instant test
  const handleLoadSample = (sample: SampleNoteScenario) => {
    setInputText(sample.rawNotes);
    setInputImage(null);
    setSelectedTemplateId(sample.expectedTemplateId);
  };

  // Generate Document: High-Speed Resilient Engine (Cloud Gemini + Instant Local Architect Fallback)
  const handleGenerateDocument = async (forceLocal = false) => {
    if (!inputText.trim() && !inputImage) {
      setErrorMessage('Please enter notes or upload a screenshot to transform.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setInfoNotice(null);
    setGenerationStep('1/3: Reading notes & analyzing context...');

    const timer1 = setTimeout(() => {
      setGenerationStep('2/3: Structuring sections, tables & professional phrasing...');
    }, 1500);

    const timer2 = setTimeout(() => {
      setGenerationStep('3/3: Typesetting layout & applying theme styling...');
    }, 3200);

    try {
      let generatedDoc: SmartDocument | null = null;

      // 1. Attempt Server Gemini Generation (Unless forced to local)
      if (!forceLocal) {
        try {
          const res = await fetch('/api/generate-smart-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notesText: inputText,
              imageBase64: inputImage,
              documentType: selectedTemplateId !== 'auto' ? getTemplateById(selectedTemplateId).name : undefined,
              language: globalLanguage.name,
              writingStyle,
              quickMode,
              lengthMode,
              metadata: document?.metadata || {},
            }),
          });

          if (res.ok) {
            generatedDoc = await res.json();
            setInfoNotice(null);
          } else {
            const errData = await res.json().catch(() => ({}));
            console.warn(`Server AI returned ${res.status}:`, errData);
          }
        } catch (netErr) {
          console.warn('Network call failed, switching to local architect:', netErr);
        }
      }

      // 2. Seamless Local Structuring Fallback (Guarantees zero user downtime even if network/AI is 404/503)
      if (!generatedDoc) {
        generatedDoc = generateLocalFallbackDocument({
          notesText: inputText,
          hasImage: Boolean(inputImage),
          requestedType: selectedTemplateId !== 'auto' ? getTemplateById(selectedTemplateId).name : undefined,
          language: globalLanguage.name,
          writingStyle,
          quickMode,
          lengthMode,
          metadata: document?.metadata || {},
        });
        setInfoNotice('Structured via instant local document engine (ready to view & export).');
      }

      clearTimeout(timer1);
      clearTimeout(timer2);

      setDocument(generatedDoc);
      setActiveTab('preview');

      // Save to SnapAction History
      if (onSaveToHistory) {
        onSaveToHistory({
          title: generatedDoc.title,
          contentType: 'document',
          detectedIntent: 'smart_pdf_generation',
          lastAction: `Generate ${generatedDoc.documentType}`,
          lastResult: generatedDoc.executiveSummary || generatedDoc.title,
        });
      }
    } catch (err: any) {
      console.error('Error generating document:', err);
      // Emergency local fallback ensures user is never blocked
      try {
        const emergencyDoc = generateLocalFallbackDocument({
          notesText: inputText,
          hasImage: Boolean(inputImage),
          requestedType: selectedTemplateId !== 'auto' ? getTemplateById(selectedTemplateId).name : undefined,
          language: globalLanguage.name,
          writingStyle,
          quickMode,
          lengthMode,
        });
        setDocument(emergencyDoc);
        setActiveTab('preview');
        setInfoNotice('Structured via high-speed local document engine.');
      } catch {
        setErrorMessage(err.message || 'Failed to generate document. Please try again.');
      }
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
    }
  };

  // Theme Switching (Instant Local Operation — 0 AI tokens)
  const handleChangeTheme = (themeId: DocumentThemeId) => {
    if (!document) return;
    setDocument({ ...document, theme: themeId });
  };

  // Page Size / Orientation Switching (Instant Local Operation — 0 AI tokens)
  const handleChangePageSize = (size: PageSize, orientation: PageOrientation) => {
    if (!document) return;
    setDocument({ ...document, pageSize: size, orientation });
  };

  // Update Document Field Inline
  const handleUpdateDocumentField = (updates: Partial<SmartDocument>) => {
    if (!document) return;
    setDocument({ ...document, ...updates });
  };

  // Update Section Heading
  const handleUpdateSectionHeading = (secId: string, heading: string) => {
    if (!document) return;
    const updatedSections = document.sections.map((s) => (s.id === secId ? { ...s, heading } : s));
    setDocument({ ...document, sections: updatedSections });
  };

  // Update Block Content
  const handleUpdateBlockText = (secId: string, blockId: string, text: string) => {
    if (!document) return;
    const updatedSections = document.sections.map((s) => {
      if (s.id !== secId) return s;
      const updatedBlocks = s.blocks.map((b) => (b.id === blockId && b.type === 'paragraph' ? { ...b, text } : b));
      return { ...s, blocks: updatedBlocks };
    });
    setDocument({ ...document, sections: updatedSections });
  };

  // Update Table Cell
  const handleUpdateTableCell = (secId: string, blockId: string, rowIndex: number, colIndex: number, value: string) => {
    if (!document) return;
    const updatedSections = document.sections.map((s) => {
      if (s.id !== secId) return s;
      const updatedBlocks = s.blocks.map((b) => {
        if (b.id !== blockId || b.type !== 'table') return b;
        const newRows = b.rows.map((row, rIdx) => {
          if (rIdx !== rowIndex) return row;
          const newRow = [...row];
          newRow[colIndex] = value;
          return newRow;
        });
        return { ...b, rows: newRows };
      });
      return { ...s, blocks: updatedBlocks };
    });
    setDocument({ ...document, sections: updatedSections });
  };

  // Add Table Row
  const handleAddTableRow = (secId: string, blockId: string) => {
    if (!document) return;
    const updatedSections = document.sections.map((s) => {
      if (s.id !== secId) return s;
      const updatedBlocks = s.blocks.map((b) => {
        if (b.id !== blockId || b.type !== 'table') return b;
        const colCount = Math.max(b.headers.length, b.rows[0]?.length || 2);
        const emptyRow = Array(colCount).fill('New item');
        return { ...b, rows: [...b.rows, emptyRow] };
      });
      return { ...s, blocks: updatedBlocks };
    });
    setDocument({ ...document, sections: updatedSections });
  };

  // Delete Section
  const handleDeleteSection = (secId: string) => {
    if (!document) return;
    const updatedSections = document.sections.filter((s) => s.id !== secId);
    setDocument({ ...document, sections: updatedSections });
  };

  // Add New Section
  const handleAddNewSection = () => {
    if (!document) return;
    const newSec = {
      id: `sec_${Date.now()}`,
      heading: 'New Section',
      blocks: [
        {
          type: 'paragraph' as const,
          id: `b_${Date.now()}`,
          text: 'Add section notes or explanation here.',
        },
      ],
    };
    setDocument({ ...document, sections: [...document.sections, newSec] });
  };

  // Export to Native DOCX
  const handleExportDocx = async () => {
    if (!document) return;
    try {
      setIsExportingDocx(true);
      const blob = await exportDocumentToDocx(document);
      const filename = `${document.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35) || 'document'}.docx`;
      triggerDownload(blob, filename);
    } catch (err) {
      console.error('Failed to export DOCX', err);
      alert('Unable to generate DOCX in this browser session.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Copy Plain Text / Markdown
  const handleCopyText = () => {
    if (!document) return;
    let text = `# ${document.title}\n\n`;
    if (document.subtitle) text += `*${document.subtitle}*\n\n`;
    if (document.executiveSummary) text += `> ${document.executiveSummary}\n\n`;

    document.sections.forEach((s) => {
      text += `## ${s.heading}\n\n`;
      s.blocks.forEach((b) => {
        if (b.type === 'paragraph') text += `${b.text}\n\n`;
        if (b.type === 'list') {
          b.items.forEach((it, i) => {
            text += b.style === 'numbered' ? `${i + 1}. ${it}\n` : `- ${it}\n`;
          });
          text += '\n';
        }
        if (b.type === 'table') {
          text += `| ${b.headers.join(' | ')} |\n`;
          text += `| ${b.headers.map(() => '---').join(' | ')} |\n`;
          b.rows.forEach((r) => {
            text += `| ${r.join(' | ')} |\n`;
          });
          text += '\n';
        }
      });
    });

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Share Document
  const handleShareDocument = () => {
    if (!document) return;
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          text: `${document.title} - ${document.executiveSummary || 'Generated with SnapAction Smart PDF Studio'}`,
        })
        .catch(() => {});
    } else {
      handleCopyText();
    }
  };

  const currentTheme = document
    ? DOCUMENT_THEMES[document.theme] || DOCUMENT_THEMES['corporate-blue']
    : DOCUMENT_THEMES['corporate-blue'];

  // Categories for template library modal
  const templateCategories = [
    'All',
    'Business Documents',
    'Professional Documents',
    'Personal Productivity',
    'Education and Learning',
    'Career and Employment',
    'Creative and Marketing',
  ];

  const filteredTemplates = DOCUMENT_TEMPLATES.filter((t) => {
    const matchesCat = templateCategoryFilter === 'All' || t.category === templateCategoryFilter;
    const matchesSearch =
      !templateSearch ||
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.pdf,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
        className="hidden"
      />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Smart PDF Studio
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Turn Messy Notes Into Professional Documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Exit Studio
            </button>
          )}

          <button
            onClick={onOpenLanguageSelector}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
          >
            <span>{globalLanguage.flag}</span>
            <span className="hidden sm:inline">{globalLanguage.nativeName}</span>
          </button>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Notice:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* LOCAL ENGINE INFO NOTICE */}
      {infoNotice && (
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{infoNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateDocument(false)}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Polish with AI
            </button>
            <button
              onClick={() => setInfoNotice(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. INPUT & GENERATION VIEW (When no document is loaded) */}
      {/* ========================================================= */}
      {!document && (
        <div className="space-y-6">
          {/* Main Hero Prompt Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Step 1: Add Content
              </span>
              {inputText && (
                <button
                  onClick={() => {
                    setInputText('');
                    setInputImage(null);
                  }}
                  className="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Clear Notes
                </button>
              )}
            </div>

            {/* Large Input Textarea */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your notes, thoughts, screenshots or rough content here...&#10;&#10;e.g.: &quot;meeting monday client not happy delay material project progress 70% site safety issue three workers need training send updated report next week rajesh procurement follow up vendor&quot;"
                rows={7}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
              />

              {/* Image thumbnail badge if uploaded */}
              {inputImage && (
                <div className="absolute top-3 right-3 flex items-center gap-2 p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-md">
                  <img
                    src={inputImage}
                    alt="Thumbnail"
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setInputImage(null)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Input action toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                  + Add Screenshot
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
                  Upload File
                </button>

                <button
                  onClick={handlePasteClipboard}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clipboard className="w-3.5 h-3.5 text-emerald-500" />
                  Paste Text
                </button>
              </div>

              {/* Character count */}
              <span className="text-[11px] text-slate-400">
                {inputText.length} characters
              </span>
            </div>
          </div>

          {/* Step 2: Document Mode & Format Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Step 2: Choose Format & Style
              </span>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                {showAdvancedOptions ? 'Fewer Options' : 'More Options'}
              </button>
            </div>

            {/* Document Template Selector Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">
                  {selectedTemplateId === 'auto'
                    ? '✨'
                    : getTemplateById(selectedTemplateId).emoji}
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedTemplateId === 'auto'
                      ? 'Auto-Detect Document Type'
                      : getTemplateById(selectedTemplateId).name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedTemplateId === 'auto'
                      ? 'AI automatically identifies the optimal structure from 54 templates'
                      : getTemplateById(selectedTemplateId).description}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 shadow-2xs transition-colors cursor-pointer"
              >
                Browse 54 Templates
              </button>
            </div>

            {/* Quick Modes: 3 Options */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'organize_only', label: 'Organize Only', desc: 'Preserves wording, clean structure' },
                { id: 'professional_rewrite', label: 'Professional Rewrite', desc: 'Elevates grammar & executive tone' },
                { id: 'full_report', label: 'Create Full Report', desc: 'Comprehensive with recommendations' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setQuickMode(m.id as QuickDocumentMode)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    quickMode === m.id
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 shadow-sm'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Advanced Options Drawer */}
            {showAdvancedOptions && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 space-y-4 animate-in fade-in">
                {/* Length Options */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Document Length
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['concise', 'standard', 'detailed'] as DocumentLengthMode[]).map((len) => (
                      <button
                        key={len}
                        onClick={() => setLengthMode(len)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold capitalize transition-colors ${
                          lengthMode === len
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {len}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Writing Style */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Writing Style
                  </label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value as WritingStyle)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="professional">Professional (Balanced & Polished)</option>
                    <option value="executive">Executive (High-Impact Decision Focused)</option>
                    <option value="formal">Formal (Official & Authoritative)</option>
                    <option value="technical">Technical (Engineering & Data Driven)</option>
                    <option value="academic">Academic (Scholarly & Rigorous)</option>
                    <option value="simple">Simple (Plain English & Clear)</option>
                    <option value="persuasive">Persuasive (Pitch & Proposal)</option>
                    <option value="educational">Educational (Explanatory & Pedagogical)</option>
                    <option value="concise">Concise (Bullet-heavy & Direct)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Massive Primary CTA: Make It Professional */}
            <button
              onClick={() => handleGenerateDocument()}
              disabled={isGenerating || (!inputText.trim() && !inputImage)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black text-base sm:text-lg shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{generationStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>✨ Make It Professional</span>
                </>
              )}
            </button>
          </div>

          {/* Quick 1-Tap Sample Notes for Demonstration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Try 1-Tap Sample Notes
              </span>
              <span className="text-xs text-slate-400">Instant test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {SAMPLE_NOTE_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleLoadSample(sc)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 text-left transition-all group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{sc.emoji}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {sc.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {sc.rawNotes}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. DOCUMENT PREVIEW & EXPORT STUDIO (When document is ready) */}
      {/* ========================================================= */}
      {document && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-3">
            {/* Left: View Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Page Preview
              </button>
              <button
                onClick={() => setActiveTab('before_after')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'before_after'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Before / After
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Edit Content
              </button>
            </div>

            {/* Right: Primary Export Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* PDF Vector Print / Download */}
              <button
                onClick={() => printDocumentAsPdf(document)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                title="Print or Save as authentic Vector PDF"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>

              {/* Word DOCX Download */}
              <button
                onClick={handleExportDocx}
                disabled={isExportingDocx}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="Download editable Microsoft Word .docx"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                DOCX
              </button>

              {/* Copy Plain Text */}
              <button
                onClick={handleCopyText}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Copy structured text"
              >
                {copiedNotification ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Native Share */}
              <button
                onClick={handleShareDocument}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Share Document"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* New Document Button */}
              <button
                onClick={() => setDocument(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                + New
              </button>
            </div>
          </div>

          {/* Theme & Page Setup Ribbon */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-3">
            {/* 6 Theme Selector Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Theme:
              </span>
              {(Object.keys(DOCUMENT_THEMES) as DocumentThemeId[]).map((thId) => {
                const th = DOCUMENT_THEMES[thId];
                const isActive = document.theme === thId;
                return (
                  <button
                    key={thId}
                    onClick={() => handleChangeTheme(thId)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: th.primaryColor }}
                    />
                    <span>{th.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Document Identity & Page Size Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsIdentityModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer hover:bg-slate-100"
              >
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                Letterhead & Org
              </button>

              <select
                value={`${document.pageSize}-${document.orientation}`}
                onChange={(e) => {
                  const [size, ori] = e.target.value.split('-') as [PageSize, PageOrientation];
                  handleChangePageSize(size, ori);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="A4-portrait">A4 Portrait</option>
                <option value="A4-landscape">A4 Landscape</option>
                <option value="Letter-portrait">US Letter</option>
              </select>
            </div>
          </div>

          {/* TAB 1: REALISTIC DOCUMENT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="bg-slate-200 dark:bg-slate-950 p-4 sm:p-8 rounded-3xl overflow-x-auto shadow-inner">
              <div
                className="bg-white text-slate-900 mx-auto shadow-2xl rounded-sm p-8 sm:p-14 transition-all"
                style={{
                  maxWidth: document.orientation === 'landscape' ? '1000px' : '794px',
                  minHeight: '1000px',
                  fontFamily: currentTheme.fontFamilyBody,
                }}
              >
                {/* Header Banner */}
                <div
                  className="flex items-start justify-between pb-4 mb-6 border-b-2 gap-4"
                  style={{ borderColor: currentTheme.secondaryColor }}
                >
                  <div>
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm mb-2"
                      style={{
                        backgroundColor: currentTheme.badgeBg,
                        color: currentTheme.badgeTextColor,
                      }}
                    >
                      {document.documentType}
                    </span>
                    <h1
                      className="text-2xl sm:text-3xl font-black tracking-tight"
                      style={{
                        color: currentTheme.primaryColor,
                        fontFamily: currentTheme.fontFamilyHeading,
                      }}
                    >
                      {document.title}
                    </h1>
                    {document.subtitle && (
                      <p className="text-sm text-slate-500 mt-1">{document.subtitle}</p>
                    )}
                  </div>

                  {/* Metadata Sidebar */}
                  <div className="text-right text-[10px] text-slate-500 border-l border-slate-200 pl-4 space-y-0.5 min-w-[120px]">
                    {document.metadata.companyName && (
                      <div>
                        <span className="font-bold text-slate-700">Org:</span>{' '}
                        {document.metadata.companyName}
                      </div>
                    )}
                    {document.metadata.preparedBy && (
                      <div>
                        <span className="font-bold text-slate-700">Author:</span>{' '}
                        {document.metadata.preparedBy}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-700">Date:</span>{' '}
                      {document.metadata.date || new Date().toISOString().split('T')[0]}
                    </div>
                    {document.metadata.documentReference && (
                      <div>
                        <span className="font-bold text-slate-700">Ref:</span>{' '}
                        {document.metadata.documentReference}
                      </div>
                    )}
                  </div>
                </div>

                {/* Executive Summary Card */}
                {document.executiveSummary && (
                  <div
                    className="p-4 rounded-r-lg mb-8 border-l-4"
                    style={{
                      backgroundColor: '#f8fafc',
                      borderLeftColor: currentTheme.secondaryColor,
                    }}
                  >
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: currentTheme.primaryColor }}
                    >
                      Executive Overview
                    </div>
                    <p className="text-sm italic text-slate-700 leading-relaxed">
                      {document.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Content Sections */}
                <div className="space-y-6">
                  {document.sections.map((sec, secIdx) => (
                    <div key={sec.id} className="space-y-3">
                      <h2
                        className="text-base sm:text-lg font-bold flex items-center gap-2 pb-1 border-b"
                        style={{
                          color: currentTheme.primaryColor,
                          borderColor: currentTheme.borderColor,
                          fontFamily: currentTheme.fontFamilyHeading,
                        }}
                      >
                        <span
                          className="w-5 h-5 rounded text-[10px] font-black flex items-center justify-center text-white"
                          style={{ backgroundColor: currentTheme.primaryColor }}
                        >
                          {String(secIdx + 1).padStart(2, '0')}
                        </span>
                        <span>{sec.heading}</span>
                      </h2>

                      <div className="space-y-2.5">
                        {sec.blocks.map((b) => {
                          if (b.type === 'paragraph') {
                            const calloutBg =
                              b.calloutType === 'info'
                                ? 'bg-blue-50 border-blue-400'
                                : b.calloutType === 'warning'
                                ? 'bg-amber-50 border-amber-400'
                                : b.calloutType === 'tip'
                                ? 'bg-emerald-50 border-emerald-400'
                                : b.calloutType === 'quote'
                                ? 'bg-purple-50 border-purple-400 italic'
                                : '';
                            return (
                              <p
                                key={b.id}
                                className={`text-xs sm:text-sm text-slate-800 leading-relaxed ${
                                  b.calloutType
                                    ? `p-3 rounded-lg border-l-4 ${calloutBg}`
                                    : ''
                                }`}
                              >
                                {b.text}
                              </p>
                            );
                          }
                          if (b.type === 'list') {
                            const Tag = b.style === 'numbered' ? 'ol' : 'ul';
                            return (
                              <Tag
                                key={b.id}
                                className={`text-xs sm:text-sm text-slate-800 space-y-1.5 pl-5 ${
                                  b.style === 'numbered'
                                    ? 'list-decimal'
                                    : 'list-disc'
                                }`}
                              >
                                {b.items.map((it, iIdx) => (
                                  <li key={iIdx}>{it}</li>
                                ))}
                              </Tag>
                            );
                          }
                          if (b.type === 'table') {
                            return (
                              <div
                                key={b.id}
                                className="overflow-x-auto rounded-lg border border-slate-200 my-3"
                              >
                                <table className="w-full text-xs text-left border-collapse">
                                  {b.headers && b.headers.length > 0 && (
                                    <thead>
                                      <tr
                                        style={{
                                          backgroundColor: currentTheme.tableHeaderBg,
                                          color: currentTheme.tableHeaderTextColor,
                                        }}
                                      >
                                        {b.headers.map((h, hIdx) => (
                                          <th
                                            key={hIdx}
                                            className="p-2.5 font-bold border-r border-white/20 last:border-r-0"
                                          >
                                            {h}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                  )}
                                  <tbody>
                                    {b.rows.map((row, rIdx) => (
                                      <tr
                                        key={rIdx}
                                        className={
                                          rIdx % 2 === 1
                                            ? 'bg-slate-50'
                                            : 'bg-white'
                                        }
                                      >
                                        {row.map((cell, cIdx) => (
                                          <td
                                            key={cIdx}
                                            className="p-2.5 border-t border-slate-200 text-slate-800"
                                          >
                                            {cell}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }
                          if (b.type === 'key_value') {
                            return (
                              <div
                                key={b.id}
                                className="grid grid-cols-2 gap-2 text-xs py-1"
                              >
                                {b.pairs.map((p, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="p-2 rounded bg-slate-50 border border-slate-100"
                                  >
                                    <span className="font-bold text-slate-700 block text-[10px]">
                                      {p.label}
                                    </span>
                                    <span className="text-slate-900">{p.value}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{document.title} · SnapAction Smart PDF Studio</span>
                  <span>
                    {document.metadata.confidentialityNotice ||
                      'Confidential & Proprietary'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BEFORE & AFTER TRANSFORMATION */}
          {activeTab === 'before_after' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BEFORE: Messy Notes */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Before: Messy Notes
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Raw Input</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {document.rawInputSnippet || inputText || 'No original notes available.'}
                </div>
              </div>

              {/* AFTER: Professional Document */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      After: Professional Document
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {document.documentType}
                  </span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {document.title}
                    </h4>
                    {document.executiveSummary && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                        {document.executiveSummary}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    {document.sections.map((s, idx) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 space-y-1"
                      >
                        <div className="font-bold text-slate-900 dark:text-white">
                          {idx + 1}. {s.heading}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {s.blocks.length} block(s) · Formatted & verified
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INLINE EDIT CONTENT */}
          {activeTab === 'edit' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Direct Document Editor
                  </h3>
                  <p className="text-xs text-slate-500">
                    Edit titles, headings, paragraphs, and tables in place. Zero technical code required.
                  </p>
                </div>

                <button
                  onClick={handleAddNewSection}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </button>
              </div>

              {/* Title & Summary Editor */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={document.title}
                    onChange={(e) => handleUpdateDocumentField({ title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Executive Summary / Purpose
                  </label>
                  <textarea
                    value={document.executiveSummary || ''}
                    onChange={(e) =>
                      handleUpdateDocumentField({ executiveSummary: e.target.value })
                    }
                    rows={2}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none resize-y"
                  />
                </div>
              </div>

              {/* Section-by-Section Editor */}
              <div className="space-y-6 pt-2">
                {document.sections.map((sec, secIdx) => (
                  <div
                    key={sec.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center">
                          {secIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={sec.heading}
                          onChange={(e) =>
                            handleUpdateSectionHeading(sec.id, e.target.value)
                          }
                          className="flex-1 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Section Blocks */}
                    <div className="space-y-2.5">
                      {sec.blocks.map((b) => {
                        if (b.type === 'paragraph') {
                          return (
                            <div key={b.id} className="relative">
                              <textarea
                                value={b.text}
                                onChange={(e) =>
                                  handleUpdateBlockText(sec.id, b.id, e.target.value)
                                }
                                rows={2}
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>
                          );
                        }
                        if (b.type === 'table') {
                          return (
                            <div key={b.id} className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                                <span>Table Data</span>
                                <button
                                  onClick={() => handleAddTableRow(sec.id, b.id)}
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Row
                                </button>
                              </div>
                              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-slate-100 dark:bg-slate-800">
                                      {b.headers.map((h, hIdx) => (
                                        <th key={hIdx} className="p-2 text-left font-bold">
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {b.rows.map((row, rIdx) => (
                                      <tr key={rIdx} className="border-t border-slate-200 dark:border-slate-700">
                                        {row.map((cell, cIdx) => (
                                          <td key={cIdx} className="p-1.5">
                                            <input
                                              type="text"
                                              value={cell}
                                              onChange={(e) =>
                                                handleUpdateTableCell(
                                                  sec.id,
                                                  b.id,
                                                  rIdx,
                                                  cIdx,
                                                  e.target.value
                                                )
                                              }
                                              className="w-full p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                                            />
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TEMPLATE SELECTION MODAL (54 Templates) */}
      {/* ========================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Document Template Library
                </h3>
                <p className="text-xs text-slate-500">
                  Select from 54 curated professional document formats
                </p>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="space-y-2 shrink-0">
              <input
                type="text"
                placeholder="Search templates (e.g. Minutes, Proposal, Study, Resume)..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {templateCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTemplateCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-semibold cursor-pointer ${
                      templateCategoryFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1 flex-1">
              <button
                onClick={() => {
                  setSelectedTemplateId('auto');
                  setIsTemplateModalOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedTemplateId === 'auto'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Auto-Detect Format
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  AI reads content and picks the optimal format.
                </p>
              </button>

              {filteredTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setIsTemplateModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedTemplateId === tpl.id
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tpl.emoji}</span>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {tpl.name}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. LETTERHEAD & ORG IDENTITY MODAL */}
      {/* ========================================================= */}
      {isIdentityModalOpen && document && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Letterhead & Document Identity
              </h3>
              <button
                onClick={() => setIsIdentityModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation or Stanford University"
                  value={document.metadata.companyName || ''}
                  onChange={(e) =>
                    handleUpdateDocumentField({
                      metadata: { ...document.metadata, companyName: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Prepared By (Author / Designation)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe, Lead Project Manager"
                  value={document.metadata.preparedBy || ''}
                  onChange={(e) =>
                    handleUpdateDocumentField({
                      metadata: { ...document.metadata, preparedBy: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Reference Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DOC-2026-084"
                  value={document.metadata.documentReference || ''}
                  onChange={(e) =>
                    handleUpdateDocumentField({
                      metadata: { ...document.metadata, documentReference: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confidentiality Notice
                </label>
                <input
                  type="text"
                  placeholder="e.g. Confidential & Proprietary"
                  value={document.metadata.confidentialityNotice || ''}
                  onChange={(e) =>
                    handleUpdateDocumentField({
                      metadata: {
                        ...document.metadata,
                        confidentialityNotice: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <button
              onClick={() => setIsIdentityModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
            >
              Apply to Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
