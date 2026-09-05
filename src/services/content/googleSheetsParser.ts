/**
 * Robust CSV and Google Sheets Response Parser
 * Handles RFC-4180 CSV specifications, Persian/UTF-8 Unicode text,
 * escaped quotes (""), commas inside quotes, multi-line values, and gviz JSON.
 */

/**
 * Parses raw CSV text into an array of row objects where keys are the header names.
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  if (!csvText || typeof csvText !== 'string') return [];

  // Remove potential UTF-8 BOM
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped double quote ("")
        currentVal += '"';
        i++; // skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Cell boundary
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      // Row boundary
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n in Windows CRLF
      }
      currentRow.push(currentVal.trim());
      currentVal = '';

      // Ignore completely empty rows
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }

  // Final flush
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) {
    // Need at least 1 header row and 1 data row
    return [];
  }

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header) {
        record[header] = row[index] !== undefined ? row[index] : '';
      }
    });
    return record;
  });
}

/**
 * If the user passed a Google Visualization JSON output URL (.../gviz/tq?tqx=out:json),
 * parse the wrapped JSON: `/*O_o* / google.visualization.Query.setResponse({...});`
 */
export function parseGvizJSON(jsonText: string): Record<string, string>[] {
  try {
    const match = jsonText.match(/google\.visualization\.Query\.setResponse\((.*)\);?/s);
    const rawJson = match ? match[1] : jsonText;
    const parsed = JSON.parse(rawJson);

    const cols: string[] = (parsed.table.cols || []).map(
      (col: any, idx: number) => col.label || col.id || `col_${idx}`
    );
    const rows = parsed.table.rows || [];

    return rows.map((r: any) => {
      const record: Record<string, string> = {};
      const cells = r.c || [];
      cols.forEach((colName: string, idx: number) => {
        const cell = cells[idx];
        const val = cell ? (cell.v !== null && cell.v !== undefined ? String(cell.v) : '') : '';
        record[colName] = val;
      });
      return record;
    });
  } catch (err) {
    console.warn('[GoogleSheetsParser] Failed to parse gviz JSON, falling back to CSV parser', err);
    return parseCSV(jsonText);
  }
}

/**
 * Universal sheet response parser: detects whether response is JSON (gviz) or CSV.
 */
export function parseSheetResponse(rawText: string): Record<string, string>[] {
  const trimmed = rawText.trim();
  if (trimmed.startsWith('/*O_o*/') || trimmed.includes('google.visualization.Query.setResponse')) {
    return parseGvizJSON(trimmed);
  }
  return parseCSV(trimmed);
}
