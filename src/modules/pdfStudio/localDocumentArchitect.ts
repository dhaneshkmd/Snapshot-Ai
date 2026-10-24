/**
 * Local Document Architect (Bridged to DynamicDocumentArchitect)
 *
 * Provides seamless local document generation adhering strictly to the principle:
 * THE CONTENT DETERMINES THE DOCUMENT.
 *
 * Completely eliminates hardcoded sections and universal report boilerplate.
 */

import { generateDynamicDocument } from './dynamicDocumentArchitect';
import {
  SmartDocument,
  DocumentLengthMode,
  WritingStyle,
  QuickDocumentMode,
  DocumentMetadata,
} from './documentTypes';

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
  return generateDynamicDocument(params);
}

export { generateDynamicDocument };
