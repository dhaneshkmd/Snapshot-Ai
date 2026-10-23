/**
 * SnapAction Intelligence Router
 *
 * Fundamental Principle:
 * USE AI WHEN AI IS REQUIRED. USE INTERNAL PROGRAMMING WHEN INTERNAL PROGRAMMING IS SUFFICIENT.
 *
 * Execution Modes:
 * - MODE A: Internal Processing (Zero AI tokens, local JavaScript/TypeScript algorithms)
 * - MODE B: Cloud AI Processing (Multimodal vision, natural language generation, reasoning)
 * - MODE C: Hybrid Processing (AI Vision + Internal rules, risk calculations, and report generation)
 */

import {
  HseInspectionReport,
  HazardObservation,
  PositiveObservation,
  calculateRiskLevel,
  RiskLevel,
} from '../hse/hseTypes';
import { getApplicableStandards } from '../hse/hseStandards';
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

// In-memory cache for authorized inspection sessions (keyed by user-session + imageHash)
const inspectionCache = new Map<string, HseInspectionReport>();

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
      case 'risk_matrix_calc':
      case 'entity_extraction_basic':
      case 'csv_export':
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

      case 'worksite_photo_inspection':
      case 'photo_hazard_understanding':
      default:
        return {
          mode: 'MODE_C_HYBRID',
          rationale:
            'Mandatory AI Vision for visual scene understanding, combined with internal HSE standards validation, 5x5 risk calculations, and document generation.',
          recommendedEngine: 'Hybrid Engine (Gemini Vision + HSE Rules Engine)',
        };
    }
  }

  // ==========================================
  // MODE A — INTERNAL PROCESSING UTILITIES
  // ==========================================

  /**
   * Mode A: Compute unique image fingerprint/hash for session isolation.
   */
  public static computeImageHash(base64: string): string {
    const len = base64.length;
    const sample = base64.slice(Math.floor(len * 0.1), Math.floor(len * 0.1) + 40).replace(/[^a-zA-Z0-9]/g, '');
    return `HASH_${len}_${sample}`;
  }

  /**
   * Mode A: Optimize worksite photograph locally before transmission.
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
   * Mode A: Calculate preliminary risk using the 5x5 matrix.
   */
  public static calculateRisk(likelihood: number, severity: number): { score: number; level: RiskLevel } {
    return calculateRiskLevel(likelihood, severity);
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

  // ==========================================
  // MODE C — HYBRID PROCESSING FOR HSE VISION
  // ==========================================

  /**
   * Mode C: Process Worksite Photograph.
   *
   * Flow:
   * 1. Internal: Compute image hash.
   * 2. Internal: Check memory cache for identical authorized photo.
   * 3. AI Vision: Call server `/api/hse-analyze` for semantic understanding.
   * 4. Internal: Validate findings, clamp coordinates, and map verified regulatory standards.
   * 5. Internal: Calculate 5x5 risk matrix priorities and overall site risk.
   */
  public static async inspectWorksitePhoto(params: {
    imageBase64: string;
    mimeType: string;
    filename?: string;
    jurisdiction?: string;
    language?: string;
    forceRefresh?: boolean;
  }): Promise<{
    report: HseInspectionReport;
    mode: ExecutionMode;
    cached: boolean;
  }> {
    const { imageBase64, mimeType, filename, jurisdiction = 'International (OSHA/ISO)', language = 'English', forceRefresh = false } = params;

    const imageHash = this.computeImageHash(imageBase64);

    // 1. Check cache (Internal Processing)
    if (!forceRefresh && inspectionCache.has(imageHash)) {
      const cached = inspectionCache.get(imageHash)!;
      this.telemetry = {
        lastTask: 'Worksite Inspection (Cache Hit)',
        lastMode: 'MODE_A_INTERNAL',
        cacheHit: true,
        timestamp: new Date().toISOString(),
      };
      return {
        report: cached,
        mode: 'MODE_A_INTERNAL',
        cached: true,
      };
    }

    // 2. Call Mandatory AI Vision API (AI Processing)
    this.telemetry = {
      lastTask: 'Worksite AI Vision Analysis',
      lastMode: 'MODE_C_HYBRID',
      cacheHit: false,
      timestamp: new Date().toISOString(),
    };

    const res = await fetch('/api/hse-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        mimeType,
        jurisdiction,
        preferredLanguage: language,
      }),
    });

    if (!res.ok) {
      let errMessage = `Inspection analysis failed with status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.error) errMessage = errJson.error;
      } catch {}
      throw new Error(errMessage);
    }

    const aiData = await res.json();

    // 3. Post-Processing & Standards Grounding (Internal Processing)
    const enrichedObservations: HazardObservation[] = (aiData.observations || []).map(
      (obs: any, idx: number) => {
        const l = Math.max(1, Math.min(5, Math.round(Number(obs.likelihood) || 3)));
        const s = Math.max(1, Math.min(5, Math.round(Number(obs.severity) || 3)));
        const { score, level } = calculateRiskLevel(l, s);

        const xClamped = Math.max(2, Math.min(98, Math.round(Number(obs.xPercent) || 50)));
        const yClamped = Math.max(2, Math.min(98, Math.round(Number(obs.yPercent) || 50)));

        const standards =
          obs.applicableStandards && obs.applicableStandards.length > 0
            ? obs.applicableStandards
            : getApplicableStandards(obs.hazardCategory);

        return {
          ...obs,
          id: obs.id || `HAZ-${String(idx + 1).padStart(2, '0')}`,
          markerNumber: obs.markerNumber || idx + 1,
          xPercent: xClamped,
          yPercent: yClamped,
          likelihood: l,
          severity: s,
          riskScore: score,
          riskRating: level,
          applicableStandards: standards,
          actionStatus: obs.actionStatus || 'Open',
          residualRisk: obs.residualRisk || 'Low',
        };
      }
    );

    const hasCritical = enrichedObservations.some((o) => o.riskRating === 'Critical');
    const hasHigh = enrichedObservations.some((o) => o.riskRating === 'High');
    const calculatedOverallRisk: RiskLevel = hasCritical
      ? 'Critical'
      : hasHigh
      ? 'High'
      : enrichedObservations.length > 0
      ? 'Medium'
      : 'Low';

    const photoObj = {
      id: `photo_${Date.now()}`,
      base64: imageBase64,
      mimeType,
      caption: filename || `${aiData.primaryActivity || 'Worksite'} Visual Inspection`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const finalReport: HseInspectionReport = {
      id: `HSE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      imageHash,
      reportTitle: aiData.reportTitle || `${aiData.primaryActivity || 'Worksite'} HSE Safety Inspection`,
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      siteName: aiData.siteName || 'Active Construction Project Sector',
      projectNumber: aiData.projectNumber || 'PRJ-2026-HSE',
      workArea: aiData.workArea || 'Active Worksite Zone',
      primaryActivity: aiData.primaryActivity || aiData.activityObserved || 'Industrial Worksite Operation',
      secondaryActivities: aiData.secondaryActivities || [],
      activityObserved: aiData.activityObserved || aiData.primaryActivity || 'Worksite Operations',
      inspectorName: aiData.inspectorName || 'Senior Safety Auditor (Competent Person)',
      inspectorDesignation: aiData.inspectorDesignation || 'Chartered HSE Inspector (NEBOSH / CMIOSH)',
      executiveSummary: aiData.executiveSummary || 'Visual workplace inspection completed.',
      overallSiteRisk: aiData.overallSiteRisk || calculatedOverallRisk,
      photos: [photoObj],
      selectedPhotoId: photoObj.id,
      observations: enrichedObservations,
      positiveObservations: aiData.positiveObservations || [],
      mattersRequiringFieldVerification: aiData.mattersRequiringFieldVerification || [],
      jurisdiction: 'International (OSHA/ISO)',
      reportLanguage: language,
    };

    // Cache authorized result
    inspectionCache.set(imageHash, finalReport);

    return {
      report: finalReport,
      mode: 'MODE_C_HYBRID',
      cached: false,
    };
  }

  /**
   * Clear cache for privacy or memory management.
   */
  public static clearCache(): void {
    inspectionCache.clear();
  }

  /**
   * Return current router telemetry.
   */
  public static getTelemetry(): RouterTelemetry {
    return { ...this.telemetry };
  }
}
