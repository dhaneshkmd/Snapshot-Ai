import React, { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Briefcase,
  FileText,
  Share2,
  TrendingUp,
  Code2,
  Calendar,
  ShoppingBag,
  Receipt,
  MapPin,
  Globe,
  Hash,
  Terminal,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import { MoreAction } from '../types';

interface MoreActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshotMoreActions: MoreAction[];
  onSelectAction: (actionName: string, actionPrompt: string) => void;
}

interface PredefinedActionCategory {
  name: string;
  icon: any;
  actions: { name: string; prompt: string }[];
}

const GLOBAL_CATEGORIES: PredefinedActionCategory[] = [
  {
    name: 'SEO & Keywords',
    icon: Globe,
    actions: [
      {
        name: 'SEO Keywords & Search Intent',
        prompt:
          'Analyze this screenshot and generate primary high-volume keywords, secondary long-tail keywords, search intent (Informational, Commercial, or Transactional), and target user search queries.',
      },
      {
        name: 'Meta Title & Description',
        prompt:
          'Generate 3 SEO-optimized Title Tags (strictly under 60 characters) and 3 Meta Descriptions (strictly under 160 characters) with high click-through rate (CTR) appeal.',
      },
      {
        name: 'Full SEO Optimization Package',
        prompt:
          'Generate a complete SEO optimization package: Focus Keyword, Secondary & LSI Keywords, recommended URL slug, H1/H2 header architecture, meta tags, and keyword placement recommendations.',
      },
      {
        name: 'Keyword Density & Content Outline',
        prompt:
          'Extract all key terms and generate an SEO content outline with recommended target keyword frequencies and heading structure.',
      },
    ],
  },
  {
    name: 'Social & Viral Media',
    icon: Hash,
    actions: [
      {
        name: 'Title, Caption & Hashtags',
        prompt:
          'Generate 3 catchy high-converting Titles, an engaging Caption formatted with storytelling, emojis, and clear Call to Action (CTA), and 20 curated Hashtags categorized into broad, niche, and trending.',
      },
      {
        name: 'Viral Hooks & Short Captions',
        prompt:
          'Generate 5 viral hook titles and punchy short-form captions with trending hashtags for TikTok, Instagram Reels, and YouTube Shorts.',
      },
      {
        name: 'YouTube Title, Description & Tags',
        prompt:
          'Generate 3 high-CTR YouTube video titles, an optimized video description with timestamp chapters, and SEO video tags.',
      },
      {
        name: 'Create LinkedIn Post',
        prompt:
          'Turn this screenshot into an insightful LinkedIn post with a strong hook, structured body, and relevant hashtags.',
      },
      {
        name: 'Create X / Twitter Thread',
        prompt:
          'Write a punchy, engaging X/Twitter thread (3-5 tweets) with strong hooks and hashtags based on this screenshot.',
      },
    ],
  },
  {
    name: 'Image & Video JSON Prompts',
    icon: Video,
    actions: [
      {
        name: 'Image JSON Prompt (Flux / Midjourney / DALL-E)',
        prompt:
          'Generate a developer-grade Image Generation JSON Prompt specification in valid JSON: model_target (Flux.1 / Midjourney v6 / Imagen 3), prompt (composition, lighting, style, camera angle, textures), negative_prompt, technical_attributes (camera_lens, lighting_style, color_palette), parameters (aspect_ratio, cfg_scale, steps, sampler), and api_request_payload based on this screenshot.',
      },
      {
        name: 'Video JSON Prompt (Sora / Runway / Kling)',
        prompt:
          'Generate a developer-grade Video Generation JSON Prompt specification in valid JSON: model_target (Sora / Runway Gen-3 / Kling 1.5), scene_description, camera_motion (pan, tilt, zoom, dolly), motion_pacing, parameters (duration_seconds, fps, aspect_ratio, motion_intensity), timeline_keyframes (0s, 2.5s, 5s), audio_prompt, and api_request_payload based on this screenshot.',
      },
      {
        name: 'ComfyUI Workflow JSON Prompt',
        prompt:
          'Generate a ComfyUI node-compatible JSON prompt payload configuring checkpoint, positive conditioning, negative conditioning, and KSampler settings for this visual content.',
      },
      {
        name: 'Cinematic Camera Direction JSON',
        prompt:
          'Generate a cinematic camera direction JSON prompt specifying shot type, lens focal length, aperture, lighting rig, motion trajectory, and color grading based on this screenshot.',
      },
    ],
  },
  {
    name: 'Developer & JSON Prompt Script',
    icon: Terminal,
    actions: [
      {
        name: 'JSON Prompt Script Developer',
        prompt:
          'Generate a developer-grade JSON Prompt Script specification in valid JSON: system_instruction, task_definition, input_variables, output_schema, few_shot_examples, recommended_parameters (temperature, max_tokens), and cURL test script for building LLM applications.',
      },
      {
        name: 'Image JSON Prompt',
        prompt:
          'Generate a complete Image Generation JSON Prompt specification (model_target, prompt, negative_prompt, camera, lighting, aspect_ratio, and api_request_payload) based on this screenshot.',
      },
      {
        name: 'Video JSON Prompt',
        prompt:
          'Generate a complete Video Generation JSON Prompt specification (model_target, scene_description, camera_motion, timeline_keyframes, and api_request_payload) based on this screenshot.',
      },
      {
        name: 'Structured JSON Schema Payload',
        prompt:
          'Convert this screenshot data into a production-ready JSON schema payload accompanied by a TypeScript interface definition.',
      },
      {
        name: 'API Automation Script (cURL & Node.js)',
        prompt:
          'Generate an API automation script (cURL request and Node.js fetch script) simulating the interaction or data workflow shown in this screenshot.',
      },
      {
        name: 'Turn into AI Studio Prompt',
        prompt:
          'Create an optimized, detailed system prompt and user prompt blueprint based on this screenshot.',
      },
    ],
  },
  {
    name: 'Text & Tables',
    icon: FileText,
    actions: [
      { name: 'Extract Text', prompt: 'Extract and cleanly format all text from the image verbatim.' },
      {
        name: 'Convert into Table',
        prompt:
          'Convert all data, rows, items, and values from this screenshot into a clean, well-formatted Markdown table with clear column headers (e.g. Item, Description, Value, Category).',
      },
      { name: 'Summarize', prompt: 'Provide a concise summary with the key takeaways in 3-5 bullet points.' },
      { name: 'Explain Simply', prompt: 'Explain the content of this screenshot in simple, plain English like I am 5 years old.' },
      { name: 'Translate', prompt: 'Translate all key text and meaning from this screenshot into clear English (or target language).' },
      { name: 'Turn Into Notes', prompt: 'Convert the information in this screenshot into organized study/work notes with headers and bullets.' },
    ],
  },
  {
    name: 'Communication',
    icon: MessageSquare,
    actions: [
      { name: 'Professional Reply', prompt: 'Draft a polite, professional reply directly responding to this screenshot.' },
      { name: 'Friendly Reply', prompt: 'Draft a casual, warm, and friendly reply for messaging apps.' },
      { name: 'Short Reply', prompt: 'Draft a quick 1-sentence reply answering the question or acknowledging the message.' },
      { name: 'Email Reply', prompt: 'Draft a formal email reply with greeting, structured body, and sign-off.' },
      { name: 'Follow-up Message', prompt: 'Write a courteous follow-up message referencing this screenshot.' },
    ],
  },
  {
    name: 'Jobs & Career',
    icon: Briefcase,
    actions: [
      {
        name: 'CV Keywords & Resume Sentences',
        prompt:
          'Extract all critical SEO/ATS keywords from this job vacancy, identify complementary similar/adjacent skills that enhance the profile, and convert each keyword into ready-to-paste, accomplishment-driven CV sentences with quantifiable metrics.',
      },
      {
        name: 'ATS Keyword Audit & Match',
        prompt:
          'Provide a complete ATS keyword match breakdown: mandatory keywords, preferred keywords, recommended adjacent skills, and a tailored resume summary statement.',
      },
      { name: 'Tailor Resume Pitch', prompt: 'Create bullet points tailored to the job requirements shown in this screenshot.' },
      { name: 'Create Cover Letter', prompt: 'Write a persuasive, customized cover letter for this position.' },
      { name: 'Generate Interview Questions', prompt: 'Generate top 8 likely interview questions based on the role and how to answer them.' },
      { name: 'Identify Required Skills', prompt: 'Extract all must-have hard and soft skills into an actionable preparation checklist.' },
    ],
  },
  {
    name: 'Stocks & Finance',
    icon: TrendingUp,
    actions: [
      { name: 'Explain Chart', prompt: 'Explain what this stock chart or market indicator signifies in plain terms.' },
      { name: 'Create Investment Note', prompt: 'Write a structured investment research note detailing ticker, price action, and risks.' },
      { name: 'Convert to Structured Data', prompt: 'Extract all financial metrics, prices, and percentages into a neat Markdown table.' },
    ],
  },
  {
    name: 'Receipts & Expenses',
    icon: Receipt,
    actions: [
      { name: 'Save Expense Note', prompt: 'Format merchant, date, tax, payment method, and total into a clean expense log.' },
      { name: 'Export as CSV', prompt: 'Format the line items, quantities, and prices as CSV table format.' },
      { name: 'Accounting Entry', prompt: 'Generate an accounting entry with debit/credit categorization for this receipt.' },
    ],
  },
  {
    name: 'Code & Errors',
    icon: Code2,
    actions: [
      { name: 'Explain Error', prompt: 'Explain the root cause of this error message in simple language.' },
      { name: 'Generate Corrected Code', prompt: 'Provide the corrected code snippet that resolves the issue.' },
      { name: 'Debug Prompt', prompt: 'Generate a high-context prompt to paste into a developer debugging assistant.' },
    ],
  },
];

export const MoreActionsModal: React.FC<MoreActionsModalProps> = ({
  isOpen,
  onClose,
  screenshotMoreActions,
  onSelectAction,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const query = search.toLowerCase().trim();

  // Filtered AI-suggested more actions
  const filteredAiActions = screenshotMoreActions.filter(
    (a) => !query || a.name.toLowerCase().includes(query) || a.actionPrompt.toLowerCase().includes(query)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[88vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              More Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any additional transformation for this screenshot
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search actions (e.g. reply, translate, code, summarize)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* AI Tailored More Actions */}
          {filteredAiActions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-1">
                Recommended for this screenshot
              </div>
              <div className="grid grid-cols-1 gap-2">
                {filteredAiActions.map((action, idx) => (
                  <button
                    key={'ai_' + idx}
                    onClick={() => {
                      onSelectAction(action.name, action.actionPrompt);
                      onClose();
                    }}
                    className="w-full text-left p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/60 transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {action.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {action.actionPrompt}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Standard Categories */}
          {GLOBAL_CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const matchingActions = cat.actions.filter(
              (a) => !query || a.name.toLowerCase().includes(query) || a.prompt.toLowerCase().includes(query)
            );
            if (matchingActions.length === 0) return null;

            return (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  <CatIcon className="w-3.5 h-3.5" />
                  {cat.name}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingActions.map((act, actIdx) => (
                    <button
                      key={actIdx}
                      onClick={() => {
                        onSelectAction(act.name, act.prompt);
                        onClose();
                      }}
                      className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {act.name}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
