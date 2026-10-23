import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  Layers,
  ArrowLeftRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Share2,
  Eye,
  Sliders,
  HardHat,
  Search,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  HseInspectionReport,
  HazardObservation,
  PositiveObservation,
  InspectedPhoto,
  calculateRiskLevel,
  RiskLevel,
} from '../../modules/hse/hseTypes';
import { HSE_SAMPLE_SCENARIOS, HseSampleScenario } from '../../modules/hse/hseSamples';
import { PhotoAnnotationCanvas } from './PhotoAnnotationCanvas';
import { RiskMatrix5x5 } from './RiskMatrix5x5';
import { CorrectiveActionTable } from './CorrectiveActionTable';
import { BeforeAfterComparison } from './BeforeAfterComparison';
import { HseReportView } from './HseReportView';
import { LanguageOption } from '../../modules/languages/languageData';
import { svgToPngBase64 } from '../../utils/samples';
import { optimizeScreenshot } from '../../utils/imageCompressor';
import { getApplicableStandards } from '../../modules/hse/hseStandards';
import { SnapActionIntelligenceRouter, ExecutionMode } from '../../modules/router/intelligenceRouter';

interface HseVisionStudioProps {
  onBackToMain?: () => void;
  globalLanguage: LanguageOption;
  onOpenLanguageSelector: () => void;
  onOpenDiagnostics?: () => void;
  initialPhoto?: {
    base64: string;
    mimeType: string;
    filename?: string;
  };
}

export type HseStudioTab = 'canvas' | 'actions' | 'before_after' | 'report';

export const HseVisionStudio: React.FC<HseVisionStudioProps> = ({
  onBackToMain,
  globalLanguage,
  onOpenLanguageSelector,
  onOpenDiagnostics,
  initialPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const activeReqSeqRef = useRef<number>(0);

  // Inspection Dossier State
  const [report, setReport] = useState<HseInspectionReport | null>(null);
  const [activeTab, setActiveTab] = useState<HseStudioTab>('canvas');
  const [selectedObsId, setSelectedObsId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Analyzing worksite photograph...');
  const [analysisError, setAnalysisError] = useState<{
    message: string;
    photoBase64: string;
    mimeType: string;
    filename?: string;
  } | null>(null);
  const [sampleLoadingId, setSampleLoadingId] = useState<string | null>(null);
  const [isEditingMarkers, setIsEditingMarkers] = useState(false);
  const [afterPhotoSrc, setAfterPhotoSrc] = useState<string | null>(null);
  const [lastProcessedPhotoId, setLastProcessedPhotoId] = useState<string | null>(null);
  const [executionMode, setExecutionMode] = useState<ExecutionMode | null>(null);
  const [isCachedResult, setIsCachedResult] = useState<boolean>(false);

  // Auto-analyze initialPhoto if provided from home screen or action card
  useEffect(() => {
    if (initialPhoto && initialPhoto.base64) {
      const photoKey = `photo_${initialPhoto.base64.length}_${initialPhoto.base64.slice(100, 140)}`;
      if (lastProcessedPhotoId !== photoKey) {
        setLastProcessedPhotoId(photoKey);
        analyzePhotoWithAi(initialPhoto.base64, initialPhoto.mimeType, initialPhoto.filename);
      }
    }
  }, [initialPhoto]);

  // Generate lightweight unique fingerprint for image session isolation
  const computeImageHash = (b64: string): string => {
    return SnapActionIntelligenceRouter.computeImageHash(b64);
  };

  // 1. Load an authentic sample scenario for rapid demo & testing
  const handleSelectSample = async (scenario: HseSampleScenario) => {
    try {
      setSampleLoadingId(scenario.id);
      setAnalysisError(null);
      setExecutionMode('MODE_A_INTERNAL');
      setIsCachedResult(false);
      const svg = scenario.getSvg();
      const pngBase64 = await svgToPngBase64(svg, 1000, 700);

      // Session isolation: reset in-flight state
      activeReqSeqRef.current += 1;

      const newPhoto: InspectedPhoto = {
        id: `photo_${Date.now()}`,
        base64: pngBase64,
        mimeType: 'image/png',
        caption: `${scenario.title} - Visual Evidence`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        locationTag: scenario.workArea,
      };

      const newReport: HseInspectionReport = {
        id: `HSE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
        imageHash: computeImageHash(pngBase64),
        reportTitle: `${scenario.title} — HSE Safety Audit`,
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        siteName: 'Terminal Expansion Project',
        projectNumber: 'PKG-04B-IND',
        workArea: scenario.workArea,
        primaryActivity: scenario.activity,
        secondaryActivities: [scenario.industry],
        activityObserved: scenario.activity,
        inspectorName: 'Chartered HSE Inspector (NEBOSH / CMIOSH)',
        inspectorDesignation: 'Lead Safety Auditor',
        executiveSummary: `Worksite visual inspection conducted at ${scenario.workArea}. Observed primary activity: ${scenario.activity}. Evaluation identified ${scenario.defaultObservations.length} potential hazard observation(s) and ${scenario.defaultPositiveObservations.length} positive safety controls.`,
        photos: [newPhoto],
        selectedPhotoId: newPhoto.id,
        observations: scenario.defaultObservations,
        positiveObservations: scenario.defaultPositiveObservations,
        mattersRequiringFieldVerification: scenario.defaultVerificationItems,
        overallSiteRisk: scenario.defaultOverallRisk,
        jurisdiction: 'International (OSHA/ISO)',
        reportLanguage: globalLanguage.name,
      };

      setReport(newReport);
      setSelectedObsId(newReport.observations[0]?.id || null);
      setActiveTab('canvas');
    } catch (err) {
      console.error('Failed to load sample', err);
    } finally {
      setSampleLoadingId(null);
    }
  };

  // 2. Upload / Camera File Handler
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setAnalysisError(null);

    try {
      const optimized = await optimizeScreenshot(file, 1280, 0.85);
      await analyzePhotoWithAi(optimized.base64, optimized.mimeType, file.name);
    } catch (e) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          await analyzePhotoWithAi(base64, file.type, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Dynamic AI Vision Analysis Call via SnapAction Intelligence Router (Mode C: Hybrid)
  const analyzePhotoWithAi = async (base64: string, mimeType: string, filename?: string) => {
    // Session isolation: create new request sequence ID and clear old report findings
    const reqSeq = activeReqSeqRef.current + 1;
    activeReqSeqRef.current = reqSeq;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setReport(null); // Clear previous findings immediately
    setSelectedObsId(null);
    setAnalysisStep('1/4: Analyzing visual scene & worksite identity...');

    try {
      // Progressive progress feedback
      const timer1 = setTimeout(() => {
        if (activeReqSeqRef.current === reqSeq) {
          setAnalysisStep('2/4: Multimodal scene comprehension & asset isolation...');
        }
      }, 1200);

      const timer2 = setTimeout(() => {
        if (activeReqSeqRef.current === reqSeq) {
          setAnalysisStep('3/4: Contextual hazard mapping & positive control verification...');
        }
      }, 2500);

      const timer3 = setTimeout(() => {
        if (activeReqSeqRef.current === reqSeq) {
          setAnalysisStep('4/4: Standards grounding & 5x5 risk matrix evaluation...');
        }
      }, 4000);

      const { report: createdReport, mode, cached } = await SnapActionIntelligenceRouter.inspectWorksitePhoto({
        imageBase64: base64,
        mimeType,
        filename,
        jurisdiction: 'International (OSHA/ISO)',
        language: globalLanguage.name,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      // Verify request is still active and not superseded by another upload
      if (activeReqSeqRef.current !== reqSeq) {
        return;
      }

      setExecutionMode(mode);
      setIsCachedResult(cached);
      setReport(createdReport);
      setSelectedObsId(createdReport.observations[0]?.id || null);
      setActiveTab('canvas');
    } catch (err: any) {
      console.warn('AI analysis error:', err);
      // STRICT REQUIREMENT: NEVER load hardcoded excavation hazards on failure!
      if (activeReqSeqRef.current === reqSeq) {
        setAnalysisError({
          message: err?.message || 'Unable to complete AI vision analysis for this photograph.',
          photoBase64: base64,
          mimeType,
          filename,
        });
      }
    } finally {
      if (activeReqSeqRef.current === reqSeq) {
        setIsAnalyzing(false);
      }
    }
  };

  // Start a clean manual inspection dossier (0 hardcoded findings, inspector places pins)
  const handleStartManualInspection = (base64: string, mimeType: string, filename?: string) => {
    setAnalysisError(null);
    setExecutionMode('MODE_A_INTERNAL');
    setIsCachedResult(false);
    const photo: InspectedPhoto = {
      id: `photo_${Date.now()}`,
      base64,
      mimeType,
      caption: filename || 'Worksite Inspection Photo',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const emptyReport: HseInspectionReport = {
      id: `HSE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      imageHash: computeImageHash(base64),
      reportTitle: 'Worksite HSE Photo Hazard Inspection',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      siteName: 'Site Project Area',
      projectNumber: 'PRJ-2026',
      workArea: 'Active Field Sector',
      primaryActivity: 'Visual Worksite Inspection',
      secondaryActivities: [],
      activityObserved: 'Inspected activity',
      inspectorName: 'Chartered Safety Inspector',
      inspectorDesignation: 'Lead HSE Auditor',
      executiveSummary: 'Worksite visual inspection initiated. Inspector can tap the photograph to annotate hazards and positive controls.',
      photos: [photo],
      selectedPhotoId: photo.id,
      observations: [],
      positiveObservations: [],
      mattersRequiringFieldVerification: ['Verify daily permit-to-work and pre-shift briefing logs.'],
      overallSiteRisk: 'Low',
      jurisdiction: 'International (OSHA/ISO)',
      reportLanguage: globalLanguage.name,
    };

    setReport(emptyReport);
    setIsEditingMarkers(true); // Allow tapping photo to place pins
    setActiveTab('canvas');
  };

  // Add a manual marker on canvas
  const handleAddMarker = (xPercent: number, yPercent: number) => {
    if (!report) return;
    const nextMarkerNum = report.observations.length + 1;
    const newId = `HAZ-${String(nextMarkerNum).padStart(2, '0')}`;

    const newObs: HazardObservation = {
      id: newId,
      markerNumber: nextMarkerNum,
      xPercent,
      yPercent,
      hazardCategory: 'General Workplace Safety',
      title: 'Inspector Identified Condition',
      observedCondition: 'Potentially hazardous condition identified by inspector at this location.',
      potentialConsequences: 'Exposure to injury, equipment damage, or operational interruption.',
      exposedParties: 'Worksite personnel',
      evidenceClassification: 'Visible Finding',
      existingControls: 'To be determined',
      missingOrQuestionableControls: 'Hierarchy of controls required',
      likelihood: 3,
      severity: 3,
      riskScore: 9,
      riskRating: 'Medium',
      immediateAction: 'Direct personnel away from hazard zone; establish visual controls.',
      engineeringControls: 'Provide guarding, barricades, or physical isolation.',
      administrativeControls: 'Brief operatives in pre-shift toolbox meeting.',
      ppeRequired: 'Standard site PPE',
      residualRisk: 'Low',
      applicableStandards: getApplicableStandards('General Workplace Safety'),
      fieldVerificationQuestions: ['Verify physical condition and assess root cause on site.'],
      actionStatus: 'Open',
    };

    const updatedObservations = [...report.observations, newObs];
    setReport({
      ...report,
      observations: updatedObservations,
      overallSiteRisk: updatedObservations.some((o) => o.riskRating === 'Critical')
        ? 'Critical'
        : updatedObservations.some((o) => o.riskRating === 'High')
        ? 'High'
        : 'Medium',
    });
    setSelectedObsId(newId);
    setIsEditingMarkers(false);
  };

  // Update marker position when dragged on canvas
  const handleUpdateMarkerPosition = (id: string, xPercent: number, yPercent: number) => {
    if (!report) return;
    const updated = report.observations.map((obs) => {
      if (obs.id !== id) return obs;
      return { ...obs, xPercent, yPercent };
    });
    setReport({ ...report, observations: updated });
  };

  // Update observation fields
  const handleUpdateObservation = (id: string, updates: Partial<HazardObservation>) => {
    if (!report) return;
    const updatedObs = report.observations.map((o) => {
      if (o.id !== id) return o;
      const merged = { ...o, ...updates };
      if (updates.likelihood !== undefined || updates.severity !== undefined) {
        const { score, level } = calculateRiskLevel(merged.likelihood, merged.severity);
        merged.riskScore = score;
        merged.riskRating = level;
      }
      return merged;
    });

    const hasCritical = updatedObs.some((o) => o.riskRating === 'Critical');
    const hasHigh = updatedObs.some((o) => o.riskRating === 'High');
    const overallRisk: RiskLevel = hasCritical
      ? 'Critical'
      : hasHigh
      ? 'High'
      : updatedObs.length > 0
      ? 'Medium'
      : 'Low';

    setReport({
      ...report,
      observations: updatedObs,
      overallSiteRisk: overallRisk,
    });
  };

  // Delete an observation
  const handleDeleteObservation = (id: string) => {
    if (!report) return;
    const remaining = report.observations.filter((o) => o.id !== id);
    setReport({
      ...report,
      observations: remaining,
      overallSiteRisk: remaining.some((o) => o.riskRating === 'Critical')
        ? 'Critical'
        : remaining.some((o) => o.riskRating === 'High')
        ? 'High'
        : remaining.length > 0
        ? 'Medium'
        : 'Low',
    });
    if (selectedObsId === id) {
      setSelectedObsId(remaining[0]?.id || null);
    }
  };

  const activeObs = report?.observations.find((o) => o.id === selectedObsId) || report?.observations[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300 select-none">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePhotoUpload(file);
        }}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePhotoUpload(file);
        }}
        className="hidden"
      />

      {/* Top Navigation Banner */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <span className="text-lg">🦺</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              HSE Vision
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/50">
                Photo Hazard Inspection
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Worksite AI Visual Safety Audit & Corrective Action Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {executionMode === 'MODE_C_HYBRID' ? (
            <button
              onClick={onOpenDiagnostics}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
              title="SnapAction Intelligence Router: Mode C (Gemini Vision + HSE Rules Engine). Tap to view Diagnostics."
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Hybrid Vision AI</span>
              {isCachedResult && <span className="opacity-75 font-normal text-[10px]">(Cached)</span>}
            </button>
          ) : executionMode === 'MODE_A_INTERNAL' ? (
            <button
              onClick={onOpenDiagnostics}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              title="SnapAction Intelligence Router: Mode A (Zero-Token Internal Processing). Tap to view Diagnostics."
            >
              <CheckCircle2 className="w-3 h-3 text-blue-500" />
              <span>Internal Engine</span>
            </button>
          ) : onOpenDiagnostics ? (
            <button
              onClick={onOpenDiagnostics}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="AI System Health & Diagnostics"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AI Health</span>
            </button>
          ) : null}

          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Exit HSE
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

      {/* Error State Banner (No Fake Hazards Injected) */}
      {analysisError && (
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Analysis Notice
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {analysisError.message}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                In accordance with HSE integrity standards, we do not substitute unrelated sample hazards. You can retry the visual analysis or place observation markers manually.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button
              onClick={() =>
                analyzePhotoWithAi(
                  analysisError.photoBase64,
                  analysisError.mimeType,
                  analysisError.filename
                )
              }
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry Visual Analysis
            </button>
            <button
              onClick={() =>
                handleStartManualInspection(
                  analysisError.photoBase64,
                  analysisError.mimeType,
                  analysisError.filename
                )
              }
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-orange-500" /> Annotate Manually
            </button>
            {onOpenDiagnostics && (
              <button
                onClick={onOpenDiagnostics}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                AI System Diagnostics
              </button>
            )}
            <button
              onClick={() => setAnalysisError(null)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 1. Upload & Photo Acquisition Mode (When No Report Active) */}
      {!report && (
        <div className="space-y-6">
          {/* Main Upload Box */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 text-center space-y-4 shadow-sm transition-colors">
            <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-inner">
              {isAnalyzing ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Camera className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isAnalyzing ? 'Analyzing Worksite Photograph...' : 'Upload Worksite Photograph'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isAnalyzing
                  ? analysisStep
                  : 'Take a camera photo or upload an image of steel erection, lifting, scaffolding, excavation, or industrial operations.'}
              </p>
            </div>

            {/* Dynamic 5-Dimension Scene Analysis Steps */}
            {isAnalyzing && (
              <div className="max-w-xs mx-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-left text-[11px] space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  Scene Understanding: People • Plant • Assets • Process • Environment
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Detecting true activity; no preloaded templates or copied findings.
                </div>
              </div>
            )}

            {!isAnalyzing && (
              <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Take Worksite Photo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  Browse Gallery
                </button>
              </div>
            )}
          </div>

          {/* Authentic HSE Worksite Photo Scenarios for 1-Tap Testing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Or Test with Distinct Worksite Scenarios
              </span>
              <span className="text-[11px] text-slate-400">Includes steel erection & safe negative test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HSE_SAMPLE_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleSelectSample(sc)}
                  disabled={sampleLoadingId !== null}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-600 text-left shadow-2xs hover:shadow-md transition-all cursor-pointer group disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl select-none">{sc.emoji}</span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                          {sc.title}
                        </span>
                        {sampleLoadingId === sc.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {sc.description}
                      </p>
                      <div className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold pt-0.5">
                        {sc.defaultObservations.length > 0
                          ? `${sc.defaultObservations.length} Hazards • ${sc.defaultOverallRisk} Risk`
                          : 'Full Protective Controls Active (0 Violations)'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Report Workspace (Tabs: Visual Review, Actions, Before/After, Final Report) */}
      {report && (
        <div className="space-y-4">
          {/* Work Activity & Scene Identity Banner */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                  {report.primaryActivity || report.activityObserved}
                </span>
                {report.secondaryActivities &&
                  report.secondaryActivities.map((sec, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
                    >
                      {sec}
                    </span>
                  ))}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {report.reportTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-xl uppercase tracking-wider border ${
                  report.overallSiteRisk === 'Critical'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : report.overallSiteRisk === 'High'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {report.overallSiteRisk} Risk
              </span>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Inspect a different photo"
              >
                <RefreshCw className="w-3 h-3" /> Change Photo
              </button>
            </div>
          </div>

          {/* Workspace Tabs Header */}
          <div className="flex items-center justify-between gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'canvas'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Visual Review ({report.observations.length})
            </button>

            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'actions'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Action Register
            </button>

            <button
              onClick={() => setActiveTab('before_after')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'before_after'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Before & After
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'report'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-600 dark:text-blue-400 hover:text-blue-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Generate Report
            </button>
          </div>

          {/* TAB 1: Visual Photo Review & Interactive Hazard Markers */}
          {activeTab === 'canvas' && (
            <div className="space-y-4">
              {/* Photo Canvas with Pin Markers */}
              <PhotoAnnotationCanvas
                imageSrc={report.photos[0].base64}
                observations={report.observations}
                positiveObservations={report.positiveObservations}
                selectedObservationId={selectedObsId}
                onSelectObservation={(id) => setSelectedObsId(id)}
                onAddMarker={handleAddMarker}
                onUpdateMarkerPosition={handleUpdateMarkerPosition}
                isEditingMarkers={isEditingMarkers}
              />

              {/* Marker Management Controls */}
              <div className="flex items-center justify-between text-xs px-1">
                <button
                  onClick={() => setIsEditingMarkers(!isEditingMarkers)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isEditingMarkers
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isEditingMarkers ? 'Cancel Pin Placement' : 'Place New Hazard Pin'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Change Photo
                  </button>
                </div>
              </div>

              {/* Compliant Site Banner (Negative Test Handling) */}
              {report.observations.length === 0 && (
                <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Controlled Worksite — Zero Critical Hazard Violations Observed
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    Visual examination reveals compliant protective systems and active safety measures. Existing controls have been marked with green verification badges on the photograph.
                  </p>
                </div>
              )}

              {/* Selected Finding Details Card & 5x5 Risk Matrix */}
              {activeObs ? (
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                  {/* Title & Category Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                          {activeObs.id}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {activeObs.hazardCategory}
                        </span>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                          {activeObs.evidenceClassification}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {activeObs.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteObservation(activeObs.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Remove this observation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Observed Condition & Potential Consequences */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 text-[10px] uppercase">
                        Observed Condition
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5">
                        {activeObs.observedCondition}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 text-[10px] uppercase">
                        Potential Consequences
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5">
                        {activeObs.potentialConsequences}
                      </p>
                    </div>
                  </div>

                  {/* Interactive 5x5 Risk Matrix */}
                  <RiskMatrix5x5
                    likelihood={activeObs.likelihood}
                    severity={activeObs.severity}
                    onChange={(l, s) =>
                      handleUpdateObservation(activeObs.id, { likelihood: l, severity: s })
                    }
                  />

                  {/* Immediate & Recommended Controls */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider block">
                      Hierarchy of Controls (Actions Required)
                    </span>

                    <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800">
                      <div>
                        <strong className="text-slate-900 dark:text-white">Immediate Action:</strong>{' '}
                        <span className="text-slate-700 dark:text-slate-300">
                          {activeObs.immediateAction}
                        </span>
                      </div>
                      {activeObs.engineeringControls && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong>Engineering:</strong> {activeObs.engineeringControls}
                        </div>
                      )}
                      {activeObs.administrativeControls && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong>Administrative:</strong> {activeObs.administrativeControls}
                        </div>
                      )}
                      {activeObs.ppeRequired && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong>PPE:</strong> {activeObs.ppeRequired}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* International Standards Reference Mapping */}
                  {activeObs.applicableStandards && activeObs.applicableStandards.length > 0 && (
                    <div className="space-y-1 pt-1 text-xs">
                      <span className="font-bold text-slate-500 text-[10px] uppercase">
                        Applicable Standards & Verifiable Regulatory Basis
                      </span>
                      <div className="space-y-1">
                        {activeObs.applicableStandards.map((std, si) => (
                          <div
                            key={si}
                            className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/50 text-[11px]"
                          >
                            <span className="font-bold text-blue-700 dark:text-blue-300">
                              {std.standard}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400 ml-1.5">
                              {std.title} — {std.summary}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                  {report.observations.length === 0
                    ? 'No unsafe conditions observed in this photograph. Tap "Place New Hazard Pin" if you wish to record a specific site observation.'
                    : 'Select a numbered pin on the photograph to inspect its findings and corrective actions.'}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Corrective Action Register */}
          {activeTab === 'actions' && (
            <CorrectiveActionTable
              observations={report.observations}
              onUpdateObservation={handleUpdateObservation}
              onSelectObservation={(id) => {
                setSelectedObsId(id);
                setActiveTab('canvas');
              }}
            />
          )}

          {/* TAB 3: Before & After Rectification Verification */}
          {activeTab === 'before_after' && (
            <BeforeAfterComparison
              beforePhotoSrc={report.photos[0].base64}
              afterPhotoSrc={afterPhotoSrc}
              onUploadAfterPhoto={(b64) => setAfterPhotoSrc(b64)}
              observations={report.observations}
              closureNotes={report.closureReviewNotes || ''}
              onChangeClosureNotes={(notes) =>
                setReport({ ...report, closureReviewNotes: notes })
              }
              isVerifiedByInspector={report.reviewerApproved || false}
              onToggleInspectorVerification={(v) =>
                setReport({ ...report, reviewerApproved: v })
              }
            />
          )}

          {/* TAB 4: Formal HSE Inspection Report & Exports */}
          {activeTab === 'report' && (
            <HseReportView
              report={report}
              onUpdateReport={(updated) => setReport(updated)}
              onBackToEdit={() => setActiveTab('canvas')}
              globalLanguage={globalLanguage}
            />
          )}
        </div>
      )}
    </div>
  );
};
