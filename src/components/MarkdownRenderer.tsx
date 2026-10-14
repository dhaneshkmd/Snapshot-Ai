import React from 'react';
import { Table, Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

/**
 * Checks if a block of lines constitutes a Markdown table
 */
function parseMarkdownTable(lines: string[]): { table: TableData; remainingLines: string[] } | null {
  if (lines.length < 2) return null;

  const headerLine = lines[0].trim();
  const separatorLine = lines[1].trim();

  // Check if header and separator have pipes
  if (!headerLine.includes('|') || !separatorLine.includes('|')) return null;

  // Check separator pattern like | --- | --- | or --- | ---
  const isSeparator = /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(separatorLine);
  if (!isSeparator) return null;

  const splitCells = (line: string) => {
    let cleaned = line.trim();
    if (cleaned.startsWith('|')) cleaned = cleaned.substring(1);
    if (cleaned.endsWith('|')) cleaned = cleaned.substring(0, cleaned.length - 1);
    return cleaned.split('|').map((c) => c.trim());
  };

  const headers = splitCells(headerLine);
  const rows: string[][] = [];

  let i = 2;
  while (i < lines.length && lines[i].trim().includes('|')) {
    const rowCells = splitCells(lines[i]);
    // Pad cells if row has fewer cells than headers
    while (rowCells.length < headers.length) {
      rowCells.push('');
    }
    rows.push(rowCells.slice(0, headers.length));
    i++;
  }

  return {
    table: { headers, rows },
    remainingLines: lines.slice(i),
  };
}

/**
 * Checks if a block of lines constitutes a CSV table
 */
function parseCsvTable(lines: string[]): { table: TableData; remainingLines: string[] } | null {
  if (lines.length < 2) return null;

  // Basic CSV heuristic: first 2 lines have commas and same number of fields
  const firstLine = lines[0].trim();
  if (!firstLine.includes(',') || firstLine.startsWith('#')) return null;

  const splitCsv = (line: string) => {
    // Regex for CSV split handling quotes
    const matches = line.match(/(?:[^\s",]+|"[^"]*")+/g);
    if (!matches) return line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    return matches.map((m) => m.trim().replace(/^"|"$/g, ''));
  };

  const headers = splitCsv(firstLine);
  if (headers.length < 2) return null;

  const rows: string[][] = [];
  let i = 1;
  while (i < lines.length && lines[i].trim().length > 0 && lines[i].includes(',')) {
    const row = splitCsv(lines[i]);
    if (Math.abs(row.length - headers.length) <= 1) {
      while (row.length < headers.length) row.push('');
      rows.push(row.slice(0, headers.length));
      i++;
    } else {
      break;
    }
  }

  if (rows.length === 0) return null;

  return {
    table: { headers, rows },
    remainingLines: lines.slice(i),
  };
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedTableIdx, setCopiedTableIdx] = React.useState<number | null>(null);

  if (!content) return null;

  const copyTableAsCsv = (table: TableData, idx: number) => {
    const csvContent = [
      table.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...table.rows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    navigator.clipboard.writeText(csvContent);
    setCopiedTableIdx(idx);
    setTimeout(() => setCopiedTableIdx(null), 2000);
  };

  // Parse blocks
  const rawLines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let cursor = 0;
  let tableCounter = 0;

  while (cursor < rawLines.length) {
    const remaining = rawLines.slice(cursor);
    const line = rawLines[cursor].trim();

    // Check for Markdown table
    const mdTableResult = parseMarkdownTable(remaining);
    if (mdTableResult) {
      const { table, remainingLines } = mdTableResult;
      const currentTableIdx = tableCounter++;

      blocks.push(
        <div key={`table-block-${cursor}`} className="my-3 space-y-2">
          {/* Table Toolbar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Table className="w-3.5 h-3.5 text-blue-500" />
              Structured Table ({table.rows.length} rows)
            </span>
            <button
              onClick={() => copyTableAsCsv(table, currentTableIdx)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {copiedTableIdx === currentTableIdx ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  Copied CSV
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy as CSV
                </>
              )}
            </button>
          </div>

          {/* Responsive Styled Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold">
                  {table.headers.map((header, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] border-r border-slate-200/60 dark:border-slate-700/60 last:border-r-0 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/20"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 leading-relaxed font-normal"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      cursor = rawLines.length - remainingLines.length;
      continue;
    }

    // Check for CSV block
    const csvTableResult = parseCsvTable(remaining);
    if (csvTableResult && line.includes(',')) {
      const { table, remainingLines } = csvTableResult;
      const currentTableIdx = tableCounter++;

      blocks.push(
        <div key={`csv-table-${cursor}`} className="my-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Table className="w-3.5 h-3.5 text-blue-500" />
              CSV Data Table ({table.rows.length} rows)
            </span>
            <button
              onClick={() => copyTableAsCsv(table, currentTableIdx)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {copiedTableIdx === currentTableIdx ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  Copied CSV
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy CSV
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold">
                  {table.headers.map((header, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] border-r border-slate-200/60 dark:border-slate-700/60 last:border-r-0 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/20"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 leading-relaxed font-normal"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      cursor = rawLines.length - remainingLines.length;
      continue;
    }

    // Standard markdown elements (Headings, bullet points, blockquotes, plain text)
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={cursor} className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1">
          {line.replace(/^#\s+/, '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={cursor} className="text-base font-bold text-slate-900 dark:text-white mt-2.5 mb-1">
          {line.replace(/^##\s+/, '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={cursor} className="text-sm font-bold text-slate-900 dark:text-white mt-2 mb-0.5">
          {line.replace(/^###\s+/, '')}
        </h3>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push(
        <li key={cursor} className="ml-4 list-disc text-sm text-slate-800 dark:text-slate-200 my-0.5">
          {line.replace(/^[-*]\s+/, '')}
        </li>
      );
    } else if (line.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={cursor}
          className="border-l-3 border-blue-500 pl-3 my-1.5 italic text-sm text-slate-600 dark:text-slate-400"
        >
          {line.replace(/^>\s+/, '')}
        </blockquote>
      );
    } else if (line.length === 0) {
      blocks.push(<div key={cursor} className="h-1.5" />);
    } else {
      blocks.push(
        <p key={cursor} className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          {line}
        </p>
      );
    }

    cursor++;
  }

  return <div className="space-y-1">{blocks}</div>;
};
