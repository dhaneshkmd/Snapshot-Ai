/**
 * Smart PDF Studio — PDF Exporter
 *
 * Provides:
 * 1. High-fidelity Vector Printable PDF via an isolated iframe print mechanism
 *    (100% vector typography, selectable text, multi-page headers/footers, no rasterization).
 * 2. jsPDF client-side fallback generation.
 */

import { jsPDF } from 'jspdf';
import { SmartDocument, DOCUMENT_THEMES } from './documentTypes';

/**
 * Builds the standalone, self-contained HTML representation of the document
 * styled specifically for A4/Letter multi-page printing and PDF rendering.
 */
export function buildDocumentHtml(doc: SmartDocument): string {
  const theme = DOCUMENT_THEMES[doc.theme] || DOCUMENT_THEMES['corporate-blue'];
  const isLandscape = doc.orientation === 'landscape';
  const pageSize = doc.pageSize === 'Letter' ? 'letter' : 'a4';
  const designProfile = doc.designProfile || {
    layoutStyle: 'standard_editorial',
    density: 'balanced',
    tablePreference: 'minimal',
    headingStyle: 'underlined',
  };

  const sectionsHtml = doc.sections
    .map((sec, secIdx) => {
      const blocksHtml = sec.blocks
        .map((b) => {
          if (b.type === 'paragraph') {
            const calloutClass = b.calloutType
              ? `callout callout-${b.calloutType}`
              : '';
            return `<p class="${calloutClass}">${escapeHtml(b.text)}</p>`;
          }
          if (b.type === 'subheading') {
            return `<h3 class="doc-subheading">${escapeHtml(b.text)}</h3>`;
          }
          if (b.type === 'list') {
            const tag = b.style === 'numbered' ? 'ol' : 'ul';
            const items = b.items
              .map((it) => `<li>${escapeHtml(it)}</li>`)
              .join('');
            return `<${tag} class="doc-list ${b.style}">${items}</${tag}>`;
          }
          if (b.type === 'key_value') {
            const rows = b.pairs
              .map(
                (p) =>
                  `<tr><td class="kv-label">${escapeHtml(p.label)}</td><td class="kv-val">${escapeHtml(p.value)}</td></tr>`
              )
              .join('');
            return `<table class="kv-table">${rows}</table>`;
          }
          if (b.type === 'timeline') {
            const eventsHtml = b.events
              .map(
                (ev) => `
                <div class="timeline-step">
                  <div class="timeline-badge">${escapeHtml(ev.timeOrDay)}</div>
                  <div class="timeline-body">
                    <div class="timeline-title">${escapeHtml(ev.title)}</div>
                    <div class="timeline-desc">${escapeHtml(ev.description)}</div>
                  </div>
                </div>`
              )
              .join('');
            return `<div class="timeline-container">${eventsHtml}</div>`;
          }
          if (b.type === 'callout') {
            return `
              <div class="doc-callout callout-${b.kind}">
                <div class="callout-content">${escapeHtml(b.text)}</div>
                ${b.authorOrSource ? `<div class="callout-attribution">— ${escapeHtml(b.authorOrSource)}</div>` : ''}
              </div>`;
          }
          if (b.type === 'table') {
            const th =
              b.headers && b.headers.length > 0
                ? `<thead><tr>${b.headers
                    .map((h) => `<th>${escapeHtml(h)}</th>`)
                    .join('')}</tr></thead>`
                : '';
            const trs = b.rows
              .map(
                (row) =>
                  `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`
              )
              .join('');
            const captionHtml = b.caption ? `<div class="table-caption">${escapeHtml(b.caption)}</div>` : '';
            return `<div class="table-wrapper">${captionHtml}<table class="data-table">${th}<tbody>${trs}</tbody></table></div>`;
          }
          return '';
        })
        .join('');

      let headingHtml = '';
      if (designProfile.headingStyle === 'numbered') {
        headingHtml = `
          <h2 class="section-title heading-numbered">
            <span class="section-num">${String(secIdx + 1).padStart(2, '0')}</span>
            ${escapeHtml(sec.heading)}
          </h2>`;
      } else if (designProfile.headingStyle === 'pill_badge') {
        headingHtml = `
          <h2 class="section-title heading-pill">
            <span class="pill-tag">${escapeHtml(sec.heading)}</span>
          </h2>`;
      } else if (designProfile.headingStyle === 'minimal') {
        headingHtml = `<h2 class="section-title heading-minimal">${escapeHtml(sec.heading)}</h2>`;
      } else {
        headingHtml = `<h2 class="section-title heading-underlined">${escapeHtml(sec.heading)}</h2>`;
      }

      return `
        <div class="doc-section">
          ${headingHtml}
          <div class="section-body">
            ${blocksHtml}
          </div>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="${doc.language || 'en'}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(doc.title)}</title>
  <style>
    @page {
      size: ${pageSize} ${isLandscape ? 'landscape' : 'portrait'};
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: counter(page);
      }
    }
    *, *:before, *:after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: ${theme.fontFamilyBody};
      color: #0f172a;
      line-height: 1.6;
      font-size: 11pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .doc-container {
      max-width: ${isLandscape ? '260mm' : '185mm'};
      margin: 0 auto;
      padding: 6mm;
    }
    .doc-header-banner {
      border-bottom: 2.5pt solid ${theme.secondaryColor};
      padding-bottom: 12pt;
      margin-bottom: 18pt;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16pt;
    }
    .doc-brand-title {
      flex: 1;
    }
    .doc-category-badge {
      display: inline-block;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${theme.badgeTextColor};
      background: ${theme.badgeBg};
      padding: 3pt 8pt;
      border-radius: 4pt;
      margin-bottom: 6pt;
    }
    h1.doc-main-title {
      font-family: ${theme.fontFamilyHeading};
      font-size: 20pt;
      font-weight: 800;
      color: ${theme.primaryColor};
      margin: 0 0 4pt 0;
      line-height: 1.25;
      letter-spacing: -0.02em;
    }
    .doc-subtitle {
      font-size: 11pt;
      color: #475569;
      margin: 0;
    }
    .doc-meta-sidebar {
      text-align: right;
      font-size: 8.5pt;
      color: #64748b;
      min-width: 50mm;
      border-left: 1pt solid #e2e8f0;
      padding-left: 10pt;
    }
    .meta-row {
      margin-bottom: 3pt;
    }
    .meta-label {
      font-weight: 700;
      color: #334155;
    }
    .doc-summary-card {
      background: #f8fafc;
      border-left: 4pt solid ${theme.secondaryColor};
      padding: 10pt 14pt;
      border-radius: 0 6pt 6pt 0;
      margin-bottom: 20pt;
    }
    .doc-summary-title {
      font-size: 9.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: ${theme.primaryColor};
      margin: 0 0 4pt 0;
      letter-spacing: 0.05em;
    }
    .doc-summary-text {
      margin: 0;
      font-size: 10.5pt;
      color: #334155;
      font-style: italic;
    }
    .doc-section {
      margin-bottom: 18pt;
      page-break-inside: avoid;
    }
    h2.section-title {
      font-family: ${theme.fontFamilyHeading};
      font-size: 13.5pt;
      font-weight: 700;
      color: ${theme.primaryColor};
      border-bottom: 1pt solid ${theme.borderColor};
      padding-bottom: 4pt;
      margin: 16pt 0 10pt 0;
      display: flex;
      align-items: center;
      gap: 6pt;
    }
    .section-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18pt;
      height: 18pt;
      background: ${theme.primaryColor};
      color: #ffffff;
      font-size: 8pt;
      font-weight: 800;
      border-radius: 4pt;
    }
    p {
      margin: 0 0 8pt 0;
      color: #1e293b;
    }
    .callout {
      padding: 8pt 12pt;
      border-radius: 6pt;
      margin: 8pt 0;
      background: #f1f5f9;
      border-left: 3pt solid #64748b;
    }
    .callout-info {
      background: #eff6ff;
      border-left-color: #3b82f6;
    }
    .callout-warning {
      background: #fffbeb;
      border-left-color: #f59e0b;
    }
    .callout-tip {
      background: #ecfdf5;
      border-left-color: #10b981;
    }
    .callout-quote {
      background: #faf5ff;
      border-left-color: #a855f7;
      font-style: italic;
    }
    .heading-minimal {
      border-bottom: none;
      padding-bottom: 0;
    }
    .heading-pill .pill-tag {
      background: ${theme.badgeBg};
      color: ${theme.badgeTextColor};
      padding: 3pt 10pt;
      border-radius: 12pt;
      font-size: 11pt;
    }
    .heading-underlined {
      border-bottom: 2pt solid ${theme.secondaryColor};
      padding-bottom: 4pt;
    }
    .doc-subheading {
      font-family: ${theme.fontFamilyHeading};
      font-size: 11pt;
      font-weight: 700;
      color: ${theme.primaryColor};
      margin: 10pt 0 4pt 0;
    }
    .timeline-container {
      margin: 8pt 0 14pt 4pt;
      border-left: 2pt solid ${theme.borderColor};
      padding-left: 12pt;
    }
    .timeline-step {
      margin-bottom: 10pt;
      position: relative;
    }
    .timeline-badge {
      display: inline-block;
      font-size: 8.5pt;
      font-weight: 800;
      color: ${theme.badgeTextColor};
      background: ${theme.badgeBg};
      padding: 2pt 6pt;
      border-radius: 4pt;
      margin-bottom: 2pt;
    }
    .timeline-title {
      font-weight: 700;
      font-size: 10.5pt;
      color: ${theme.primaryColor};
    }
    .timeline-desc {
      font-size: 10pt;
      color: #334155;
      margin-top: 2pt;
    }
    .doc-callout {
      padding: 9pt 12pt;
      border-radius: 6pt;
      margin: 8pt 0 12pt 0;
      background: #f8fafc;
      border-left: 3.5pt solid ${theme.secondaryColor};
    }
    .callout-content {
      font-size: 10.5pt;
      color: #1e293b;
    }
    .callout-attribution {
      font-size: 9pt;
      color: #64748b;
      font-style: italic;
      margin-top: 4pt;
      text-align: right;
    }
    .callout-warning {
      background: #fffbeb;
      border-left-color: #f59e0b;
    }
    .callout-highlight {
      background: #eff6ff;
      border-left-color: #3b82f6;
    }
    .callout-takeaway {
      background: #f0fdf4;
      border-left-color: #10b981;
    }
    .table-caption {
      font-size: 9pt;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .doc-list {
      margin: 4pt 0 10pt 0;
      padding-left: 18pt;
    }
    .doc-list li {
      margin-bottom: 4pt;
      color: #1e293b;
    }
    .table-wrapper {
      margin: 10pt 0;
      overflow-x: auto;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin: 4pt 0 12pt 0;
      page-break-inside: avoid;
    }
    table.data-table th {
      background: ${theme.tableHeaderBg};
      color: ${theme.tableHeaderTextColor};
      font-weight: 700;
      text-align: left;
      padding: 7pt 10pt;
      border: 1pt solid ${theme.primaryColor};
    }
    table.data-table td {
      padding: 6pt 10pt;
      border: 1pt solid #cbd5e1;
      color: #1e293b;
      vertical-align: top;
    }
    table.data-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    table.kv-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin: 6pt 0 10pt 0;
    }
    table.kv-table td {
      padding: 4pt 6pt;
      border-bottom: 1pt solid #f1f5f9;
    }
    td.kv-label {
      width: 35%;
      font-weight: 700;
      color: ${theme.primaryColor};
    }
    td.kv-val {
      color: #334155;
    }
    .doc-footer {
      margin-top: 24pt;
      padding-top: 8pt;
      border-top: 1pt solid #e2e8f0;
      font-size: 8pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body { background: transparent; }
      .doc-container { padding: 0; max-width: none; }
      .doc-section { page-break-inside: avoid; }
      table.data-table { page-break-inside: auto; }
      table.data-table tr { page-break-inside: avoid; page-break-after: auto; }
      table.data-table thead { display: table-header-group; }
    }
  </style>
</head>
<body>
  <div class="doc-container">
    <!-- Header -->
    <div class="doc-header-banner">
      <div class="doc-brand-title">
        <span class="doc-category-badge">${escapeHtml(doc.documentType || 'Document')}</span>
        <h1 class="doc-main-title">${escapeHtml(doc.title)}</h1>
        ${doc.subtitle ? `<p class="doc-subtitle">${escapeHtml(doc.subtitle)}</p>` : ''}
      </div>
      <div class="doc-meta-sidebar">
        ${doc.metadata.companyName ? `<div class="meta-row"><span class="meta-label">Org:</span> ${escapeHtml(doc.metadata.companyName)}</div>` : ''}
        ${doc.metadata.preparedBy ? `<div class="meta-row"><span class="meta-label">Author:</span> ${escapeHtml(doc.metadata.preparedBy)}</div>` : ''}
        <div class="meta-row"><span class="meta-label">Date:</span> ${escapeHtml(doc.metadata.date || new Date().toISOString().split('T')[0])}</div>
        ${doc.metadata.documentReference ? `<div class="meta-row"><span class="meta-label">Ref:</span> ${escapeHtml(doc.metadata.documentReference)}</div>` : ''}
      </div>
    </div>

    <!-- Executive Summary -->
    ${
      doc.executiveSummary
        ? `
      <div class="doc-summary-card">
        <div class="doc-summary-title">Executive Overview</div>
        <p class="doc-summary-text">${escapeHtml(doc.executiveSummary)}</p>
      </div>`
        : ''
    }

    <!-- Content Sections -->
    ${sectionsHtml}

    <!-- Footer -->
    <div class="doc-footer">
      <span>${escapeHtml(doc.title)} · Generated via SnapAction Smart PDF Studio</span>
      <span>${doc.metadata.confidentialityNotice ? escapeHtml(doc.metadata.confidentialityNotice) : 'Confidential & Proprietary'}</span>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Triggers native high-fidelity vector PDF print/save dialog via a sandboxed iframe.
 */
export function printDocumentAsPdf(doc: SmartDocument): void {
  const html = buildDocumentHtml(doc);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const docFrame = iframe.contentWindow?.document;
  if (!docFrame) {
    alert('Unable to initialize PDF print engine in this browser.');
    return;
  }

  docFrame.open();
  docFrame.write(html);
  docFrame.close();

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Print iframe error', e);
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 60000); // keep for a minute during print dialog
      }
    }, 400);
  };
}

/**
 * Direct jsPDF download fallback that builds an A4 PDF document with text and lines.
 */
export async function downloadVectorPdfDirect(doc: SmartDocument): Promise<void> {
  const isLandscape = doc.orientation === 'landscape';
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: doc.pageSize === 'Letter' ? 'letter' : 'a4',
  });

  const theme = DOCUMENT_THEMES[doc.theme] || DOCUMENT_THEMES['corporate-blue'];
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(theme.primaryColor);
  const titleLines = pdf.splitTextToSize(doc.title, contentWidth);
  pdf.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 8 + 4;

  // Subtitle / Type
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(theme.secondaryColor);
  const metaText = `${doc.documentType.toUpperCase()} | Date: ${doc.metadata.date || new Date().toISOString().split('T')[0]}`;
  pdf.text(metaText, margin, cursorY);
  cursorY += 6;

  // Divider
  pdf.setDrawColor(theme.secondaryColor);
  pdf.setLineWidth(0.6);
  pdf.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Executive Summary
  if (doc.executiveSummary) {
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'F');
    pdf.setFont('helvetica', 'bolditalic');
    pdf.setFontSize(9);
    pdf.setTextColor(theme.primaryColor);
    pdf.text('EXECUTIVE OVERVIEW', margin + 4, cursorY + 6);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(9.5);
    pdf.setTextColor(71, 85, 105);
    const sumLines = pdf.splitTextToSize(doc.executiveSummary, contentWidth - 8);
    pdf.text(sumLines, margin + 4, cursorY + 12);
    cursorY += 28;
  }

  // Iterate sections
  for (const section of doc.sections) {
    if (cursorY > pageHeight - 30) {
      pdf.addPage();
      cursorY = margin;
    }

    // Section title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(theme.primaryColor);
    pdf.text(section.heading, margin, cursorY);
    cursorY += 6;

    // Section line
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 6;

    for (const block of section.blocks) {
      if (cursorY > pageHeight - 25) {
        pdf.addPage();
        cursorY = margin;
      }

      if (block.type === 'paragraph') {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);
        const pLines = pdf.splitTextToSize(block.text, contentWidth);
        pdf.text(pLines, margin, cursorY);
        cursorY += pLines.length * 5 + 4;
      } else if (block.type === 'list') {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);
        for (let i = 0; i < block.items.length; i++) {
          if (cursorY > pageHeight - 20) {
            pdf.addPage();
            cursorY = margin;
          }
          const bullet = block.style === 'numbered' ? `${i + 1}. ` : '• ';
          const iLines = pdf.splitTextToSize(`${bullet}${block.items[i]}`, contentWidth - 6);
          pdf.text(iLines, margin + 4, cursorY);
          cursorY += iLines.length * 5 + 2;
        }
        cursorY += 3;
      } else if (block.type === 'key_value') {
        pdf.setFontSize(9.5);
        for (const pair of block.pairs) {
          if (cursorY > pageHeight - 20) {
            pdf.addPage();
            cursorY = margin;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(theme.primaryColor);
          pdf.text(`${pair.label}: `, margin, cursorY);
          const labelWidth = pdf.getTextWidth(`${pair.label}: `);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(51, 65, 85);
          pdf.text(pair.value, margin + labelWidth + 2, cursorY);
          cursorY += 5.5;
        }
        cursorY += 3;
      } else if (block.type === 'table') {
        // Simple table rendering
        if (cursorY > pageHeight - 35) {
          pdf.addPage();
          cursorY = margin;
        }
        const colCount = Math.max(block.headers.length, block.rows[0]?.length || 1);
        const colWidth = contentWidth / colCount;

        // Header
        pdf.setFillColor(theme.tableHeaderBg);
        pdf.rect(margin, cursorY, contentWidth, 7, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(255, 255, 255);
        block.headers.forEach((h, cIdx) => {
          pdf.text(pdf.splitTextToSize(h, colWidth - 2)[0] || '', margin + cIdx * colWidth + 2, cursorY + 5);
        });
        cursorY += 7;

        // Rows
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(30, 41, 59);
        block.rows.forEach((row, rIdx) => {
          if (cursorY > pageHeight - 20) {
            pdf.addPage();
            cursorY = margin;
          }
          if (rIdx % 2 === 1) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(margin, cursorY, contentWidth, 6, 'F');
          }
          row.forEach((cell, cIdx) => {
            pdf.text(pdf.splitTextToSize(cell, colWidth - 2)[0] || '', margin + cIdx * colWidth + 2, cursorY + 4.5);
          });
          cursorY += 6;
        });
        cursorY += 5;
      }
    }
  }

  const safeFilename = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'document'}.pdf`;
  pdf.save(safeFilename);
}
