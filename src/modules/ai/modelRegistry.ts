/**
 * SnapAction AI — Local AI Model Registry
 *
 * Catalog of officially verified, browser-compatible on-device models
 * across WebLLM, Transformers.js, and Chrome Built-in AI.
 */

export type AIRuntime = 'web_llm' | 'transformers_js' | 'chrome_builtin' | 'internal' | 'cloud_ai';

export interface ModelRegistryEntry {
  id: string;
  name: string;
  runtime: AIRuntime;
  version: string;
  sizeBytes: number;
  sizeFormatted: string;
  license: string;
  supportedTasks: string[];
  supportedLanguages: string[];
  qualityBenchmark: string;
  hardwareRequirements: {
    webGpuRequired: boolean;
    minRamGb: number;
    recommendedVramGb: number;
  };
  downloadUrl?: string;
  lastValidationDate: string;
  isDefault?: boolean;
}

export const SUPPORTED_LOCAL_MODELS: ModelRegistryEntry[] = [
  // -------------------------------------------------------------
  // 1. WebLLM Verified Browser Models (WebGPU accelerated)
  // -------------------------------------------------------------
  {
    id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 360M Instruct',
    runtime: 'web_llm',
    version: '1.0',
    sizeBytes: 240 * 1024 * 1024,
    sizeFormatted: '~240 MB',
    license: 'Apache-2.0',
    supportedTasks: [
      'reply_generation',
      'summarization',
      'text_rewriting',
      'document_planning',
      'email_drafting',
      'social_post',
    ],
    supportedLanguages: ['en', 'es', 'fr', 'de'],
    qualityBenchmark: 'Fast & responsive (~45 tokens/s on modern WebGPU). Ideal for quick replies and outlines.',
    hardwareRequirements: {
      webGpuRequired: true,
      minRamGb: 4,
      recommendedVramGb: 1,
    },
    lastValidationDate: '2026-10-24',
    isDefault: true,
  },
  {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5 0.5B Instruct',
    runtime: 'web_llm',
    version: '2.5',
    sizeBytes: 395 * 1024 * 1024,
    sizeFormatted: '~395 MB',
    license: 'Apache-2.0',
    supportedTasks: [
      'reply_generation',
      'multilingual_replies',
      'summarization',
      'document_planning',
      'table_extraction',
      'action_planning',
    ],
    supportedLanguages: ['en', 'hi', 'zh', 'ar', 'es', 'fr', 'de', 'ja'],
    qualityBenchmark: 'High multilingual fluency and JSON output accuracy (~35 tokens/s on WebGPU).',
    hardwareRequirements: {
      webGpuRequired: true,
      minRamGb: 4,
      recommendedVramGb: 1.5,
    },
    lastValidationDate: '2026-10-24',
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B Instruct',
    runtime: 'web_llm',
    version: '3.2',
    sizeBytes: 880 * 1024 * 1024,
    sizeFormatted: '~880 MB',
    license: 'Llama 3.2 Community License',
    supportedTasks: [
      'advanced_replies',
      'creative_writing',
      'executive_summaries',
      'smart_pdf_architecture',
      'code_explanations',
    ],
    supportedLanguages: ['en', 'es', 'fr', 'de', 'hi', 'pt', 'it'],
    qualityBenchmark: 'State-of-the-art 1B instruction-following quality with deep nuance.',
    hardwareRequirements: {
      webGpuRequired: true,
      minRamGb: 8,
      recommendedVramGb: 2,
    },
    lastValidationDate: '2026-10-24',
  },

  // -------------------------------------------------------------
  // 2. Transformers.js Lightweight Browser Models (WASM / WebGPU)
  // -------------------------------------------------------------
  {
    id: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
    name: 'DistilBERT Sentiment Analyzer',
    runtime: 'transformers_js',
    version: '1.0',
    sizeBytes: 67 * 1024 * 1024,
    sizeFormatted: '~67 MB',
    license: 'Apache-2.0',
    supportedTasks: [
      'sentiment_analysis',
      'comment_tone_detection',
      'hostility_warning',
    ],
    supportedLanguages: ['en'],
    qualityBenchmark: '92% sentiment classification accuracy on SST-2 benchmarks in <30ms.',
    hardwareRequirements: {
      webGpuRequired: false,
      minRamGb: 2,
      recommendedVramGb: 0,
    },
    lastValidationDate: '2026-10-24',
    isDefault: true,
  },
  {
    id: 'Xenova/bge-small-en-v1.5',
    name: 'BGE Small Text Embeddings',
    runtime: 'transformers_js',
    version: '1.5',
    sizeBytes: 33 * 1024 * 1024,
    sizeFormatted: '~33 MB',
    license: 'MIT',
    supportedTasks: [
      'text_embeddings',
      'semantic_similarity',
      'note_clustering',
      'action_matching',
    ],
    supportedLanguages: ['en'],
    qualityBenchmark: 'MTEB Leaderboard Top-Tier small embedder (384 dimensions).',
    hardwareRequirements: {
      webGpuRequired: false,
      minRamGb: 2,
      recommendedVramGb: 0,
    },
    lastValidationDate: '2026-10-24',
  },

  // -------------------------------------------------------------
  // 3. Chrome Built-in AI (Gemini Nano & Browser Native APIs)
  // -------------------------------------------------------------
  {
    id: 'chrome-builtin-gemini-nano',
    name: 'Chrome Built-in Gemini Nano',
    runtime: 'chrome_builtin',
    version: 'Native OS/Browser',
    sizeBytes: 0, // Zero web download; pre-installed in Chrome
    sizeFormatted: '0 MB (Preloaded in Chrome)',
    license: 'Chrome Platform Built-in',
    supportedTasks: [
      'prompt_execution',
      'summarization',
      'writing',
      'rewriting',
      'proofreading',
      'translation',
      'language_detection',
    ],
    supportedLanguages: ['en', 'es', 'ja', 'hi', 'pt', 'zh', 'ar', 'ml'],
    qualityBenchmark: 'Zero-latency on-device Gemini Nano inference backed by Chrome system runtime.',
    hardwareRequirements: {
      webGpuRequired: false,
      minRamGb: 4,
      recommendedVramGb: 0,
    },
    lastValidationDate: '2026-10-24',
    isDefault: true,
  },
];

export function getModelById(id: string): ModelRegistryEntry | undefined {
  return SUPPORTED_LOCAL_MODELS.find((m) => m.id === id);
}

export function getDefaultModelForRuntime(runtime: AIRuntime): ModelRegistryEntry | undefined {
  return SUPPORTED_LOCAL_MODELS.find((m) => m.runtime === runtime && m.isDefault);
}
