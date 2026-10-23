/**
 * SnapAction Intelligence Router
 *
 * Fundamental Principle:
 * USE AI WHEN AI IS REQUIRED. USE INTERNAL PROGRAMMING WHEN INTERNAL PROGRAMMING IS SUFFICIENT.
 *
 * Execution Modes:
 * - MODE A: Internal Processing (Zero AI tokens, local JavaScript/TypeScript algorithms)
 * - MODE B: Cloud AI Processing (Multimodal vision, natural language generation, reasoning)
 * - MODE C: Hybrid Processing (AI Multimodal Understanding + Local Deterministic Actions)
 */

import { optimizeScreenshot } from '../../utils/imageCompressor';

export type ExecutionMode = 'MODE_A_INTERNAL' | 'MODE_B_AI' | 'MODE_C_HYBRID';

export interface RouteDecision {
  mode: ExecutionMode;
  rationale: string;
  recommendedEngine: string;
}

export interface RouterTelemetry {
  lastTask: string;
  lastMode: ExecutionMode;
  cacheHit: boolean;
  timestamp: string;
}

// In-memory cache for recent processed actions (keyed by imageHash + task)
const resultCache = new Map<string, any>();

/**
 * SnapAction Intelligence Router Service
 */
export class SnapActionIntelligenceRouter {
  private static telemetry: RouterTelemetry = {
    lastTask: 'Initialized',
    lastMode: 'MODE_A_INTERNAL',
    cacheHit: false,
    timestamp: new Date().toISOString(),
  };

  /**
   * Determine the appropriate execution mode based on the task requirement.
   */
  public static decideExecutionMode(task: string): RouteDecision {
    switch (task) {
      case 'image_optimization':
      case 'hash_generation':
      case 'entity_extraction_basic':
      case 'csv_export':
      case 'calendar_ics_export':
      case 'doc_export':
      case 'history_management':
        return {
          mode: 'MODE_A_INTERNAL',
          rationale: 'Deterministic algorithm; internal TypeScript executes faster with zero API cost.',
          recommendedEngine: 'Local Engine (Browser/Client)',
        };

      case 'multilingual_reply_generation':
      case 'creative_writing':
      case 'developer_prompt_spec':
        return {
          mode: 'MODE_B_AI',
          rationale: 'Requires nuanced multilingual phrasing, cultural context, and creative reasoning.',
          recommendedEngine: 'Gemini Text Generation API',
        };

      case 'screenshot_understanding':
      case 'action_recommendation':
      default:
        return {
          mode: 'MODE_C_HYBRID',
          rationale:
            'AI Multimodal Vision for semantic scene understanding combined with deterministic client-side action routing and structured formatting.',
          recommendedEngine: 'Hybrid Engine (Gemini Multimodal + SnapAction Local Heuristics)',
        };
    }
  }

  // ==========================================
  // MODE A — INTERNAL PROCESSING UTILITIES
  // ==========================================

  /**
   * Mode A: Compute unique image fingerprint/hash for session isolation and duplicate detection.
   */
  public static computeImageHash(base64: string): string {
    const len = base64.length;
    const sample = base64.slice(Math.floor(len * 0.1), Math.floor(len * 0.1) + 40).replace(/[^a-zA-Z0-9]/g, '');
    return `HASH_${len}_${sample}`;
  }

  /**
   * Mode A: Optimize screenshot locally before transmission.
   */
  public static async optimizeImage(file: File, maxWidth = 1280, quality = 0.85) {
    this.telemetry = {
      lastTask: 'Image Optimization',
      lastMode: 'MODE_A_INTERNAL',
      cacheHit: false,
      timestamp: new Date().toISOString(),
    };
    return await optimizeScreenshot(file, maxWidth, quality);
  }

  /**
   * Mode A: Basic entity extractor for dates, phone numbers, and URLs.
   */
  public static extractBasicEntities(text: string): { label: string; value: string }[] {
    const entities: { label: string; value: string }[] = [];
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) entities.push({ label: 'Phone', value: phoneMatch[0] });

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) entities.push({ label: 'Email', value: emailMatch[0] });

    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) entities.push({ label: 'Link', value: urlMatch[0] });

    return entities;
  }

  /**
   * Clear cache for privacy or memory management.
   */
  public static clearCache(): void {
    resultCache.clear();
  }

  /**
   * Return current router telemetry.
   */
  public static getTelemetry(): RouterTelemetry {
    return { ...this.telemetry };
  }
}
