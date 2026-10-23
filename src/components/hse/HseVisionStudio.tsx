import React, { useState, useRef } from 'react';
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

interface HseVisionStudioProps {
  onBackToMain?: () => void;
  globalLanguage: LanguageOption;
  onOpenLanguageSelector: () => void;
}

export type HseStudioTab = 'canvas' | 'actions' | 'before_after' | 'report';

export const HseVisionStudio: React.FC<HseVisionStudioProps> = ({
  onBackToMain,
  globalLanguage,
  onOpenLanguageSelector,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Inspection Dossier State
  const [report, setReport] = useState<HseInspectionReport | null>(null);
  const [activeTab, setActiveTab] = useState<HseStudioTab>('canvas');
  const [selectedObsId, setSelectedObsId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sampleLoadingId, setSampleLoadingId] = useState<string | null>(null);
  const [isEditingMarkers, setIsEditingMarkers] = useState(false);
  const [afterPhotoSrc, setAfterPhotoSrc] = useState<string | null>(null);

  // 1. Load an authentic sample scenario for rapid demo & testing
  const handleSelectSample = async (scenario: HseSampleScenario) => {
    try {
      setSampleLoadingId(scenario.id);
      const svg = scenario.getSvg();
      const pngBase64 = await svgToPngBase64(svg, 1000, 700);

      const newPhoto: InspectedPhoto = {
        id: `photo_${Date.now()}`,
        base64: pngBase64,
        mimeType: 'image/png',
        caption: `${scenario.title} - Visual Evidence`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        locationTag: scenario.workArea,
      };

      const newReport: HseInspectionReport = {
        id: `HSE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        reportTitle: `${scenario.industry} Safety Audit`,
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        siteName: 'Al-Ain International Terminal Expansion',
        projectNumber: 'PKG-04B-CIV',
        workArea: scenario.workArea,
        activityObserved: scenario.activity,
        inspectorName: 'Senior Safety Auditor (Competent Person)',
        inspectorDesignation: 'Chartered HSE Inspector (NEBOSH / CMIOSH)',
        executiveSummary: `Worksite visual inspection conducted at ${scenario.workArea}. Observed activity: ${scenario.activity}. ${scenario.description}. Evaluation identified ${scenario.defaultObservations.length} potential hazard observation(s) requiring hierarchy of controls implementation, and ${scenario.defaultPositiveObservations.length} positive safety controls currently active.`,
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
    setIsAnalyzing(true);

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

  // 3. AI Vision Analysis Call
  const analyzePhotoWithAi = async (base64: string, mimeType: string, filename?: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/hse-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          jurisdiction: 'International (OSHA/ISO)',
          preferredLanguage: globalLanguage.name,
        }),
      });

      if (!res.ok) {
        throw new Error('AI analysis failed');
      }

      const data = await res.json();
      const photo: InspectedPhoto = {
        id: `photo_${Date.now()}`,
        base64,
        mimeType,
        caption: filename || 'Worksite Photo',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const createdReport: HseInspectionReport = {
        ...data,
        id: data.id || `HSE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        photos: [photo],
        selectedPhotoId: photo.id,
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reportLanguage: globalLanguage.name,
      };

      setReport(createdReport);
      setSelectedObsId(createdReport.observations[0]?.id || null);
      setActiveTab('canvas');
    } catch (err) {
      console.warn('API call failed, falling back to instant local template:', err);
      // Fallback: load excavation scenario with uploaded image
      const fallbackPhoto: InspectedPhoto = {
        id: `photo_${Date.now()}`,
        base64,
        mimeType,
        caption: filename || 'Worksite Inspection Photo',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const fallbackScenario = HSE_SAMPLE_SCENARIOS[0];
      setReport({
        id: `HSE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        reportTitle: 'Civil Works Safety Inspection',
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        siteName: 'Project Worksite Sector 4',
        projectNumber: 'PRJ-2026-CIV',
        workArea: 'Active Working Zone',
        activityObserved: 'Civil excavation & plant operations',
        inspectorName: 'Lead HSE Auditor',
        inspectorDesignation: 'HSE Engineer',
        executiveSummary: `Worksite visual inspection recorded. Evaluated photo evidence for edge protection, plant segregation, access routes, and PPE compliance.`,
        photos: [fallbackPhoto],
        selectedPhotoId: fallbackPhoto.id,
        observations: fallbackScenario.defaultObservations,
        positiveObservations: fallbackScenario.defaultPositiveObservations,
        mattersRequiringFieldVerification: fallbackScenario.defaultVerificationItems,
        overallSiteRisk: 'High',
        jurisdiction: 'International (OSHA/ISO)',
        reportLanguage: globalLanguage.name,
      });
      setSelectedObsId('HAZ-01');
      setActiveTab('canvas');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add a manual marker on canvas
  const handleAddMarker = (xPercent: number, yPercent: number) => {
    if (!report) return;
    const nextMarkerNum = report.observations.length + 1;
    const newId = `HAZ-0${nextMarkerNum}`;

    const newObs: HazardObservation = {
      id: newId,
      markerNumber: nextMarkerNum,
      xPercent,
      yPercent,
      hazardCategory: 'General Workplace Safety',
      title: 'Inspector Identified Hazard',
      observedCondition: 'Potentially unsafe condition noted by inspector during visual review.',
      potentialConsequences: 'Injury risk or operational interruption.',
      exposedParties: 'Worksite personnel',
      evidenceClassification: 'Visible Finding',
      existingControls: 'To be verified',
      missingOrQuestionableControls: 'Standard controls required',
      likelihood: 3,
      severity: 3,
      riskScore: 9,
      riskRating: 'Medium',
      immediateAction: 'Inspect condition and install appropriate protection.',
      engineeringControls: 'Physical barriers or guarding',
      administrativeControls: 'Brief crew during daily toolbox talk',
      ppeRequired: 'Standard site PPE',
      residualRisk: 'Low',
      applicableStandards: getApplicableStandards('General Workplace Safety'),
      fieldVerificationQuestions: ['Confirm physical condition and root cause.'],
      actionStatus: 'Open',
    };

    setReport({
      ...report,
      observations: [...report.observations, newObs],
    });
    setSelectedObsId(newId);
    setIsEditingMarkers(false);
  };

  // Update observation fields
  const handleUpdateObservation = (id: string, updates: Partial<HazardObservation>) => {
    if (!report) return;
    const updatedObs = report.observations.map((o) => {
      if (o.id !== id) return o;
      const merged = { ...o, ...updates };
      // Recalculate risk rating if L or S changed
      if (updates.likelihood !== undefined || updates.severity !== undefined) {
        const { score, level } = calculateRiskLevel(merged.likelihood, merged.severity);
        merged.riskScore = score;
        merged.riskRating = level;
      }
      return merged;
    });

    // Recalculate overall site risk
    const hasCritical = updatedObs.some((o) => o.riskRating === 'Critical');
    const hasHigh = updatedObs.some((o) => o.riskRating === 'High');
    const overallRisk: RiskLevel = hasCritical ? 'Critical' : hasHigh ? 'High' : 'Medium';

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
    setReport({ ...report, observations: remaining });
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
                  ? 'Detecting activities, plant, visual hazards, and safety controls...'
                  : 'Take a camera photo or upload an image of excavation, scaffolding, lifting, or industrial operations.'}
              </p>
            </div>

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
                Or Test with Realistic Worksite Scenarios
              </span>
              <span className="text-[11px] text-slate-400">Includes compliant negative test</span>
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

              {/* Selected Finding Details Card & 5x5 Risk Matrix */}
              {activeObs ? (
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                  {/* Title & Category Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
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
                  No hazards detected or all observations resolved. Safe controls confirmed.
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
