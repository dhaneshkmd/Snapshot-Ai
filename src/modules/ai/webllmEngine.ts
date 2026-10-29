/**
 * SnapAction AI — WebLLM Engine Adapter
 *
 * Implements local, private, on-device language model execution directly
 * in the browser via WebGPU using @mlc-ai/web-llm.
 *
 * Features:
 * - Lazy model loading with download progress tracking (0-100%)
 * - User cancellation support during model download
 * - Concurrency mutex lock to prevent conflicting GPU workloads
 * - Resource cleanup and VRAM unloading
 * - Supported language & quality validation (routes languages not supported by compact model to Cloud/Chrome)
 */

import { SUPPORTED_LOCAL_MODELS, ModelRegistryEntry, getModelById } from './modelRegistry';

export interface WebLLMProgress {
  status: 'idle' | 'downloading' | 'loading' | 'ready' | 'generating' | 'error' | 'cancelled';
  progress: number; // 0 - 100
  text: string;
  loadedMb?: number;
  totalMb?: number;
}

export class WebLLMEngine {
  private static engineInstance: any = null;
  private static activeModelId: string = 'SmolLM2-360M-Instruct-q4f16_1-MLC';
  private static isInitializing = false;
  private static isGenerating = false;
  private static cancelRequested = false;
  private static progressListeners: Array<(p: WebLLMProgress) => void> = [];

  /**
   * Subscribe to WebLLM progress updates.
   */
  public static onProgress(listener: (p: WebLLMProgress) => void): () => void {
    this.progressListeners.push(listener);
    return () => {
      this.progressListeners = this.progressListeners.filter((l) => l !== listener);
    };
  }

  private static notify(p: WebLLMProgress) {
    this.progressListeners.forEach((l) => {
      try {
        l(p);
      } catch {
        // Ignore
      }
    });
  }

  /**
   * Check if WebGPU is available in this browser environment.
   */
  public static async isSupported(): Promise<{ supported: boolean; reason?: string }> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return { supported: false, reason: 'Non-browser environment' };
    }
    if (!(navigator as any).gpu) {
      return {
        supported: false,
        reason: 'WebGPU is not enabled or supported in this browser. (Use Chrome 113+, Edge 113+, or enable WebGPU flag).',
      };
    }
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) {
        return { supported: false, reason: 'Failed to acquire WebGPU adapter.' };
      }
      return { supported: true };
    } catch (e: any) {
      return { supported: false, reason: e?.message || 'WebGPU check error' };
    }
  }

  /**
   * Verify if a requested language code is supported by the active model.
   * Compact models (360M) excel at English, Spanish, French, German.
   * Languages like Malayalam (ml), Hindi (hi), Tamil (ta), etc., require Qwen2.5 or Cloud/Chrome Translator.
   */
  public static isLanguageSupportedByModel(langCode: string, modelId = this.activeModelId): boolean {
    const model = getModelById(modelId);
    if (!model) return langCode === 'en';
    return model.supportedLanguages.includes(langCode.toLowerCase());
  }

  /**
   * Get active model entry.
   */
  public static getActiveModel(): ModelRegistryEntry | undefined {
    return getModelById(this.activeModelId);
  }

  /**
   * Change the active model (will load on next request or when loadModel is called).
   */
  public static setActiveModel(modelId: string): void {
    if (modelId !== this.activeModelId) {
      this.unload();
      this.activeModelId = modelId;
    }
  }

  /**
   * Request cancellation of ongoing model download.
   */
  public static cancelInitialization(): void {
    if (this.isInitializing) {
      this.cancelRequested = true;
      this.isInitializing = false;
      this.notify({ status: 'cancelled', progress: 0, text: 'Download cancelled by user.' });
    }
  }

  /**
   * Lazily initialize the WebLLM engine with the selected model.
   */
  public static async getEngine(): Promise<any> {
    if (this.engineInstance) return this.engineInstance;

    const support = await this.isSupported();
    if (!support.supported) {
      throw new Error(`WebLLM unsupported: ${support.reason}`);
    }

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 150));
      }
      if (this.engineInstance) return this.engineInstance;
      if (this.cancelRequested) throw new Error('Model initialization was cancelled.');
    }

    this.isInitializing = true;
    this.cancelRequested = false;
    this.notify({ status: 'downloading', progress: 1, text: `Connecting to ${this.activeModelId}...` });

    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      const initProgressCallback = (report: any) => {
        if (this.cancelRequested) {
          throw new Error('User cancelled WebLLM download');
        }

        const text = report.text || '';
        const progress = Math.round((report.progress || 0) * 100);

        // Parse MB if present (e.g. "Loading model [12/100 MB]")
        this.notify({
          status: progress < 100 ? 'downloading' : 'loading',
          progress: Math.min(Math.max(progress, 2), 99),
          text: text || `Preparing ${this.activeModelId}...`,
        });
      };

      const engine = await CreateMLCEngine(this.activeModelId, {
        initProgressCallback,
        logLevel: 'WARN',
      });

      this.engineInstance = engine;
      this.notify({ status: 'ready', progress: 100, text: `${this.activeModelId} loaded & ready on WebGPU!` });
      return engine;
    } catch (err: any) {
      this.engineInstance = null;
      if (this.cancelRequested) {
        this.notify({ status: 'cancelled', progress: 0, text: 'Model download cancelled.' });
      } else {
        console.error('[WebLLMEngine] Initialization failed:', err);
        this.notify({ status: 'error', progress: 0, text: err?.message || 'Failed to initialize WebLLM.' });
      }
      throw err;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Execute text generation with the local WebLLM model.
   * Concurrency protected via mutex lock.
   */
  public static async generateText(
    prompt: string,
    systemPrompt?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      onStream?: (chunk: string) => void;
    }
  ): Promise<string> {
    if (this.isGenerating) {
      // Wait for previous generation to avoid GPU conflict
      while (this.isGenerating) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    this.isGenerating = true;
    this.notify({ status: 'generating', progress: 100, text: 'Generating response on WebGPU...' });

    try {
      const engine = await this.getEngine();

      const messages = [
        {
          role: 'system',
          content:
            systemPrompt ||
            'You are SnapAction AI, an articulate on-device assistant. Answer clearly, accurately, and concisely. Output direct text without conversational preamble.',
        },
        { role: 'user', content: prompt },
      ];

      const completion = await engine.chat.completions.create({
        messages,
        temperature: options?.temperature ?? 0.6,
        max_tokens: options?.maxTokens ?? 1024,
      });

      const reply = completion.choices?.[0]?.message?.content || '';
      return reply.trim();
    } finally {
      this.isGenerating = false;
      this.notify({ status: 'ready', progress: 100, text: 'Ready' });
    }
  }

  /**
   * Unload WebLLM engine and free WebGPU memory.
   */
  public static async unload(): Promise<void> {
    if (this.engineInstance) {
      try {
        await this.engineInstance.unload?.();
      } catch (e) {
        console.warn('Error unloading WebLLM engine:', e);
      }
      this.engineInstance = null;
    }
    this.isInitializing = false;
    this.isGenerating = false;
    this.notify({ status: 'idle', progress: 0, text: 'Engine unloaded; memory freed.' });
  }

  /**
   * Query status.
   */
  public static isReady(): boolean {
    return Boolean(this.engineInstance);
  }
}
