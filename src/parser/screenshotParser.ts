/**
 * Screenshot Parser Module (Inspired by MarkItDown, optimized for screenshots)
 * Transforms any screenshot image into AI-friendly structured data, clean Markdown,
 * extracted entities, and local action recommendations with ZERO Gemini API calls.
 */

import { preprocessScreenshot } from './imagePreprocessor';
import { activeOCRProvider, OCRResult } from './ocrProvider';
import { extractEntities, ExtractedEntities } from './entityExtractor';
import { classifyScreenshot, ClassificationResult } from './localClassifier';
import { AnalysisResult } from '../types';

export interface ParsedScreenshotResult extends AnalysisResult {
  rawText: string;
  cleanMarkdown: string;
  structuredJson: Record<string, any>;
  confidence: number;
  extractedEntities: ExtractedEntities;
  ocrConfidence: number;
}

export class ScreenshotParser {
  /**
   * Main entrypoint: parses screenshot locally using image preprocessing,
   * modular OCR, deterministic entity extraction, and local classification.
   */
  static async parse(imageSource: string | File | Blob): Promise<ParsedScreenshotResult> {
    // Step 1: Preprocess image (resize, contrast enhancement for OCR)
    const preprocessed = await preprocessScreenshot(imageSource);

    // Step 2: Extract text using modular local OCR provider (Tesseract.js / native)
    let ocrResult: OCRResult;
    try {
      ocrResult = await activeOCRProvider.extractText(preprocessed.ocrDataUrl);
    } catch (e) {
      console.warn('OCR execution failed, using empty text fallback:', e);
      ocrResult = { text: '', confidence: 0, lines: [] };
    }

    const rawText = ocrResult.text || '';

    // Step 3: Extract structured entities deterministically
    const entities = extractEntities(rawText);

    // Step 4: Classify screenshot using rule-based classification engine
    const classification: ClassificationResult = classifyScreenshot(rawText, entities);

    // Step 5: Generate Clean Markdown representation
    const cleanMarkdown = ScreenshotParser.generateMarkdown(classification, entities, rawText);

    // Step 6: Generate Structured JSON data
    const structuredJson = ScreenshotParser.generateStructuredJson(classification, entities, rawText);

    // Step 7: Return unified AnalysisResult compatible with existing UI
    return {
      contentType: classification.category,
      detectedIntent: classification.detectedIntent,
      title: classification.title,
      summary: classification.summary,
      entities: entities.rawEntityList.slice(0, 6),
      magicAction: classification.magicAction,
      suggestedActions: classification.suggestedActions,
      moreActions: classification.moreActions,
      // Parser specific properties:
      rawText,
      cleanMarkdown,
      structuredJson,
      confidence: classification.confidence,
      extractedEntities: entities,
      ocrConfidence: ocrResult.confidence,
    };
  }

  /**
   * Generates readable, pristine Markdown from extracted screenshot elements
   */
  private static generateMarkdown(
    classification: ClassificationResult,
    entities: ExtractedEntities,
    rawText: string
  ): string {
    const lines: string[] = [];
    lines.push(`# ${classification.title}`);
    lines.push(`*Category: ${classification.category} (Confidence: ${Math.round(classification.confidence * 100)}%)*`);
    lines.push('');

    if (classification.summary) {
      lines.push(`> ${classification.summary}`);
      lines.push('');
    }

    // Structured Entities
    if (entities.rawEntityList.length > 0) {
      lines.push('### Key Details');
      entities.rawEntityList.forEach((e) => {
        lines.push(`- **${e.label}:** ${e.value}`);
      });
      lines.push('');
    }

    // Raw Extracted Content
    if (rawText.trim().length > 0) {
      lines.push('### Extracted Content');
      lines.push('```text');
      lines.push(rawText.trim());
      lines.push('```');
    }

    return lines.join('\n');
  }

  /**
   * Generates schema-friendly structured JSON
   */
  private static generateStructuredJson(
    classification: ClassificationResult,
    entities: ExtractedEntities,
    rawText: string
  ): Record<string, any> {
    return {
      type: classification.category.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      confidence: classification.confidence,
      title: classification.title,
      summary: classification.summary,
      entities: {
        emails: entities.emails,
        urls: entities.urls,
        phones: entities.phones,
        dates: entities.dates,
        times: entities.times,
        prices: entities.prices,
        percentages: entities.percentages,
        tickers: entities.tickers,
        orderNumbers: entities.orderNumbers,
        locations: entities.locations,
        deadlines: entities.deadlines,
      },
      rawText,
    };
  }
}
