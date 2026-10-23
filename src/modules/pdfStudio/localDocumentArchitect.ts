import {
  SmartDocument,
  DocumentSection,
  DocumentThemeId,
  DocumentLengthMode,
  WritingStyle,
  QuickDocumentMode,
  DocumentMetadata,
  DOCUMENT_TEMPLATES,
  getTemplateById,
} from './documentTypes';

/**
 * Intelligent Local Document Architect
 *
 * Transforms raw messy notes, chat logs, or pasted updates into a beautifully
 * structured SmartDocument completely client-side in under 50ms.
 * Ensures zero-failure guarantee if the backend or upstream AI model is unreachable (404/503/offline).
 */
export function generateLocalFallbackDocument(params: {
  notesText: string;
  hasImage?: boolean;
  requestedType?: string;
  language?: string;
  writingStyle?: WritingStyle;
  quickMode?: QuickDocumentMode;
  lengthMode?: DocumentLengthMode;
  metadata?: Partial<DocumentMetadata>;
}): SmartDocument {
  const {
    notesText = '',
    hasImage = false,
    requestedType,
    language = 'English',
    writingStyle = 'professional',
    quickMode = 'professional_rewrite',
    lengthMode = 'standard',
    metadata = {},
  } = params;

  const rawText = notesText.trim();
  const lower = rawText.toLowerCase();

  // 1. Determine Document Type & Category
  let docType = requestedType || '';
  let category = 'Business Documents';
  let recommendedTheme: DocumentThemeId = 'corporate-blue';

  if (!docType || docType === 'auto' || docType === 'Auto-Detect Most Appropriate') {
    if (lower.includes('meeting') || lower.includes('minutes') || lower.includes('attendee') || lower.includes('discussion')) {
      docType = 'Meeting Minutes';
      category = 'Business Documents';
      recommendedTheme = 'corporate-blue';
    } else if (lower.includes('project') || lower.includes('progress') || lower.includes('delay') || lower.includes('%') || lower.includes('percent')) {
      docType = 'Project Progress Report';
      category = 'Business Documents';
      recommendedTheme = 'corporate-blue';
    } else if (lower.includes('todo') || lower.includes('task') || lower.includes('action item') || lower.includes('follow up') || lower.includes('follow-up')) {
      docType = 'Action Plan';
      category = 'Business Documents';
      recommendedTheme = 'modern-professional';
    } else if (lower.includes('inspect') || lower.includes('safety') || lower.includes('site') || lower.includes('hazard')) {
      docType = 'Site Inspection Summary';
      category = 'Professional Documents';
      recommendedTheme = 'executive-minimal';
    } else if (lower.includes('study') || lower.includes('exam') || lower.includes('chapter') || lower.includes('lecture') || lower.includes('concept')) {
      docType = 'Study Guide';
      category = 'Education and Learning';
      recommendedTheme = 'academic';
    } else if (lower.includes('expense') || lower.includes('cost') || lower.includes('invoice') || lower.includes('receipt') || lower.includes('$') || lower.includes('€') || lower.includes('₹')) {
      docType = 'Expense Summary';
      category = 'Personal Productivity';
      recommendedTheme = 'modern-professional';
    } else if (lower.includes('travel') || lower.includes('flight') || lower.includes('hotel') || lower.includes('trip') || lower.includes('itinerary')) {
      docType = 'Travel Itinerary';
      category = 'Personal Productivity';
      recommendedTheme = 'elegant-green';
    } else if (lower.includes('proposal') || lower.includes('pitch') || lower.includes('client requirement')) {
      docType = 'Business Proposal';
      category = 'Business Documents';
      recommendedTheme = 'creative-modern';
    } else {
      docType = 'General Professional Document';
      category = 'Professional Documents';
      recommendedTheme = 'modern-professional';
    }
  } else {
    // Lookup matched template category if explicit
    const matched = DOCUMENT_TEMPLATES.find((t) => t.name.toLowerCase() === docType.toLowerCase());
    if (matched) {
      category = matched.category;
    }
  }

  // 2. Synthesize Professional Title & Subtitle
  let title = `${docType}`;
  let subtitle = 'Structured Document';

  const firstLine = rawText.split('\n')[0] || '';
  if (firstLine.length > 5 && firstLine.length < 80 && !firstLine.includes(':')) {
    title = capitalizeWords(firstLine.replace(/[#*_-]/g, '').trim());
    subtitle = `${docType} • ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  } else if (docType === 'Meeting Minutes') {
    title = 'Coordination & Operational Review Meeting Minutes';
    subtitle = 'Discussion Summary, Decisions & Action Register';
  } else if (docType === 'Project Progress Report') {
    title = 'Project Progress & Milestone Status Report';
    subtitle = 'Performance Overview, Current Constraints & Path to Completion';
  } else if (docType === 'Action Plan') {
    title = 'Operational Action Plan & Deliverables Register';
    subtitle = 'Task Assignments, Milestones & Accountability Matrix';
  }

  // 3. Extract items, bullets, and tabular candidates from notes
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const bulletPoints: string[] = [];
  const actionItems: { task: string; owner: string; status: string }[] = [];
  const keyValues: { label: string; value: string }[] = [];
  const proseParagraphs: string[] = [];

  // Parse lines for entities
  lines.forEach((line) => {
    // Check for key-value pair
    if (line.includes(':') && line.indexOf(':') < 28) {
      const [k, ...vParts] = line.split(':');
      const val = vParts.join(':').trim();
      if (k.trim().length > 1 && val.length > 0) {
        keyValues.push({ label: k.trim(), value: val });
        return;
      }
    }

    // Check for bullet
    const cleanBullet = line.replace(/^[-*•0-9.)\]]\s*/, '').trim();
    if (cleanBullet.length > 0) {
      bulletPoints.push(cleanBullet);
    }
  });

  // Extract action-like items
  bulletPoints.forEach((bp) => {
    const bpLower = bp.toLowerCase();
    if (
      bpLower.includes('follow up') ||
      bpLower.includes('send') ||
      bpLower.includes('need') ||
      bpLower.includes('action') ||
      bpLower.includes('update') ||
      bpLower.includes('check') ||
      bpLower.includes('prepare') ||
      bpLower.includes('contact') ||
      bpLower.includes('train')
    ) {
      let owner = '[Not specified]';
      if (bpLower.includes('rajesh')) owner = 'Rajesh';
      else if (bpLower.includes('client')) owner = 'Client Team';
      else if (bpLower.includes('vendor')) owner = 'Procurement / Vendor';
      else if (bpLower.includes('worker') || bpLower.includes('team')) owner = 'Site Team';

      let deadline = 'Next Week';
      if (bpLower.includes('monday')) deadline = 'Monday';
      else if (bpLower.includes('tomorrow')) deadline = 'Tomorrow';
      else if (bpLower.includes('urgent') || bpLower.includes('immediately')) deadline = 'Immediate';

      actionItems.push({
        task: capitalizeFirst(bp),
        owner,
        status: deadline,
      });
    } else {
      proseParagraphs.push(bp);
    }
  });

  // Default action item if none were explicitly parsed
  if (actionItems.length === 0 && bulletPoints.length > 0) {
    actionItems.push({
      task: capitalizeFirst(bulletPoints[0]),
      owner: 'Responsible Lead',
      status: 'In Progress',
    });
  }

  // 4. Construct Executive Summary
  let execSummary = '';
  if (rawText.length > 0) {
    const leadSentences = bulletPoints.slice(0, 3).map((s) => capitalizeFirst(s.replace(/\.$/, ''))).join('. ');
    execSummary = `This document organizes and synthesizes key points from the provided source records. Primary focus areas include: ${leadSentences}. All activities are structured for operational tracking and review.`;
  } else if (hasImage) {
    execSummary = 'This document organizes and summarizes information extracted from the provided visual content. Items have been categorized for structured review and actionable execution.';
  } else {
    execSummary = 'This document provides a structured summary of core objectives, identified discussion topics, and designated deliverables.';
  }

  // 5. Build Dynamic Sections
  const sections: DocumentSection[] = [];

  // Section 1: Context & Overview
  sections.push({
    id: 'sec_1',
    heading: '1. Executive Summary & Context',
    blocks: [
      {
        type: 'paragraph',
        id: 'block_exec',
        text: execSummary,
        calloutType: 'info',
      },
      ...(keyValues.length > 0
        ? [
            {
              type: 'key_value' as const,
              id: 'block_kv',
              pairs: keyValues.slice(0, 6),
            },
          ]
        : []),
    ],
  });

  // Section 2: Core Findings & Discussion
  const discussionItems = proseParagraphs.length > 0 ? proseParagraphs : bulletPoints.slice(0, 5);
  sections.push({
    id: 'sec_2',
    heading: '2. Detailed Review & Discussion Points',
    blocks: [
      {
        type: 'paragraph',
        id: 'block_disc_p',
        text:
          discussionItems.length > 0
            ? 'The following items capture core discussion points, observations, and relevant updates noted during the reporting period:'
            : hasImage
            ? 'Source visual document attached. Transcribed notes will appear here once extracted.'
            : 'Core discussion points and operational observations based on provided notes.',
      },
      {
        type: 'list',
        id: 'block_disc_list',
        style: 'bullet',
        items:
          discussionItems.length > 0
            ? discussionItems.map((item) => capitalizeFirst(item))
            : hasImage
            ? ['Visual record attached for processing', 'Review transcribed items or edit notes in the workspace']
            : ['Review provided notes and action items'],
      },
    ],
  });

  // Section 3: Action Items & Responsibilities (Table format)
  if (actionItems.length > 0) {
    sections.push({
      id: 'sec_3',
      heading: '3. Action Items & Deliverables Register',
      blocks: [
        {
          type: 'table',
          id: 'block_action_table',
          caption: 'Designated Tasks, Ownership & Target Deadlines',
          headers: ['Action Item / Deliverable', 'Responsible Owner', 'Target Timeline'],
          rows: actionItems.map((a) => [a.task, a.owner, a.status]),
        },
      ],
    });
  }

  // Section 4: Strategic Recommendations & Next Steps
  sections.push({
    id: 'sec_4',
    heading: '4. Next Steps & Follow-Up Directives',
    blocks: [
      {
        type: 'list',
        id: 'block_next_list',
        style: 'numbered',
        items: [
          'Verify execution of all identified action items with assigned owners.',
          'Schedule follow-up progress review to evaluate timeline commitments.',
          'Distribute finalized copy to relevant stakeholders and record in project archive.',
        ],
      },
    ],
  });

  const docId = `doc_${Date.now()}`;
  const nowIso = new Date().toISOString();

  return {
    id: docId,
    title,
    subtitle,
    documentType: docType,
    category,
    language,
    theme: recommendedTheme,
    pageSize: 'A4',
    orientation: 'portrait',
    lengthMode,
    writingStyle,
    quickMode,
    executiveSummary: execSummary,
    sections,
    metadata: {
      companyName: metadata.companyName || '',
      preparedBy: metadata.preparedBy || 'Prepared with SnapAction AI',
      reviewedBy: metadata.reviewedBy || '',
      documentReference: metadata.documentReference || `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: metadata.date || nowIso.split('T')[0],
      confidentialityNotice: metadata.confidentialityNotice || 'Confidential & Proprietary',
      sourceNoteSummary: rawText.slice(0, 160) || 'Source content summary',
    },
    createdAt: nowIso,
    rawInputSnippet: rawText.slice(0, 300) || '[Visual Content / Screenshot Upload]',
  };
}

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
