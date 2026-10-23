export type EvidenceClassification =
  | 'Visible Finding'
  | 'Potential Concern'
  | 'Not Verifiable From Photo'
  | 'Field Verification Required';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ActionStatus = 'Open' | 'In Progress' | 'Pending Verification' | 'Closed';

export type HazardCategory =
  | 'Working at Height'
  | 'Scaffolding & Access'
  | 'Lifting & Rigging'
  | 'Excavation & Trenching'
  | 'Electrical Safety'
  | 'Confined Space'
  | 'Mobile Plant & Traffic'
  | 'Machinery & Guarding'
  | 'Lockout / Tagout (LOTO)'
  | 'Fire & Hot Work'
  | 'Chemical & Hazardous Substances'
  | 'PPE Compliance'
  | 'Housekeeping & Slips/Trips'
  | 'Ergonomics & Manual Handling'
  | 'Dust, Fumes & Noise'
  | 'Environmental & Dewatering'
  | 'Temporary Works'
  | 'Emergency Access & Egress'
  | 'Process Safety & Pressure Systems'
  | 'General Workplace Safety';

export interface StandardReference {
  standard: string; // e.g. 'OSHA 29 CFR 1926.651', 'ISO 45001:2018 Cl. 8.1.2', 'HSE UK HSG150'
  title: string;
  clause?: string;
  summary: string;
}

export interface HazardBoundingBox {
  x: number; // 0.0 - 1.0 (relative to image)
  y: number; // 0.0 - 1.0 (relative to image)
  width: number; // 0.0 - 1.0
  height: number; // 0.0 - 1.0
}

export interface HazardObservation {
  id: string; // HAZ-01
  markerNumber: number; // 1, 2, 3
  xPercent: number; // 0 - 100% position on photograph
  yPercent: number; // 0 - 100% position on photograph
  boundingBox?: HazardBoundingBox;
  box?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  hazardCategory: HazardCategory;
  title: string;
  observedCondition: string;
  potentialConsequences: string;
  exposedParties: string;
  evidenceClassification: EvidenceClassification;
  existingControls: string;
  missingOrQuestionableControls: string;
  likelihood: number; // 1 to 5
  severity: number; // 1 to 5
  riskScore: number; // likelihood * severity (1 - 25)
  riskRating: RiskLevel;
  immediateAction: string;
  engineeringControls: string;
  administrativeControls: string;
  ppeRequired: string;
  residualRisk: 'Low' | 'Medium' | 'High';
  applicableStandards: StandardReference[];
  fieldVerificationQuestions: string[];
  photoId?: string;
  confidence?: number;
  // Corrective action tracking
  actionAssignee?: string;
  actionTargetDate?: string;
  actionStatus: ActionStatus;
  closureEvidenceText?: string;
  closurePhotoBase64?: string;
  inspectorVerifiedClosure?: boolean;
}

export interface PositiveObservation {
  id: string;
  title: string;
  description: string;
  category: string;
  xPercent?: number;
  yPercent?: number;
}

export interface InspectedPhoto {
  id: string;
  base64: string;
  mimeType: string;
  caption: string;
  timestamp: string;
  locationTag?: string;
}

export interface HseInspectionReport {
  id: string; // HSE-2026-XXXX
  imageHash?: string;
  reportTitle: string;
  inspectionDate: string;
  inspectionTime: string;
  siteName: string;
  projectNumber: string;
  workArea: string;
  primaryActivity?: string;
  secondaryActivities?: string[];
  activityObserved: string;
  inspectorName: string;
  inspectorDesignation: string;
  reviewerName?: string;
  reviewerApproved?: boolean;
  approvalDate?: string;
  executiveSummary: string;
  photos: InspectedPhoto[];
  selectedPhotoId: string;
  observations: HazardObservation[];
  positiveObservations: PositiveObservation[];
  mattersRequiringFieldVerification: string[];
  overallSiteRisk: RiskLevel;
  closureReviewNotes?: string;
  jurisdiction: 'International (OSHA/ISO)' | 'UK (HSE)' | 'UAE (OSHAD)' | 'India (BOCW/Factories Act)';
  reportLanguage: string;
}

export function calculateRiskLevel(likelihood: number, severity: number): { score: number; level: RiskLevel } {
  const l = Math.max(1, Math.min(5, Math.round(likelihood)));
  const s = Math.max(1, Math.min(5, Math.round(severity)));
  const score = l * s;

  if (score >= 15) return { score, level: 'Critical' };
  if (score >= 10) return { score, level: 'High' };
  if (score >= 5) return { score, level: 'Medium' };
  return { score, level: 'Low' };
}
