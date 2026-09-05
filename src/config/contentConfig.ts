/**
 * ============================================================================
 * GOOGLE SPREADSHEET & CONTENT SOURCE CONFIGURATION
 * ============================================================================
 * Put your published Google Sheets URLs here.
 *
 * HOW TO PUBLISH YOUR GOOGLE SPREADSHEET:
 * ----------------------------------------------------------------------------
 * 1. Open your Google Spreadsheet containing the 3 tabs:
 *    - Questions
 *    - Stars
 *    - Artworks
 * 2. Click "File" (پرونده) -> "Share" (هم‌رسانی) -> "Publish to web" (انتشار در وب).
 * 3. In the dialog, select the tab (e.g. "Questions") and select "Comma-separated values (.csv)".
 * 4. Click "Publish", then copy the generated link and paste it into the `sheetUrls` below.
 * 5. Repeat for "Stars" and "Artworks".
 *
 * ALTERNATIVE METHOD (Spreadsheet ID):
 * ----------------------------------------------------------------------------
 * If your spreadsheet is shared as "Anyone with the link can view",
 * you can simply provide your SPREADSHEET_ID in `spreadsheetId` below.
 * Example ID from URL: https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
 * ============================================================================
 */

export interface GoogleSheetsSourceConfig {
  /**
   * Published CSV URLs for each tab in the Google Spreadsheet.
   * Paste your published web CSV URLs here.
   */
  sheetUrls: {
    /** Published CSV link for the 'Questions' tab */
    questions: string;
    /** Published CSV link for the 'Stars' tab */
    stars: string;
    /** Published CSV link for the 'Artworks' tab */
    artworks: string;
    /** Published CSV link for the 'Galleries' tab */
    galleries: string;
  };

  /**
   * Optional: If you prefer using your Spreadsheet ID directly instead of 3 URLs.
   * If provided and the URLs above are left empty, the service will automatically
   * construct the Google Sheets export endpoints for each tab.
   */
  spreadsheetId?: string;

  /**
   * Tab names in your Google Spreadsheet (default: Questions, Stars, Artworks, Galleries)
   */
  tabNames?: {
    questions: string;
    stars: string;
    artworks: string;
    galleries: string;
  };

  /**
   * Network request timeout in milliseconds (default: 10000ms = 10s)
   */
  fetchTimeoutMs?: number;
}

export const CONTENT_SOURCE_CONFIG: GoogleSheetsSourceConfig = {
  sheetUrls: {
    // --------------------------------------------------------------------------
    // PASTE YOUR PUBLISHED GOOGLE SHEETS CSV URLS HERE:
    // --------------------------------------------------------------------------
    questions: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjQyAXLl2KypSC936NBgVOJB5CV_7gUKnP_2hhJu4kQSF3Bu_zOP1uJ18VIHTIlniD5G6bzWd8BxDo/pub?gid=0&single=true&output=csv', // e.g. "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv"
    stars: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjQyAXLl2KypSC936NBgVOJB5CV_7gUKnP_2hhJu4kQSF3Bu_zOP1uJ18VIHTIlniD5G6bzWd8BxDo/pub?gid=1089507013&single=true&output=csv',     // e.g. "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=123...&single=true&output=csv"
    artworks: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjQyAXLl2KypSC936NBgVOJB5CV_7gUKnP_2hhJu4kQSF3Bu_zOP1uJ18VIHTIlniD5G6bzWd8BxDo/pub?gid=1588976816&single=true&output=csv',  // e.g. "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=456...&single=true&output=csv"
    galleries: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjQyAXLl2KypSC936NBgVOJB5CV_7gUKnP_2hhJu4kQSF3Bu_zOP1uJ18VIHTIlniD5G6bzWd8BxDo/pub?gid=1983886582&single=true&output=csv', // Published CSV link for the 'Galleries' tab
  },

  // Optional: If you want to use the Spreadsheet ID directly, paste it here:
  spreadsheetId: '', // e.g. "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

  tabNames: {
    questions: 'Questions',
    stars: 'Stars',
    artworks: 'Artworks',
    galleries: 'Galleries',
  },

  fetchTimeoutMs: 10000,
};
