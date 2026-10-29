import React, { useState } from 'react';
import {
  X,
  FileText,
  Scan,
  MessageSquare,
  FileCode,
  Download,
  Languages,
  Activity,
  Zap,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  HelpCircle,
  Copy,
  Layers,
  Wand2,
  Cpu,
} from 'lucide-react';

export interface ToolItem {
  id: string;
  name: string;
  category: 'Document Creation' | 'Visual Intelligence' | 'Communication' | 'Productivity';
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  tagline: string;
  whatItDoes: string;
  howToUse: string[];
  howItHelps: string[];
  actionLabel: string;
  onLaunch?: () => void;
}

interface ToolsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: 'home' | 'history' | 'settings' | 'pdf') => void;
  onOpenLanguageSelector: () => void;
  onOpenDiagnostics?: () => void;
}

export const ToolsDirectoryModal: React.FC<ToolsDirectoryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenLanguageSelector,
  onOpenDiagnostics,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const tools: ToolItem[] = [
    {
      id: 'smart_pdf_studio',
      name: 'Smart PDF Studio (Dynamic Document Architect)',
      category: 'Document Creation',
      badge: 'PRO · AI Architect',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      tagline: 'Transforms raw notes, photos & meeting transcripts into tailored, professional documents.',
      whatItDoes:
        'Operates as an adaptive document architect that analyzes the true meaning of your notes instead of forcing fixed template boilerplate headings. Synthesizes content-specific section titles, timelines, data tables, and dynamic layouts.',
      howToUse: [
        '1. Paste raw notes, type thoughts, or upload a photo of handwritten notes/whiteboard.',
        '2. AI automatically classifies domain (Travel, Meetings, Education, Business, Engineering, Medical, Personal).',
        '3. Customize design (6 themes, 6 layout profiles, density) or use the 10 Restructure Modes.',
        '4. Download vector-sharp PDF, native Microsoft Word (.docx), or copy markdown.',
      ],
      howItHelps: [
        '• Saves 2–4 hours formatting meeting minutes, study guides, proposals, or travel itineraries.',
        '• Zero generic boilerplate headings (no automatic "Executive Summary" on travel plans or personal journals).',
        '• Includes letterhead, company branding, confidentiality notices, and clean styling out of the box.',
      ],
      actionLabel: 'Launch Smart PDF Studio',
      onLaunch: () => {
        onClose();
        onNavigateToTab('pdf');
      },
    },
    {
      id: 'screenshot_analyzer',
      name: 'Instant Screenshot Scanner & Intent Engine',
      category: 'Visual Intelligence',
      badge: 'Multimodal AI',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: <Scan className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      tagline: 'Detects context, text, receipts, code, schedules, and social posts from any screenshot.',
      whatItDoes:
        'Upload or paste any screenshot. The visual parsing engine extracts all textual information, recognizes data types (expenses, flights, WhatsApp conversations, error codes), and surfaces instant 1-tap actions.',
      howToUse: [
        '1. Press Ctrl+V (or Cmd+V) anywhere on the home screen or click "Upload Screenshot".',
        '2. AI extracts plain text, identifies key entities, numbers, dates, and people.',
        '3. Pick from ranked recommended actions or execute instant tasks.',
      ],
      howItHelps: [
        '• Eliminates manual data entry from screenshots and images.',
        '• Works with messy screenshots, receipts, timetables, and mobile app captures.',
        '• One-click export of data to clipboard, structured summary, or follow-up draft.',
      ],
      actionLabel: 'Scan a Screenshot Now',
      onLaunch: () => {
        onClose();
        onNavigateToTab('home');
      },
    },
    {
      id: 'multilingual_reply_studio',
      name: 'Multilingual Social Comment & Reply Studio',
      category: 'Communication',
      badge: '100+ Dialects',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      tagline: 'Crafts high-engagement, human-sounding replies across 20+ tone personas in any language.',
      whatItDoes:
        'Generates culturally authentic, context-aware responses to social media comments, customer reviews, support inquiries, and forum threads in 100+ native languages.',
      howToUse: [
        '1. Paste comment text or upload a screenshot of your social post / review.',
        '2. Select tone: Professional, Friendly, Witty, De-escalation, Empathic, or Influencer.',
        '3. Select target language and click Generate for instant, ready-to-post responses.',
      ],
      howItHelps: [
        '• 10x faster response time for creators, community managers, and businesses.',
        '• Prevents PR disasters with calibrated de-escalation tones.',
        '• Native dialect idioms with zero artificial translation feel.',
      ],
      actionLabel: 'Open Social Reply Studio',
      onLaunch: () => {
        onClose();
        onNavigateToTab('home');
      },
    },
    {
      id: 'screenshot_transcription',
      name: 'Multimodal Screenshot OCR & Text Extractor',
      category: 'Visual Intelligence',
      badge: 'High Accuracy OCR',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      icon: <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
      tagline: 'Instantly transcribes handwriting, receipts, book pages, and slides directly into editable text.',
      whatItDoes:
        'Uses advanced multimodal AI to transcribe text directly from pasted clipboard images, scanned documents, WhatsApp screenshots, whiteboard notes, and slides with flawless line-breaks and tabular preservation.',
      howToUse: [
        '1. Copy any image to your clipboard and hit Ctrl+V / Cmd+V in SnapAction AI.',
        '2. The OCR engine automatically transcribes the content into editable notes in seconds.',
        '3. Edit, format, copy, or send directly into the Smart PDF Studio.',
      ],
      howItHelps: [
        '• Never type out a recipe, lecture slide, business card, or receipt again.',
        '• Handles low-contrast screenshots, mixed handwriting, and multi-column tables.',
      ],
      actionLabel: 'Try Text Transcription',
      onLaunch: () => {
        onClose();
        onNavigateToTab('pdf');
      },
    },
    {
      id: 'smart_restructure_engine',
      name: 'Document Restructure & Refactoring Engine (10 Modes)',
      category: 'Document Creation',
      badge: 'Architect Refactor',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      tagline: 'Transforms document tone, density, table presence, and outline on demand without data loss.',
      whatItDoes:
        'Provides 10 specialized architectural modes: More Concise, More Detailed, More Narrative, More Structured, Less Tables, More Tables Where Useful, Simplify, Executive Format, Educational Format, and Custom Instructions.',
      howToUse: [
        '1. Generate or load any document in Smart PDF Studio.',
        '2. Click the "Restructure Document" button on the architect toolbar.',
        '3. Select an architectural transformation mode or write custom instructions.',
      ],
      howItHelps: [
        '• Adapt the same source content for different audiences (e.g. Executive Summary for CEO vs Detailed Study Guide for students).',
        '• Reorganizes logic and eliminates fluff while preserving 100% of your original facts.',
      ],
      actionLabel: 'Explore Restructure Modes',
      onLaunch: () => {
        onClose();
        onNavigateToTab('pdf');
      },
    },
    {
      id: 'docx_and_vector_pdf',
      name: 'Vector PDF & Native Word (.docx) Exporters',
      category: 'Productivity',
      badge: 'Zero Subscription',
      badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      icon: <Download className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
      tagline: 'Export publication-ready vector PDFs and fully editable Microsoft Word .docx files.',
      whatItDoes:
        'Builds vector-crisp PDF documents with custom typography, responsive tables, callout blocks, and headers, and generates authentic OpenXML `.docx` files ready to edit in Word, Google Docs, or LibreOffice.',
      howToUse: [
        '1. After generating your document, click "Download PDF" for print-ready vector quality.',
        '2. Or click "DOCX" to download an editable Word file.',
        '3. Share or archive directly from your browser without third-party converters.',
      ],
      howItHelps: [
        '• No expensive Adobe Acrobat or Microsoft 365 license needed.',
        '• Flawless formatting on mobile, desktop, and physical prints.',
      ],
      actionLabel: 'View Exporter Features',
      onLaunch: () => {
        onClose();
        onNavigateToTab('pdf');
      },
    },
    {
      id: 'global_translator',
      name: 'Global 100+ Language Translator & Locale Engine',
      category: 'Communication',
      badge: 'Universal',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: <Languages className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      tagline: 'Switch the entire AI reasoning and formatting pipeline into your native language.',
      whatItDoes:
        'Supports 100+ global languages and regional scripts (Arabic, Spanish, Hindi, Chinese, German, Japanese, French, Portuguese, Bengali, Russian, and more). Prompts, reasoning, and document typesetting adapt to local typographical norms.',
      howToUse: [
        '1. Tap the Flag / Language button in the header bar anytime.',
        '2. Search or select your native tongue.',
        '3. All subsequent documents, replies, and summaries are generated in your chosen language.',
      ],
      howItHelps: [
        '• Perfect for international teams, global students, and multilingual business operations.',
        '• Preserves right-to-left formatting (RTL) and regional numerical systems.',
      ],
      actionLabel: 'Select Language',
      onLaunch: () => {
        onClose();
        onOpenLanguageSelector();
      },
    },
    {
      id: 'smart_ai_router',
      name: 'Smart AI Router (WebLLM + Transformers.js + Chrome AI)',
      category: 'Productivity',
      badge: '3 Local Engines',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      tagline: 'Maximizes free on-device processing via WebLLM, Transformers.js & Chrome Built-in AI with zero token waste.',
      whatItDoes:
        'A unified local AI router that coordinates 5 execution engines: Internal Code (0 tokens), Transformers.js (on-device sentiment & classification), Chrome Built-in AI (Gemini Nano & native translation), WebLLM (on-device WebGPU generative AI), and Cloud AI Gateway. Runs locally whenever your device and language allow, saving 95%+ of API calls.',
      howToUse: [
        '1. Works automatically on every action, comment reply, and document generation.',
        '2. Configure preferences in Settings: "Automatic (Recommended)", "Prefer On-Device", or "Cloud With Permission".',
        '3. Every result displays an authentic badge showing which engine executed it (e.g., ⚡ On-Device WebLLM vs ☁️ Cloud AI).',
        '4. View on-device token savings and live engine health in the Diagnostics modal.',
      ],
      howItHelps: [
        '• 100% on-device privacy for sensitive screenshots and personal notes.',
        '• Free, zero-cost processing without consuming external API rate limits.',
        '• Continues working offline after model download with zero downtime.',
      ],
      actionLabel: 'Configure in Settings',
      onLaunch: () => {
        onClose();
        onNavigateToTab('settings');
      },
    },
  ];

  const categories = ['All', 'Document Creation', 'Visual Intelligence', 'Communication', 'Productivity'];

  const filteredTools = tools.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.whatItDoes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.howItHelps.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                8 Integrated AI Engines
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Tools & User Guide</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              SnapAction AI Tools Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Everything you need to turn raw screenshots and messy notes into structured actions and professional documents.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0 bg-white dark:bg-slate-900">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools, workflows, or capabilities (e.g. PDF, OCR, DOCX, Table, Reply)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Tool Cards List */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick 3-Step Overview */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-violet-950/30 border border-blue-200/60 dark:border-blue-900/60 space-y-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>How SnapAction AI Helps You (Simple 3-Step Flow)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40">
                <span className="font-extrabold text-blue-600 dark:text-blue-400 block mb-0.5">1. Paste or Capture</span>
                Drop any screenshot, photo, or handwritten note directly into the app (Ctrl+V works everywhere).
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40">
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block mb-0.5">2. Intelligent Architecture</span>
                AI analyzes meaning, extracts structured tables, cleans grammar, or synthesizes publication-grade sections.
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40">
                <span className="font-extrabold text-violet-600 dark:text-violet-400 block mb-0.5">3. Export & Execute</span>
                Instantly download Vector PDF, editable DOCX, copy text, or post replies in seconds.
              </div>
            </div>
          </div>

          {/* Filtered Tools */}
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
            >
              {/* Tool Header */}
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {tool.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tool.badgeColor}`}
                  >
                    {tool.badge}
                  </span>
                </div>
              </div>

              {/* What It Does */}
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  What It Does:
                </span>
                {tool.whatItDoes}
              </div>

              {/* 2-Column Details: How to Use & How It Helps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* How To Use */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <HelpCircle className="w-3.5 h-3.5" />
                    How to Use It:
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {tool.howToUse.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* How It Helps You */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    How It Helps You:
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {tool.howItHelps.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Launch Action */}
              {tool.onLaunch && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={tool.onLaunch}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{tool.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredTools.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold">No tools match "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-blue-600 font-bold underline cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>SnapAction AI · All 8 tools available with zero external subscription</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
