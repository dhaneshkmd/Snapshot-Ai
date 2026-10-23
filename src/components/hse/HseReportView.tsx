import React, { useState } from 'react';
import { HseInspectionReport, HazardObservation, RiskLevel } from '../../modules/hse/hseTypes';
import {
  Printer,
  FileDown,
  FileSpreadsheet,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  Building,
  Languages,
  Loader2,
  FileText,
} from 'lucide-react';
import { LanguageOption } from '../../modules/languages/languageData';

interface HseReportViewProps {
  report: HseInspectionReport;
  onUpdateReport: (updated: HseInspectionReport) => void;
  onBackToEdit: () => void;
  globalLanguage: LanguageOption;
}

export const HseReportView: React.FC<HseReportViewProps> = ({
  report,
  onUpdateReport,
  onBackToEdit,
  globalLanguage,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Action Register
  const handleExportCsv = () => {
    const headers = [
      'Finding ID',
      'Marker #',
      'Hazard Category',
      'Title',
      'Risk Rating',
      'Likelihood',
      'Severity',
      'Evidence Classification',
      'Action Status',
      'Responsible Person',
      'Target Date',
      'Immediate Action',
      'Engineering Control',
      'Administrative Control',
      'PPE Required',
      'Residual Risk',
    ];

    const rows = report.observations.map((o) => [
      `"${o.id}"`,
      `"${o.markerNumber}"`,
      `"${o.hazardCategory}"`,
      `"${o.title.replace(/"/g, '""')}"`,
      `"${o.riskRating}"`,
      `"${o.likelihood}"`,
      `"${o.severity}"`,
      `"${o.evidenceClassification}"`,
      `"${o.actionStatus}"`,
      `"${(o.actionAssignee || 'Unassigned').replace(/"/g, '""')}"`,
      `"${o.actionTargetDate || 'TBD'}"`,
      `"${(o.immediateAction || '').replace(/"/g, '""')}"`,
      `"${(o.engineeringControls || '').replace(/"/g, '""')}"`,
      `"${(o.administrativeControls || '').replace(/"/g, '""')}"`,
      `"${(o.ppeRequired || '').replace(/"/g, '""')}"`,
      `"${o.residualRisk}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.id}_HSE_Action_Register.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Word-Compatible HTML (.doc)
  const handleExportDoc = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${report.reportTitle} - ${report.id}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.5; color: #1e293b; padding: 20px; }
          h1 { color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 6px; }
          h2 { color: #1e40af; margin-top: 24px; border-bottom: 1px solid #cbd5e1; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .meta-table td { padding: 6px 10px; border: 1px solid #cbd5e1; font-size: 13px; }
          .meta-table td.header { background: #f1f5f9; font-weight: bold; width: 22%; }
          .obs-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 14px; page-break-inside: avoid; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
          .critical { background: #fee2e2; color: #991b1b; }
          .high { background: #ffedd5; color: #9a3412; }
          .medium { background: #fef9c3; color: #854d0e; }
          .low { background: #dcfce7; color: #166534; }
          .disclaimer { background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 6px; font-size: 12px; color: #92400e; margin: 15px 0; }
        </style>
      </head>
      <body>
        <h1>${report.reportTitle}</h1>
        <div class="disclaimer">
          <strong>LEGAL & REGULATORY NOTICE:</strong> AI-generated preliminary inspection observations. Competent HSE inspector field review and physical verification mandatory prior to regulatory sign-off.
        </div>
        <table class="meta-table">
          <tr><td class="header">Report Ref</td><td>${report.id}</td><td class="header">Date & Time</td><td>${report.inspectionDate} ${report.inspectionTime}</td></tr>
          <tr><td class="header">Project / Site</td><td>${report.siteName} (${report.projectNumber})</td><td class="header">Work Area</td><td>${report.workArea}</td></tr>
          <tr><td class="header">Lead Inspector</td><td>${report.inspectorName} (${report.inspectorDesignation})</td><td class="header">Overall Risk</td><td><strong>${report.overallSiteRisk}</strong></td></tr>
          <tr><td class="header">Activity Observed</td><td colspan="3">${report.activityObserved}</td></tr>
        </table>

        <h2>Executive Summary</h2>
        <p>${report.executiveSummary}</p>

        <h2>Hazard Observations & Corrective Actions (${report.observations.length})</h2>
        ${report.observations
          .map(
            (o) => `
          <div class="obs-box">
            <div style="margin-bottom: 8px;">
              <strong>[${o.id}] Marker #${o.markerNumber}: ${o.title}</strong>
              <span class="badge ${o.riskRating.toLowerCase()}">${o.riskRating} Risk (L${o.likelihood} x S${o.severity})</span>
              <span style="font-size: 11px; color: #64748b; margin-left: 10px;">Classification: ${o.evidenceClassification}</span>
            </div>
            <p><strong>Observed Condition:</strong> ${o.observedCondition}</p>
            <p><strong>Potential Consequences:</strong> ${o.potentialConsequences}</p>
            <p><strong>Exposed Parties:</strong> ${o.exposedParties}</p>
            <p><strong>Immediate Action:</strong> ${o.immediateAction}</p>
            <p><strong>Engineering Controls:</strong> ${o.engineeringControls || 'N/A'}</p>
            <p><strong>Administrative Controls:</strong> ${o.administrativeControls || 'N/A'}</p>
            <p><strong>Action Assignee:</strong> ${o.actionAssignee || 'Unassigned'} | <strong>Target Date:</strong> ${o.actionTargetDate || 'TBD'} | <strong>Status:</strong> ${o.actionStatus}</p>
          </div>
        `
          )
          .join('')}

        <h2>Positive Safety Controls Observed (${report.positiveObservations.length})</h2>
        <ul>
          ${report.positiveObservations.map((p) => `<li><strong>${p.title}:</strong> ${p.description}</li>`).join('')}
        </ul>

        <h2>Matters Requiring On-Site Field Verification</h2>
        <ul>
          ${report.mattersRequiringFieldVerification.map((m) => `<li>${m}</li>`).join('')}
        </ul>

        <h2>Signatures & Approvals</h2>
        <table class="meta-table" style="margin-top: 20px;">
          <tr><td class="header">Inspected By</td><td>${report.inspectorName}</td><td class="header">Date</td><td>${report.inspectionDate}</td></tr>
          <tr><td class="header">Reviewed & Approved By</td><td>${report.reviewerName || 'HSE Manager'}</td><td class="header">Status</td><td>${report.reviewerApproved ? 'APPROVED' : 'PENDING REVIEW'}</td></tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_Inspection_Report.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy structured report text
  const handleCopyText = async () => {
    const text = `
==================================================
HSE INSPECTION REPORT: ${report.reportTitle}
REFERENCE ID: ${report.id}
DATE: ${report.inspectionDate} ${report.inspectionTime}
SITE / LOCATION: ${report.siteName} - ${report.workArea}
INSPECTOR: ${report.inspectorName} (${report.inspectorDesignation})
OVERALL RISK LEVEL: ${report.overallSiteRisk}
==================================================

EXECUTIVE SUMMARY:
${report.executiveSummary}

IDENTIFIED HAZARDS & CORRECTIVE ACTIONS (${report.observations.length}):
${report.observations
  .map(
    (o, i) => `
[${o.id}] Marker #${o.markerNumber} — ${o.title}
Risk Priority: ${o.riskRating} (Score: ${o.riskScore}/25 | Likelihood: ${o.likelihood}, Severity: ${o.severity})
Classification: ${o.evidenceClassification}
Observed Condition: ${o.observedCondition}
Potential Consequences: ${o.potentialConsequences}
Immediate Action: ${o.immediateAction}
Controls (Eng/Admin/PPE): ${o.engineeringControls} | ${o.administrativeControls} | ${o.ppeRequired}
Action Assignee: ${o.actionAssignee || 'Unassigned'}
Target Completion: ${o.actionTargetDate || 'TBD'}
Status: ${o.actionStatus}
`
  )
  .join('\n')}

POSITIVE SAFETY OBSERVATIONS:
${report.positiveObservations.map((p) => `- ${p.title}: ${p.description}`).join('\n')}

MATTERS REQUIRING PHYSICAL VERIFICATION:
${report.mattersRequiringFieldVerification.map((m) => `- ${m}`).join('\n')}

DISCLAIMER: AI-generated preliminary findings. Competent HSE inspector field review and physical verification mandatory.
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  // Multilingual Report Translation
  const handleTranslateReport = async () => {
    if (globalLanguage.code === 'en') return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionName: `HSE Report Translation (${globalLanguage.name})`,
          actionPrompt: `Translate this Executive HSE Inspection Summary into professional, technically accurate ${globalLanguage.name} (${globalLanguage.nativeName}). Preserve official HSE terminology, proper nouns, and regulatory references. Output ONLY the translated executive summary:
"${report.executiveSummary}"`,
          contextSummary: `HSE Report for ${report.siteName}`,
          extractedText: report.executiveSummary,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTranslatedSummary(data.result);
      }
    } catch (err) {
      console.error('Translation failed', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-500 text-white';
      case 'High':
        return 'bg-amber-500 text-white';
      case 'Medium':
        return 'bg-yellow-400 text-slate-900';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Action Buttons (Hidden during Print) */}
      <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
        <button
          onClick={onBackToEdit}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          ← Back to Findings & Visual Markers
        </button>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>

          <button
            onClick={handleExportDoc}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Export Word (.doc)
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Action CSV
          </button>

          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Multilingual Translation Notice */}
      {globalLanguage.code !== 'en' && (
        <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between text-xs print:hidden">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <span className="text-base">{globalLanguage.flag}</span>
            <span>
              Target report language: <strong>{globalLanguage.name} ({globalLanguage.nativeName})</strong>
            </span>
          </div>
          <button
            onClick={handleTranslateReport}
            disabled={isTranslating}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
            Translate Summary
          </button>
        </div>
      )}

      {/* Official HSE Report Document (Print-Styled) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6 print:p-0 print:border-none print:shadow-none text-slate-900 dark:text-slate-100">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Official Worksite HSE Audit & Hazard Inspection
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                {report.reportTitle}
              </h1>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                REF: {report.id}
              </span>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getRiskColor(
                    report.overallSiteRisk
                  )}`}
                >
                  {report.overallSiteRisk} Risk Site
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Guardrail Disclaimer Banner (Requirement 14) */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>MANDATORY NOTICE:</strong> AI-generated preliminary safety inspection findings. Independent on-site review and physical verification by a qualified, competent HSE professional is mandatory prior to statutory or contractual sign-off.
            </div>
          </div>
        </div>

        {/* Inspection Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/70 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Inspection Date</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {report.inspectionDate} {report.inspectionTime}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Project / Site</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" />
              {report.siteName}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Work Area</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {report.workArea}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Lead Inspector</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              {report.inspectorName}
            </div>
          </div>
        </div>

        {/* Activity Description */}
        <div className="text-xs space-y-1">
          <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
            Activity Observed Under Scope
          </span>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {report.activityObserved}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
            Executive Inspection Summary
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {report.executiveSummary}
          </p>

          {/* Translated Executive Summary if present */}
          {translatedSummary && (
            <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
              <div className="font-bold text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Executive Summary in {globalLanguage.name} ({globalLanguage.nativeName})
              </div>
              <p className="leading-relaxed">{translatedSummary}</p>
            </div>
          )}
        </div>

        {/* Primary Annotated Photo Showcase */}
        {report.photos.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
              Inspection Photo Record with Hazard Markers
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
              <img
                src={report.photos[0].base64}
                alt="Worksite photo"
                className="w-full max-h-[400px] object-contain block mx-auto"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>{report.photos[0].caption || 'Primary Worksite Evidence Photo'}</span>
              <span>Total Markers Identified: {report.observations.length}</span>
            </div>
          </div>
        )}

        {/* Detailed Observations & Hierarchy of Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
            Detailed Hazard Findings & Control Recommendations ({report.observations.length})
          </h3>

          <div className="space-y-3">
            {report.observations.map((obs, idx) => (
              <div
                key={obs.id}
                className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-3 text-xs"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-blue-600 dark:text-blue-400">
                        {obs.id}
                      </span>
                      <span className="font-bold text-slate-500">
                        Marker #{String(obs.markerNumber).padStart(2, '0')}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {obs.hazardCategory}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        [{obs.evidenceClassification}]
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {obs.title}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getRiskColor(
                        obs.riskRating
                      )}`}
                    >
                      {obs.riskRating}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Score: {obs.riskScore} (L{obs.likelihood}×S{obs.severity})
                    </div>
                  </div>
                </div>

                {/* Facts & Consequences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Observed Condition</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                      {obs.observedCondition}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Potential Consequences</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                      {obs.potentialConsequences}
                    </p>
                  </div>
                </div>

                {/* Hierarchy of Controls Recommendations */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Immediate Action:</strong>{' '}
                    {obs.immediateAction}
                  </div>
                  {obs.engineeringControls && (
                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                      <strong>Engineering Controls:</strong> {obs.engineeringControls}
                    </div>
                  )}
                  {obs.administrativeControls && (
                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                      <strong>Administrative Controls:</strong> {obs.administrativeControls}
                    </div>
                  )}
                  {obs.ppeRequired && (
                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                      <strong>PPE Required:</strong> {obs.ppeRequired}
                    </div>
                  )}
                </div>

                {/* Standards Matrix & Regulatory Mapping */}
                {obs.applicableStandards && obs.applicableStandards.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold text-slate-400">Applicable Standards:</span>
                    {obs.applicableStandards.map((std, si) => (
                      <span
                        key={si}
                        className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 text-[10px] font-semibold"
                        title={std.summary}
                      >
                        {std.standard}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Positive Safety Observations */}
        {report.positiveObservations.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-800 pb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Positive Safety Controls & Compliant Observations ({report.positiveObservations.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {report.positiveObservations.map((pos) => (
                <div
                  key={pos.id}
                  className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 space-y-0.5"
                >
                  <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {pos.title}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {pos.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matters Requiring Physical Verification */}
        {report.mattersRequiringFieldVerification.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
              Matters Requiring On-Site Field Verification
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              {report.mattersRequiringFieldVerification.map((m, idx) => (
                <li key={idx} className="leading-relaxed">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sign-off & Review Section */}
        <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Field Inspector Signature
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {report.inspectorName}
            </div>
            <div className="text-[11px] text-slate-500">
              {report.inspectorDesignation} • {report.inspectionDate}
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-mono">
              DIGITAL AUDIT STAMP: VERIFIED-{report.id}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                HSE Reviewer Approval
              </span>
              <label className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={report.reviewerApproved || false}
                  onChange={(e) =>
                    onUpdateReport({
                      ...report,
                      reviewerApproved: e.target.checked,
                      approvalDate: e.target.checked ? new Date().toISOString().split('T')[0] : undefined,
                    })
                  }
                  className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Confirm Sign-Off</span>
              </label>
            </div>

            <input
              type="text"
              value={report.reviewerName || ''}
              placeholder="Reviewer Name (e.g. HSE Director)"
              onChange={(e) => onUpdateReport({ ...report, reviewerName: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
            <div className="text-[11px] text-slate-500">
              Approval Status:{' '}
              <strong className={report.reviewerApproved ? 'text-emerald-600' : 'text-amber-600'}>
                {report.reviewerApproved ? 'APPROVED & COUNTERSIGNED' : 'PENDING COUNTERSIGNATURE'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
