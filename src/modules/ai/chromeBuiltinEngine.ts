/**
 * SnapAction AI — Chrome Built-in AI Adapter
 *
 * Implements hardware-accelerated, zero-download Chrome Built-in AI:
 * - Language Model (Prompt API with Gemini Nano)
 * - Summarizer API
 * - Writer API
 * - Rewriter API
 * - Translator API
 * - Language Detector API
 *
 * Adheres strictly to capability checks: does not assume Chrome Android, iOS,
 * or desktop installations support these APIs without verification.
 */

export interface ChromeBuiltinCapabilities {
  supported: boolean;
  languageModel: 'readily' | 'after-download' | 'no';
  summarizer: 'readily' | 'after-download' | 'no';
  writer: 'readily' | 'after-download' | 'no';
  rewriter: 'readily' | 'after-download' | 'no';
  translator: boolean;
  languageDetector: boolean;
  notes: string[];
}

export class ChromeBuiltinEngine {
  private static cachedCapabilities: ChromeBuiltinCapabilities | null = null;
  private static activeSession: any = null;

  /**
   * Probe and report actual capability of Chrome Built-in AI APIs in this browser.
   */
  public static async checkCapabilities(): Promise<ChromeBuiltinCapabilities> {
    if (this.cachedCapabilities) {
      return this.cachedCapabilities;
    }

    const caps: ChromeBuiltinCapabilities = {
      supported: false,
      languageModel: 'no',
      summarizer: 'no',
      writer: 'no',
      rewriter: 'no',
      translator: false,
      languageDetector: false,
      notes: [],
    };

    if (typeof window === 'undefined') {
      caps.notes.push('Non-browser environment');
      return caps;
    }

    const w = window as any;

    // 1. Language Model (Prompt API / Gemini Nano)
    try {
      if (w.ai?.languageModel) {
        const lmCaps = await w.ai.languageModel.capabilities();
        caps.languageModel = lmCaps?.available || 'no';
        if (caps.languageModel !== 'no') {
          caps.supported = true;
          caps.notes.push(`Gemini Nano Prompt API: ${caps.languageModel}`);
        }
      } else if (w.ai?.canCreateTextSession) {
        const canCreate = await w.ai.canCreateTextSession();
        caps.languageModel = canCreate === 'readily' ? 'readily' : canCreate === 'after-download' ? 'after-download' : 'no';
        if (caps.languageModel !== 'no') {
          caps.supported = true;
          caps.notes.push(`Legacy Prompt API: ${caps.languageModel}`);
        }
      }
    } catch (e: any) {
      caps.notes.push(`Prompt API check error: ${e?.message || 'unavailable'}`);
    }

    // 2. Summarizer API
    try {
      if (w.ai?.summarizer) {
        const sumCaps = await w.ai.summarizer.capabilities();
        caps.summarizer = sumCaps?.available || 'no';
        if (caps.summarizer !== 'no') {
          caps.supported = true;
          caps.notes.push(`Chrome Summarizer API: ${caps.summarizer}`);
        }
      }
    } catch {
      // Ignore
    }

    // 3. Writer API
    try {
      if (w.ai?.writer) {
        const writerCaps = await w.ai.writer.capabilities();
        caps.writer = writerCaps?.available || 'no';
        if (caps.writer !== 'no') {
          caps.supported = true;
          caps.notes.push(`Chrome Writer API: ${caps.writer}`);
        }
      }
    } catch {
      // Ignore
    }

    // 4. Rewriter API
    try {
      if (w.ai?.rewriter) {
        const rwCaps = await w.ai.rewriter.capabilities();
        caps.rewriter = rwCaps?.available || 'no';
        if (caps.rewriter !== 'no') {
          caps.supported = true;
          caps.notes.push(`Chrome Rewriter API: ${caps.rewriter}`);
        }
      }
    } catch {
      // Ignore
    }

    // 5. Translator API
    try {
      if (w.translation?.canTranslate || w.ai?.translator) {
        caps.translator = true;
        caps.supported = true;
        caps.notes.push('Chrome Translator API available');
      }
    } catch {
      // Ignore
    }

    // 6. Language Detector API
    try {
      if (w.translation?.canDetect || w.ai?.languageDetector) {
        caps.languageDetector = true;
        caps.supported = true;
        caps.notes.push('Chrome Language Detector available');
      }
    } catch {
      // Ignore
    }

    if (!caps.supported) {
      caps.notes.push('Chrome Built-in AI not enabled in current browser flags or platform.');
    }

    this.cachedCapabilities = caps;
    return caps;
  }

  /**
   * Reset cache to re-probe (e.g. after user enables flags).
   */
  public static resetCapabilitiesCache(): void {
    this.cachedCapabilities = null;
  }

  /**
   * Generate text via Chrome Built-in Prompt API (Gemini Nano).
   */
  public static async prompt(
    userPrompt: string,
    systemPrompt?: string,
    options?: { temperature?: number; topK?: number }
  ): Promise<string> {
    const w = window as any;

    if (w.ai?.languageModel) {
      const caps = await w.ai.languageModel.capabilities();
      if (caps.available === 'no') {
        throw new Error('Chrome Built-in LanguageModel is not supported on this device.');
      }

      const session = await w.ai.languageModel.create({
        systemPrompt: systemPrompt || 'You are an expert AI assistant that provides direct, high quality answers.',
        temperature: options?.temperature ?? 0.7,
        topK: options?.topK ?? 40,
      });

      this.activeSession = session;
      try {
        const response = await session.prompt(userPrompt);
        return response;
      } finally {
        session.destroy?.();
        this.activeSession = null;
      }
    }

    if (w.ai?.createTextSession) {
      const session = await w.ai.createTextSession();
      this.activeSession = session;
      try {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;
        const response = await session.prompt(fullPrompt);
        return response;
      } finally {
        session.destroy?.();
        this.activeSession = null;
      }
    }

    throw new Error('Chrome Built-in AI Prompt API is not available.');
  }

  /**
   * Summarize text using Chrome Summarizer API or Prompt fallback.
   */
  public static async summarize(
    text: string,
    options?: { type?: 'key-points' | 'tl-dr' | 'teaser' | 'headline'; length?: 'short' | 'medium' | 'long' }
  ): Promise<string> {
    const w = window as any;

    if (w.ai?.summarizer) {
      const caps = await w.ai.summarizer.capabilities();
      if (caps.available !== 'no') {
        const summarizer = await w.ai.summarizer.create({
          type: options?.type || 'key-points',
          format: 'markdown',
          length: options?.length || 'medium',
        });
        try {
          return await summarizer.summarize(text);
        } finally {
          summarizer.destroy?.();
        }
      }
    }

    // Fall back to prompt()
    return await this.prompt(
      `Summarize the following content clearly in concise markdown bullet points:\n\n${text}`,
      'You are a high-speed summarization assistant.'
    );
  }

  /**
   * Rewrite or polish text using Chrome Rewriter API or Prompt fallback.
   */
  public static async rewrite(
    text: string,
    options?: { tone?: 'as-is' | 'more-formal' | 'more-casual'; length?: 'as-is' | 'shorter' | 'longer' }
  ): Promise<string> {
    const w = window as any;

    if (w.ai?.rewriter) {
      const caps = await w.ai.rewriter.capabilities();
      if (caps.available !== 'no') {
        const rewriter = await w.ai.rewriter.create({
          tone: options?.tone || 'as-is',
          length: options?.length || 'as-is',
        });
        try {
          return await rewriter.rewrite(text);
        } finally {
          rewriter.destroy?.();
        }
      }
    }

    return await this.prompt(
      `Rewrite and improve the following text to make it polished and articulate:\n\n${text}`,
      'You are an expert editorial writer.'
    );
  }

  /**
   * Translate text using Chrome Translator API or Prompt fallback.
   */
  public static async translate(
    text: string,
    sourceLanguage = 'en',
    targetLanguage = 'es'
  ): Promise<string> {
    const w = window as any;

    if (w.translation?.createTranslator) {
      try {
        const can = await w.translation.canTranslate({
          sourceLanguage,
          targetLanguage,
        });
        if (can === 'readily' || can === 'after-download') {
          const translator = await w.translation.createTranslator({
            sourceLanguage,
            targetLanguage,
          });
          try {
            return await translator.translate(text);
          } finally {
            translator.destroy?.();
          }
        }
      } catch (transErr) {
        console.warn('Native Chrome translator failed, trying prompt:', transErr);
      }
    }

    return await this.prompt(
      `Translate this text accurately into target language (${targetLanguage}). Output ONLY the translation directly:\n\n${text}`,
      `You are a professional multilingual translator. Target language code: ${targetLanguage}.`
    );
  }

  /**
   * Detect language using Chrome Language Detector or fallback.
   */
  public static async detectLanguage(text: string): Promise<string | null> {
    const w = window as any;
    if (w.translation?.createDetector) {
      try {
        const detector = await w.translation.createDetector();
        const results = await detector.detect(text);
        detector.destroy?.();
        if (results && results.length > 0) {
          return results[0].detectedLanguage;
        }
      } catch {
        // Fallback
      }
    }
    return null;
  }

  /**
   * Cancel or release any running Chrome AI session.
   */
  public static abort(): void {
    if (this.activeSession) {
      try {
        this.activeSession.destroy?.();
      } catch {
        // Ignore
      }
      this.activeSession = null;
    }
  }
}
