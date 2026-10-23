/**
 * Smart PDF Studio — Document Data Model & Template Library
 *
 * Core Concept:
 * Random Notes → AI Understands → Organizes → Professionally Writes → Designs → PDF
 */

export type DocumentThemeId =
  | 'corporate-blue'
  | 'executive-minimal'
  | 'modern-professional'
  | 'elegant-green'
  | 'academic'
  | 'creative-modern';

export type PageSize = 'A4' | 'Letter';
export type PageOrientation = 'portrait' | 'landscape';

export type DocumentLengthMode = 'concise' | 'standard' | 'detailed';
export type QuickDocumentMode = 'organize_only' | 'professional_rewrite' | 'full_report';

export type WritingStyle =
  | 'professional'
  | 'executive'
  | 'formal'
  | 'simple'
  | 'academic'
  | 'technical'
  | 'detailed'
  | 'concise'
  | 'persuasive'
  | 'educational'
  | 'neutral';

export interface DocumentTheme {
  id: DocumentThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBg: string;
  headerTextColor: string;
  borderColor: string;
  badgeBg: string;
  badgeTextColor: string;
  tableHeaderBg: string;
  tableHeaderTextColor: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
}

export const DOCUMENT_THEMES: Record<DocumentThemeId, DocumentTheme> = {
  'corporate-blue': {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    tagline: 'Navy & royal accents for executive & business reports',
    primaryColor: '#1e3a8a', // blue-900
    secondaryColor: '#2563eb', // blue-600
    accentColor: '#3b82f6',
    headerBg: '#0f172a',
    headerTextColor: '#ffffff',
    borderColor: '#cbd5e1',
    badgeBg: '#dbeafe',
    badgeTextColor: '#1e40af',
    tableHeaderBg: '#1e3a8a',
    tableHeaderTextColor: '#ffffff',
    fontFamilyHeading: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontFamilyBody: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  'executive-minimal': {
    id: 'executive-minimal',
    name: 'Executive Minimal',
    tagline: 'Black, white & restrained charcoal monochrome styling',
    primaryColor: '#09090b', // slate-950
    secondaryColor: '#27272a', // zinc-800
    accentColor: '#52525b',
    headerBg: '#18181b',
    headerTextColor: '#ffffff',
    borderColor: '#e4e4e7',
    badgeBg: '#f4f4f5',
    badgeTextColor: '#18181b',
    tableHeaderBg: '#18181b',
    tableHeaderTextColor: '#ffffff',
    fontFamilyHeading: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontFamilyBody: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  'modern-professional': {
    id: 'modern-professional',
    name: 'Modern Professional',
    tagline: 'Clean layout with slate, indigo & subtle accent framing',
    primaryColor: '#312e81', // indigo-900
    secondaryColor: '#4f46e5', // indigo-600
    accentColor: '#6366f1',
    headerBg: '#1e1b4b',
    headerTextColor: '#ffffff',
    borderColor: '#e0e7ff',
    badgeBg: '#e0e7ff',
    badgeTextColor: '#3730a3',
    tableHeaderBg: '#3730a3',
    tableHeaderTextColor: '#ffffff',
    fontFamilyHeading: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontFamilyBody: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  'elegant-green': {
    id: 'elegant-green',
    name: 'Elegant Green',
    tagline: 'Forest & emerald tones for sustainability & growth documents',
    primaryColor: '#064e3b', // emerald-900
    secondaryColor: '#059669', // emerald-600
    accentColor: '#10b981',
    headerBg: '#022c22',
    headerTextColor: '#ffffff',
    borderColor: '#d1fae5',
    badgeBg: '#d1fae5',
    badgeTextColor: '#065f46',
    tableHeaderBg: '#064e3b',
    tableHeaderTextColor: '#ffffff',
    fontFamilyHeading: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontFamilyBody: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  'academic': {
    id: 'academic',
    name: 'Academic',
    tagline: 'Scholarly typography with formal serif styling for research & study',
    primaryColor: '#451a03', // amber-950 / warm walnut
    secondaryColor: '#b45309', // amber-700
    accentColor: '#d97706',
    headerBg: '#291e10',
    headerTextColor: '#fef3c7',
    borderColor: '#fde68a',
    badgeBg: '#fef3c7',
    badgeTextColor: '#78350f',
    tableHeaderBg: '#451a03',
    tableHeaderTextColor: '#ffffff',
    fontFamilyHeading: 'Georgia, Cambria, "Times New Roman", Times, serif',
    fontFamilyBody: 'Georgia, Cambria, "Times New Roman", Times, serif',
  },
  'creative-modern': {
    id: 'creative-modern',
    name: 'Creative Modern',
    tagline: 'Vibrant violet, berry & coral gradients for proposals & strategy',
    primaryColor: '#581c87', // purple-900
    secondaryColor: '#9333ea', // purple-600
    accentColor: '#ec4899', // pink-500
    headerBg: '#3b0764',
    headerTextColor: '#ffffff',
    borderColor: '#f3e8ff',
    badgeBg: '#fae8ff',
    badgeTextColor: '#86198f',
    tableHeaderBg: '#581c87',
    tableHeaderTextColor: '#ffffff',
    fontFamilyHeading: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontFamilyBody: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
};

// Content Blocks
export interface ParagraphBlock {
  type: 'paragraph';
  id: string;
  text: string;
  calloutType?: 'info' | 'warning' | 'tip' | 'quote';
}

export interface ListBlock {
  type: 'list';
  id: string;
  style: 'bullet' | 'numbered' | 'checklist';
  items: string[];
}

export interface TableBlock {
  type: 'table';
  id: string;
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface KeyValueBlock {
  type: 'key_value';
  id: string;
  pairs: { label: string; value: string }[];
}

export type ContentBlock = ParagraphBlock | ListBlock | TableBlock | KeyValueBlock;

export interface DocumentSection {
  id: string;
  heading: string;
  icon?: string;
  blocks: ContentBlock[];
}

export interface DocumentMetadata {
  companyName?: string;
  logoBase64?: string;
  documentReference?: string;
  preparedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  date?: string;
  revisionNumber?: string;
  confidentialityNotice?: string;
  sourceNoteSummary?: string;
}

export interface SmartDocument {
  id: string;
  title: string;
  subtitle?: string;
  documentType: string;
  category: string;
  language: string;
  theme: DocumentThemeId;
  pageSize: PageSize;
  orientation: PageOrientation;
  lengthMode: DocumentLengthMode;
  writingStyle: WritingStyle;
  quickMode: QuickDocumentMode;
  executiveSummary?: string;
  sections: DocumentSection[];
  metadata: DocumentMetadata;
  createdAt: string;
  rawInputSnippet?: string;
}

// 54 Document Templates across 6 Categories
export interface DocumentTemplateItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  recommendedTheme: DocumentThemeId;
  defaultSections: string[];
}

export const DOCUMENT_TEMPLATES: DocumentTemplateItem[] = [
  // 1. Business Documents (10)
  {
    id: 'business_report',
    name: 'Business Report',
    category: 'Business Documents',
    emoji: '📊',
    description: 'Comprehensive organizational analysis with executive briefing and recommendations.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Executive Summary', 'Context & Background', 'Current Analysis', 'Key Findings', 'Strategic Recommendations'],
  },
  {
    id: 'executive_summary',
    name: 'Executive Summary',
    category: 'Business Documents',
    emoji: '👔',
    description: 'High-level decision briefing highlighting core drivers, metrics, and actions.',
    recommendedTheme: 'executive-minimal',
    defaultSections: ['Overview', 'Strategic Objectives', 'Performance Metrics', 'Critical Decisions', 'Next Milestones'],
  },
  {
    id: 'business_proposal',
    name: 'Business Proposal',
    category: 'Business Documents',
    emoji: '💼',
    description: 'Client-facing commercial pitch with scope, methodology, timeline, and pricing.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Proposal Overview', 'Client Needs & Scope', 'Proposed Solution', 'Timeline & Deliverables', 'Commercials & Terms'],
  },
  {
    id: 'meeting_minutes',
    name: 'Meeting Minutes',
    category: 'Business Documents',
    emoji: '📝',
    description: 'Structured record of discussions, attendees, key decisions, and action register.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Meeting Details', 'Attendees', 'Discussion Summary', 'Key Decisions', 'Action Items & Owners'],
  },
  {
    id: 'project_progress_report',
    name: 'Project Progress Report',
    category: 'Business Documents',
    emoji: '📈',
    description: 'Track milestones, deliverables, blockers, budget status, and next sprint goals.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Project Overview', 'Milestone Status', 'Deliverables Completed', 'Issues & Blockers', 'Next Period Priorities'],
  },
  {
    id: 'project_status_update',
    name: 'Project Status Update',
    category: 'Business Documents',
    emoji: '⏱️',
    description: 'Succinct weekly/bi-weekly snapshot of team velocity and critical paths.',
    recommendedTheme: 'executive-minimal',
    defaultSections: ['Health Snapshot', 'Accomplishments', 'Risks & Mitigations', 'Upcoming Schedule'],
  },
  {
    id: 'action_plan',
    name: 'Action Plan',
    category: 'Business Documents',
    emoji: '🎯',
    description: 'Accountability matrix with tasks, milestones, owners, deadlines, and dependencies.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Objective', 'Phased Roadmap', 'Action Matrix', 'Resource Allocation', 'Review Cadence'],
  },
  {
    id: 'management_briefing',
    name: 'Management Briefing',
    category: 'Business Documents',
    emoji: '📋',
    description: 'Concise executive briefing on urgent issues, opportunities, and required sign-offs.',
    recommendedTheme: 'executive-minimal',
    defaultSections: ['Executive Summary', 'Situation Analysis', 'Options Evaluated', 'Management Recommendation', 'Approval Required'],
  },
  {
    id: 'operational_report',
    name: 'Operational Report',
    category: 'Business Documents',
    emoji: '⚙️',
    description: 'Daily/weekly operational throughput, service levels, incidents, and equipment status.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Operational Highlights', 'Throughput & KPIs', 'Incidents & Resolution', 'Preventative Maintenance'],
  },
  {
    id: 'business_concept_note',
    name: 'Business Concept Note',
    category: 'Business Documents',
    emoji: '💡',
    description: 'Initial concept overview for a new venture, product line, or departmental initiative.',
    recommendedTheme: 'creative-modern',
    defaultSections: ['Concept Overview', 'Problem Statement', 'Target Audience & Market', 'Value Proposition', 'Implementation Roadmap'],
  },

  // 2. Professional Documents (10)
  {
    id: 'technical_report',
    name: 'Technical Report',
    category: 'Professional Documents',
    emoji: '🔬',
    description: 'In-depth engineering or scientific inquiry with methodology and test data.',
    recommendedTheme: 'academic',
    defaultSections: ['Abstract', 'Technical Specifications', 'Methodology & Testing', 'Observed Results', 'Conclusions & Standards'],
  },
  {
    id: 'inspection_summary',
    name: 'Inspection Summary',
    category: 'Professional Documents',
    emoji: '🔍',
    description: 'Structured findings from quality, facility, or asset inspections.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Inspection Parameters', 'Scope of Inspection', 'Observed Deficiencies', 'Corrective Action Register', 'Sign-Off'],
  },
  {
    id: 'site_visit_report',
    name: 'Site Visit Report',
    category: 'Professional Documents',
    emoji: '🏗️',
    description: 'Field visit observations, physical worksite status, and on-site contractor coordination.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Site Details & Weather', 'Work Observed', 'Subcontractor Progress', 'Site Instructions Issued', 'Follow-Up Date'],
  },
  {
    id: 'training_report',
    name: 'Training Report',
    category: 'Professional Documents',
    emoji: '🎓',
    description: 'Employee or client workshop outcomes, attendee attendance, feedback, and certifications.',
    recommendedTheme: 'elegant-green',
    defaultSections: ['Training Details', 'Curriculum Covered', 'Participant Attendance', 'Assessment & Feedback', 'Recommendations'],
  },
  {
    id: 'consultancy_report',
    name: 'Consultancy Report',
    category: 'Professional Documents',
    emoji: '🤝',
    description: 'Advisory findings, root-cause assessment, benchmarking, and transformation strategy.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Engagement Scope', 'Diagnosis & Benchmarking', 'Key Findings', 'Strategic Recommendations', 'Implementation Plan'],
  },
  {
    id: 'client_communication_summary',
    name: 'Client Communication Summary',
    category: 'Professional Documents',
    emoji: '💬',
    description: 'Consolidated briefing of email/call correspondence, agreed scope, and commitments.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Client Background', 'Correspondence Log', 'Agreed Scope Points', 'Pending Clarifications', 'Next Touchpoint'],
  },
  {
    id: 'work_completion_report',
    name: 'Work Completion Report',
    category: 'Professional Documents',
    emoji: '✅',
    description: 'Formal verification that scope of work has been satisfied for invoicing/handover.',
    recommendedTheme: 'executive-minimal',
    defaultSections: ['Project Handover Details', 'Contract Scope Verification', 'Deliverables Completed', 'Punch List Items', 'Client Sign-off'],
  },
  {
    id: 'activity_report',
    name: 'Activity Report',
    category: 'Professional Documents',
    emoji: '🗓️',
    description: 'Summary of individual or departmental activities over a designated period.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Period Covered', 'Core Activities Undertaken', 'Key Achievements', 'Challenges Faced', 'Upcoming Goals'],
  },
  {
    id: 'research_summary',
    name: 'Research Summary',
    category: 'Professional Documents',
    emoji: '📚',
    description: 'Synthesis of literature, survey responses, competitor intel, or field inquiries.',
    recommendedTheme: 'academic',
    defaultSections: ['Executive Summary', 'Hypothesis & Questions', 'Data & Evidence', 'Analysis & Synthesis', 'Implications'],
  },
  {
    id: 'professional_memorandum',
    name: 'Professional Memorandum',
    category: 'Professional Documents',
    emoji: '📜',
    description: 'Formal internal memo for policy directives, inter-departmental notices, or changes.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Memo Header', 'Background & Purpose', 'Policy Directive', 'Operational Impact', 'Contact & Inquiries'],
  },

  // 3. Personal Productivity (10)
  {
    id: 'general_notes',
    name: 'General Notes',
    category: 'Personal Productivity',
    emoji: '🗒️',
    description: 'Clean, beautifully structured notes from random thoughts or scribbles.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Summary', 'Main Points', 'Key Details', 'Thoughts & Ideas', 'Action Items'],
  },
  {
    id: 'organized_todo_list',
    name: 'Organized To-Do List',
    category: 'Personal Productivity',
    emoji: '✔️',
    description: 'Prioritized checklist categorized by urgency, context, and time required.',
    recommendedTheme: 'executive-minimal',
    defaultSections: ['High Priority (Today)', 'Medium Priority (This Week)', 'Low Priority / Backlog', 'Delegated / Follow-Up'],
  },
  {
    id: 'weekly_planner',
    name: 'Weekly Planner',
    category: 'Personal Productivity',
    emoji: '📅',
    description: 'Structured weekly agenda with priorities, daily focus blocks, and review prompts.',
    recommendedTheme: 'elegant-green',
    defaultSections: ['Weekly Focus Goals', 'Monday to Wednesday', 'Thursday to Friday', 'Weekend Priorities', 'Weekly Retrospective'],
  },
  {
    id: 'monthly_planner',
    name: 'Monthly Planner',
    category: 'Personal Productivity',
    emoji: '🗓️',
    description: 'High-level roadmap of 30-day goals, key deadlines, habits, and commitments.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Monthly Vision', 'Critical Deadlines', 'Week-by-Week Milestones', 'Habits & Focus Areas'],
  },
  {
    id: 'personal_action_plan',
    name: 'Personal Action Plan',
    category: 'Personal Productivity',
    emoji: '🚀',
    description: 'Break down personal goals into quantifiable steps and daily habits.',
    recommendedTheme: 'creative-modern',
    defaultSections: ['Goal Statement', 'Milestones & Timeline', 'Daily Habits Required', 'Potential Obstacles', 'Accountability Mechanism'],
  },
  {
    id: 'travel_itinerary',
    name: 'Travel Itinerary',
    category: 'Personal Productivity',
    emoji: '✈️',
    description: 'Day-by-day travel schedule with flight, hotel, meeting, and packing details.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Trip Overview', 'Flight & Transport Details', 'Accommodation', 'Day-by-Day Schedule', 'Emergency Contacts & Notes'],
  },
  {
    id: 'event_plan',
    name: 'Event Plan',
    category: 'Personal Productivity',
    emoji: '🎉',
    description: 'Organize schedule, speakers, vendor coordination, venue setup, and guest checklists.',
    recommendedTheme: 'creative-modern',
    defaultSections: ['Event Brief', 'Venue & Schedule', 'Vendor Coordination', 'Run of Show', 'Budget & Guest Log'],
  },
  {
    id: 'expense_summary',
    name: 'Expense Summary',
    category: 'Personal Productivity',
    emoji: '💳',
    description: 'Itemized breakdown of receipts, purchases, reimbursements, and totals.',
    recommendedTheme: 'executive-minimal',
    defaultSections: ['Expense Period & Total', 'Itemized Breakdown', 'Receipts Log', 'Category Totals', 'Reimbursement Details'],
  },
  {
    id: 'goal_planning_document',
    name: 'Goal Planning Document',
    category: 'Personal Productivity',
    emoji: '🎯',
    description: 'SMART goal architecture with KPIs, lead measures, and review intervals.',
    recommendedTheme: 'elegant-green',
    defaultSections: ['SMART Goal Definition', 'Why It Matters', 'Lead Measures & Actions', 'Progress Tracking', 'Reward & Milestone Celebration'],
  },
  {
    id: 'personal_journal_summary',
    name: 'Personal Journal Summary',
    category: 'Personal Productivity',
    emoji: '📖',
    description: 'Synthesize diary entries, reflections, lessons learned, and mindset shifts.',
    recommendedTheme: 'academic',
    defaultSections: ['Reflections Overview', 'Key Insights & Wins', 'Challenges Encountered', 'Personal Growth Takeaways'],
  },

  // 4. Education & Learning (10)
  {
    id: 'study_notes',
    name: 'Study Notes',
    category: 'Education and Learning',
    emoji: '📖',
    description: 'Structured academic study guide with key definitions, formulas, and concepts.',
    recommendedTheme: 'academic',
    defaultSections: ['Topic Overview', 'Key Concepts & Definitions', 'Core Explanations', 'Formulas / Rules', 'Quick Review Summary'],
  },
  {
    id: 'revision_guide',
    name: 'Revision Guide',
    category: 'Education and Learning',
    emoji: '💡',
    description: 'High-yield exam review sheets with flashcard-style takeaways and mnemonics.',
    recommendedTheme: 'academic',
    defaultSections: ['Exam Focus Areas', 'Must-Know Concepts', 'Common Pitfalls & Mistakes', 'Quick Recall Checklist'],
  },
  {
    id: 'lesson_summary',
    name: 'Lesson Summary',
    category: 'Education and Learning',
    emoji: '👨‍🏫',
    description: 'Single-lecture or chapter summary for students, teachers, or study groups.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Lesson Objectives', 'Main Discussion', 'Examples & Case Points', 'Homework & Assignments'],
  },
  {
    id: 'learning_handout',
    name: 'Learning Handout',
    category: 'Education and Learning',
    emoji: '📄',
    description: 'Printable reference cheat sheet with step-by-step guides and diagrams.',
    recommendedTheme: 'elegant-green',
    defaultSections: ['Quick Reference Guide', 'Step-by-Step Procedure', 'Best Practices', 'FAQ & Troubleshooting'],
  },
  {
    id: 'qa_document',
    name: 'Question & Answer Document',
    category: 'Education and Learning',
    emoji: '❓',
    description: 'FAQ or exam preparation Q&A with clear, structured explanations.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Frequently Asked Questions', 'Conceptual Q&A', 'Case Study Q&A', 'Additional Practice Questions'],
  },
  {
    id: 'assignment_notes',
    name: 'Assignment Notes',
    category: 'Education and Learning',
    emoji: '✍️',
    description: 'Outline research, bibliography, thesis statement, and draft arguments.',
    recommendedTheme: 'academic',
    defaultSections: ['Thesis Statement', 'Main Arguments & Evidence', 'Supporting Research', 'Counter-Arguments', 'Citations & Sources'],
  },
  {
    id: 'training_handout',
    name: 'Training Handout',
    category: 'Education and Learning',
    emoji: '📘',
    description: 'Corporate or workshop participant reference booklet with exercises.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Module Overview', 'Core Framework', 'Practical Exercises', 'Key Takeaways'],
  },
  {
    id: 'educational_summary',
    name: 'Educational Summary',
    category: 'Education and Learning',
    emoji: '🧠',
    description: 'Executive briefing of an academic subject or textbook chapter.',
    recommendedTheme: 'academic',
    defaultSections: ['Subject Background', 'Major Theories & Models', 'Critical Applications', 'Summary of Findings'],
  },
  {
    id: 'reading_notes',
    name: 'Reading Notes',
    category: 'Education and Learning',
    emoji: '📚',
    description: 'Book or article summary with core thesis, favorite quotes, and practical lessons.',
    recommendedTheme: 'academic',
    defaultSections: ['Book / Article Details', 'Core Thesis', 'Chapter Highlights', 'Memorable Quotes', 'Personal Applications'],
  },
  {
    id: 'research_notes',
    name: 'Research Notes',
    category: 'Education and Learning',
    emoji: '🔍',
    description: 'Literature review notes with methodology, source critique, and synthesized findings.',
    recommendedTheme: 'academic',
    defaultSections: ['Research Context', 'Literature Notes', 'Methodological Critique', 'Synthesized Insights'],
  },

  // 5. Career & Employment (6)
  {
    id: 'resume_content',
    name: 'Resume Content',
    category: 'Career and Employment',
    emoji: '👤',
    description: 'Professional CV layout with executive profile, achievements, experience, and skills.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Professional Profile', 'Core Competencies', 'Professional Experience', 'Key Achievements', 'Education & Credentials'],
  },
  {
    id: 'cover_letter',
    name: 'Cover Letter',
    category: 'Career and Employment',
    emoji: '✉️',
    description: 'Compelling letter connecting candidate strengths to job requirements.',
    recommendedTheme: 'executive-minimal',
    defaultSections: ['Applicant & Recipient Details', 'Opening Hook & Motivation', 'Why I Am The Ideal Fit', 'Key Achievements Alignment', 'Call To Action & Sign-off'],
  },
  {
    id: 'job_application_summary',
    name: 'Job Application Summary',
    category: 'Career and Employment',
    emoji: '💼',
    description: 'Track application requirements, tailored bullet points, and company research.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Role & Company Overview', 'Required vs. Demonstrated Skills', 'Custom Interview Talking Points', 'Questions For Interviewer'],
  },
  {
    id: 'interview_preparation',
    name: 'Interview Preparation',
    category: 'Career and Employment',
    emoji: '🎙️',
    description: 'STAR method answers (Situation, Task, Action, Result) for behavioral questions.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Company & Market Research', 'STAR Behavioral Stories', 'Technical & Domain Questions', 'Questions to Ask Panel'],
  },
  {
    id: 'career_development_plan',
    name: 'Career Development Plan',
    category: 'Career and Employment',
    emoji: '🚀',
    description: '1-3 year professional trajectory with skill gaps, certifications, and mentors.',
    recommendedTheme: 'elegant-green',
    defaultSections: ['Current State Assessment', '12-Month Target Role', 'Skill Gaps & Training', 'Networking & Mentorship Plan', 'Milestone Review'],
  },
  {
    id: 'professional_profile',
    name: 'Professional Profile',
    category: 'Career and Employment',
    emoji: '⭐',
    description: 'Executive bio for speaking engagements, advisory boards, or portfolio websites.',
    recommendedTheme: 'executive-minimal',
    defaultSections: ['Short Executive Bio', 'Full Professional Bio', 'Areas of Expertise', 'Notable Projects & Media', 'Contact & Socials'],
  },

  // 6. Creative & Marketing (8)
  {
    id: 'content_plan',
    name: 'Content Plan',
    category: 'Creative and Marketing',
    emoji: '🎨',
    description: 'Multi-channel editorial calendar with pillar topics, formats, and posting cadence.',
    recommendedTheme: 'creative-modern',
    defaultSections: ['Content Strategy & Pillars', 'Monthly Publishing Calendar', 'Channel Distribution', 'Asset Requirements'],
  },
  {
    id: 'social_media_strategy',
    name: 'Social Media Strategy',
    category: 'Creative and Marketing',
    emoji: '📱',
    description: 'Platform tactics, voice guidelines, hashtag matrices, and follower growth goals.',
    recommendedTheme: 'creative-modern',
    defaultSections: ['Audience & Brand Voice', 'Platform Focus (LinkedIn/X/IG)', 'Content Formats & Cadence', 'Growth & Engagement Targets'],
  },
  {
    id: 'campaign_brief',
    name: 'Campaign Brief',
    category: 'Creative and Marketing',
    emoji: '📢',
    description: 'Creative brief detailing target persona, primary hook, deliverables, and budget.',
    recommendedTheme: 'creative-modern',
    defaultSections: ['Campaign Purpose', 'Target Persona & Pain Points', 'Core Message & Creative Hook', 'Deliverables Matrix', 'Budget & Timeline'],
  },
  {
    id: 'article_draft',
    name: 'Article Draft',
    category: 'Creative and Marketing',
    emoji: '📰',
    description: 'Polished blog post or thought leadership article with engaging headers and callouts.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Headline & Hook', 'Introduction', 'Key Arguments & Evidence', 'Practical Applications', 'Conclusion & CTA'],
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'Creative and Marketing',
    emoji: '📧',
    description: 'Engaging email bulletin format with featured story, quick links, and community spotlight.',
    recommendedTheme: 'creative-modern',
    defaultSections: ['Header & Welcome', 'Main Feature Story', 'Industry News & Quick Links', 'Tip of the Week', 'Community Call to Action'],
  },
  {
    id: 'marketing_proposal',
    name: 'Marketing Proposal',
    category: 'Creative and Marketing',
    emoji: '🎯',
    description: 'Pitch marketing campaigns, growth sprints, influencer collabs, or SEO retainers.',
    recommendedTheme: 'modern-professional',
    defaultSections: ['Executive Summary', 'Market Opportunity', 'Proposed Marketing Strategy', 'Campaign Channels & KPIs', 'Investment & Deliverables'],
  },
  {
    id: 'product_description',
    name: 'Product Description',
    category: 'Creative and Marketing',
    emoji: '🛍️',
    description: 'E-commerce or catalog feature sheet with benefits, specifications, and FAQs.',
    recommendedTheme: 'corporate-blue',
    defaultSections: ['Product Headline & Hook', 'Key Features & Benefits', 'Technical Specifications', 'Packaging & Warranty', 'FAQs'],
  },
  {
    id: 'event_promotion_plan',
    name: 'Event Promotion Plan',
    category: 'Creative and Marketing',
    emoji: '🎪',
    description: 'Pre-event, live-event, and post-event promotional schedule and ticketing strategy.',
    recommendedTheme: 'creative-modern',
    defaultSections: ['Event Overview', 'Pre-Event Hype (4 Weeks Out)', 'Ticket Launch Campaign', 'Live-Event Amplification', 'Post-Event Wrap-up'],
  },
];

// Helper to look up template by ID or fuzzy name match
export function getTemplateById(idOrName: string): DocumentTemplateItem {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const found = DOCUMENT_TEMPLATES.find(
    (t) =>
      t.id === idOrName ||
      t.id === normalized ||
      t.name.toLowerCase() === idOrName.toLowerCase()
  );
  return (
    found || {
      id: 'general_professional_document',
      name: 'General Professional Document',
      category: 'Professional Documents',
      emoji: '📄',
      description: 'Polished, well-structured document formatted according to professional standards.',
      recommendedTheme: 'corporate-blue',
      defaultSections: ['Executive Overview', 'Key Details', 'Action Items & Next Steps'],
    }
  );
}

// Sample messy notes for 1-tap testing
export interface SampleNoteScenario {
  id: string;
  title: string;
  category: string;
  emoji: string;
  rawNotes: string;
  expectedTemplateId: string;
}

export const SAMPLE_NOTE_SCENARIOS: SampleNoteScenario[] = [
  {
    id: 'meeting_delay',
    title: 'Messy Meeting Notes (Delays)',
    category: 'Business',
    emoji: '📝',
    expectedTemplateId: 'meeting_minutes',
    rawNotes: `meeting monday client not happy delay material project progress 70 percentage site safety issue three workers need training send updated report next week rajesh procurement follow up vendor steel beams late 2 weeks budget overrun 5k need approval from VP by friday`,
  },
  {
    id: 'whatsapp_chat',
    title: 'WhatsApp Project Update',
    category: 'Project',
    emoji: '💬',
    expectedTemplateId: 'project_progress_report',
    rawNotes: `[10:14 AM] Alex: Hey team quick update for sprint 4. Frontend is 90% done, auth flow done, stripe webhook throwing error 500 on refunds.
[10:17 AM] Priya: We fixed the database index on users table, queries dropped from 400ms to 25ms.
[10:19 AM] Alex: Awesome. Need QA on mobile safari login. Also client wants export to PDF by next sprint demo on Thursday.
[10:22 AM] Rahul: I will handle the stripe webhook bug today. Release scheduled for Friday 5 PM.`,
  },
  {
    id: 'study_notes',
    title: 'Rough Chemistry Study Notes',
    category: 'Education',
    emoji: '🧪',
    expectedTemplateId: 'study_notes',
    rawNotes: `thermodynamics chapter 4 - first law delta U = Q - W. internal energy state function. heat added to system is positive. isothermal process temp constant so delta U = 0, Q = W. adiabatic Q = 0, delta U = -W. remember sign convention: work done by system positive. enthalpy H = U + PV. exothermic delta H negative. endothermic positive. test questions focus on carnot cycle efficiency eta = 1 - Tc/Th.`,
  },
  {
    id: 'expense_list',
    title: 'Scattered Travel Receipts',
    category: 'Personal',
    emoji: '💳',
    expectedTemplateId: 'expense_summary',
    rawNotes: `travel expenses Chicago client meeting Oct 12-14:
uber to airport 48.50
united airlines ticket 340.00
hyatt hotel 2 nights 412.00
team dinner at gibsons steakhouse 185.40 (3 clients attended)
starbucks coffee 14.20
metro day pass 10.00
lunch at airport on return 22.80
total need reimbursement to direct deposit account`,
  },
  {
    id: 'malayalam_notes',
    title: 'Malayalam Rough Notes',
    category: 'Multilingual',
    emoji: '🌴',
    expectedTemplateId: 'meeting_minutes',
    rawNotes: `തിങ്കളാഴ്ച നടന്ന പ്രോജക്ട് മീറ്റിംഗ് ചർച്ചകൾ. പുതിയ വെബ്സൈറ്റ് ലോഞ്ച് അടുത്ത മാസം 15-ന് നടത്താൻ തീരുമാനിച്ചു. ഡിസൈൻ ടീം എല്ലാ പേജുകളും പൂർത്തിയാക്കി. പേയ്മെന്റ് ഗേറ്റ്‌വേ ടെസ്റ്റിംഗ് ബാക്കിയുണ്ട്. സുരേഷ് അടുത്ത ബുധനാഴ്ചയ്ക്കകം ടെസ്റ്റിംഗ് റിപ്പോർട്ട് സമർപ്പിക്കണം. അടുത്ത അവലോകന യോഗം വെള്ളിയാഴ്ച 3 മണിക്ക്.`,
  },
];
