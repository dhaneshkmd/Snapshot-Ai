/**
 * Smart PDF Studio — DOCX Exporter
 *
 * Generates true, editable Microsoft Word (.docx) files using the 'docx' library.
 * Preserves native paragraphs, headings, bullet/numbered lists, tables, and themes.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  convertInchesToTwip,
  ShadingType,
} from 'docx';
import { SmartDocument, DOCUMENT_THEMES } from './documentTypes';

export async function exportDocumentToDocx(doc: SmartDocument): Promise<Blob> {
  const theme = DOCUMENT_THEMES[doc.theme] || DOCUMENT_THEMES['corporate-blue'];

  // Clean hex colors without # for docx
  const primaryHex = theme.primaryColor.replace('#', '');
  const secondaryHex = theme.secondaryColor.replace('#', '');
  const borderHex = 'CBD5E1';
  const headerBgHex = theme.tableHeaderBg.replace('#', '');

  const docChildren: (Paragraph | Table)[] = [];

  // 1. Document Title
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: doc.title,
          bold: true,
          size: 40, // 20pt
          color: primaryHex,
          font: 'Arial',
        }),
      ],
    })
  );

  // Subtitle / Type & Date Metadata
  if (doc.subtitle || doc.documentType) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: `${doc.documentType.toUpperCase()}  |  ${doc.metadata.date || new Date().toISOString().split('T')[0]}`,
            bold: true,
            size: 20, // 10pt
            color: secondaryHex,
            font: 'Arial',
          }),
        ],
      })
    );
  }

  // Document Metadata Box (Prepared by, Company, Reference)
  if (
    doc.metadata.companyName ||
    doc.metadata.preparedBy ||
    doc.metadata.documentReference
  ) {
    const metaRuns: TextRun[] = [];
    if (doc.metadata.companyName) {
      metaRuns.push(
        new TextRun({ text: 'Organization: ', bold: true, size: 18, font: 'Arial' }),
        new TextRun({ text: `${doc.metadata.companyName}   `, size: 18, font: 'Arial' })
      );
    }
    if (doc.metadata.preparedBy) {
      metaRuns.push(
        new TextRun({ text: 'Prepared By: ', bold: true, size: 18, font: 'Arial' }),
        new TextRun({ text: `${doc.metadata.preparedBy}   `, size: 18, font: 'Arial' })
      );
    }
    if (doc.metadata.documentReference) {
      metaRuns.push(
        new TextRun({ text: 'Ref: ', bold: true, size: 18, font: 'Arial' }),
        new TextRun({ text: `${doc.metadata.documentReference}   `, size: 18, font: 'Arial' })
      );
    }

    docChildren.push(
      new Paragraph({
        spacing: { after: 280 },
        children: metaRuns,
      })
    );
  }

  // 2. Executive Summary (if present)
  if (doc.executiveSummary) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: 'Executive Summary',
            bold: true,
            size: 26, // 13pt
            color: primaryHex,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: doc.executiveSummary,
            italics: true,
            size: 22,
            font: 'Arial',
          }),
        ],
      })
    );
  }

  // 3. Sections & Content Blocks
  for (const section of doc.sections) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 140 },
        children: [
          new TextRun({
            text: section.heading,
            bold: true,
            size: 30, // 15pt
            color: primaryHex,
            font: 'Arial',
          }),
        ],
      })
    );

    for (const block of section.blocks) {
      if (block.type === 'paragraph') {
        docChildren.push(
          new Paragraph({
            spacing: { after: 140, line: 280 },
            children: [
              new TextRun({
                text: block.text,
                size: 22, // 11pt
                font: 'Arial',
                italics: block.calloutType === 'quote',
              }),
            ],
          })
        );
      } else if (block.type === 'list') {
        for (let idx = 0; idx < block.items.length; idx++) {
          const item = block.items[idx];
          const bulletPrefix = block.style === 'numbered' ? `${idx + 1}. ` : '• ';
          docChildren.push(
            new Paragraph({
              spacing: { after: 80 },
              indent: { left: convertInchesToTwip(0.25) },
              children: [
                new TextRun({
                  text: bulletPrefix,
                  bold: true,
                  color: secondaryHex,
                  font: 'Arial',
                }),
                new TextRun({
                  text: item,
                  size: 22,
                  font: 'Arial',
                }),
              ],
            })
          );
        }
      } else if (block.type === 'key_value') {
        for (const pair of block.pairs) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: `${pair.label}: `,
                  bold: true,
                  size: 22,
                  color: primaryHex,
                  font: 'Arial',
                }),
                new TextRun({
                  text: pair.value,
                  size: 22,
                  font: 'Arial',
                }),
              ],
            })
          );
        }
      } else if (block.type === 'table') {
        const tableRows: TableRow[] = [];

        // Header Row
        if (block.headers && block.headers.length > 0) {
          tableRows.push(
            new TableRow({
              tableHeader: true,
              children: block.headers.map(
                (h) =>
                  new TableCell({
                    shading: {
                      type: ShadingType.CLEAR,
                      fill: headerBgHex,
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 80, after: 80 },
                        children: [
                          new TextRun({
                            text: h,
                            bold: true,
                            size: 20,
                            color: 'FFFFFF',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            })
          );
        }

        // Data Rows
        for (let r = 0; r < block.rows.length; r++) {
          const rowData = block.rows[r];
          tableRows.push(
            new TableRow({
              children: rowData.map(
                (cell) =>
                  new TableCell({
                    shading: {
                      type: ShadingType.CLEAR,
                      fill: r % 2 === 1 ? 'F8FAFC' : 'FFFFFF',
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 80, after: 80 },
                        children: [
                          new TextRun({
                            text: cell,
                            size: 20,
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            })
          );
        }

        docChildren.push(
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: tableRows,
          })
        );

        // Gap after table
        docChildren.push(
          new Paragraph({
            spacing: { after: 180 },
          })
        );
      }
    }
  }

  // Footer / Confidentiality notice
  if (doc.metadata.confidentialityNotice) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 400 },
        children: [
          new TextRun({
            text: `CONFIDENTIALITY NOTICE: ${doc.metadata.confidentialityNotice}`,
            italics: true,
            size: 16,
            color: '64748B',
            font: 'Arial',
          }),
        ],
      })
    );
  }

  const docx = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(docx);
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
