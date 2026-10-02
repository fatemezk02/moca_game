/**
 * Google Apps Script Web App Endpoint for Game-Session Analytics
 *
 * Target Sheet: "game_sessions" in the active spreadsheet.
 * Columns:
 *   - session_id
 *   - player_id
 *   - start_time
 *   - last_time
 *   - active_seconds
 *   - last_gallery
 *   - device
 *   - status
 *   - visited_galleries   (JSON array string, e.g. ["01","02","03"])
 *   - answered_puzzles    (JSON array string, e.g. ["puzzle-01","puzzle-04"])
 *   - answered_stars      (JSON array string, e.g. ["star-02","star-05"])
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Empty request" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    if (!data.action || !data.session_id) {
      throw new Error("Missing action or session_id");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("game_sessions") || ss.getActiveSheet();

    // Read existing headers from row 1
    var lastCol = Math.max(1, sheet.getLastColumn());
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Helper: Map header name to column 1-based index (creates header column if missing)
    function getColIndex(colName) {
      var idx = headers.indexOf(colName);
      if (idx === -1) {
        var newCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, newCol).setValue(colName);
        headers.push(colName);
        return newCol;
      }
      return idx + 1;
    }

    // Helper: Store field as a JSON array string inside one spreadsheet cell
    function toJsonArrayString(val) {
      if (val === undefined || val === null) return "[]";
      if (typeof val === "string") {
        try {
          var parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return val;
          return JSON.stringify([val]);
        } catch (err) {
          return JSON.stringify([val]);
        }
      }
      if (Array.isArray(val)) {
        return JSON.stringify(val);
      }
      return JSON.stringify([val]);
    }

    var sessionId = String(data.session_id).trim();
    var sessionCol = getColIndex("session_id");
    var lastRow = sheet.getLastRow();

    // Search for existing session row (scans backwards from newest)
    var targetRow = -1;
    if (lastRow > 1) {
      var sessionRange = sheet.getRange(2, sessionCol, lastRow - 1, 1).getValues();
      for (var i = sessionRange.length - 1; i >= 0; i--) {
        if (String(sessionRange[i][0]).trim() === sessionId) {
          targetRow = i + 2;
          break;
        }
      }
    }

    // New session row if not found
    if (targetRow === -1) {
      targetRow = lastRow + 1;
      sheet.getRange(targetRow, sessionCol).setValue(sessionId);
      if (data.player_id) {
        sheet.getRange(targetRow, getColIndex("player_id")).setValue(data.player_id);
      }
      if (data.timestamp) {
        sheet.getRange(targetRow, getColIndex("start_time")).setValue(data.timestamp);
      }
    }

    // Update existing or new row metrics
    if (data.timestamp) {
      sheet.getRange(targetRow, getColIndex("last_time")).setValue(data.timestamp);
    }
    if (data.active_seconds !== undefined) {
      sheet.getRange(targetRow, getColIndex("active_seconds")).setValue(data.active_seconds);
    }
    if (data.last_gallery) {
      sheet.getRange(targetRow, getColIndex("last_gallery")).setValue(data.last_gallery);
    }
    if (data.device) {
      sheet.getRange(targetRow, getColIndex("device")).setValue(data.device);
    }
    if (data.action) {
      sheet.getRange(targetRow, getColIndex("status")).setValue(data.action);
    }

    // Write the three additional columns as JSON array strings inside their respective cells
    if (data.visited_galleries !== undefined) {
      sheet.getRange(targetRow, getColIndex("visited_galleries")).setValue(toJsonArrayString(data.visited_galleries));
    }
    if (data.answered_puzzles !== undefined) {
      sheet.getRange(targetRow, getColIndex("answered_puzzles")).setValue(toJsonArrayString(data.answered_puzzles));
    }
    if (data.answered_stars !== undefined) {
      sheet.getRange(targetRow, getColIndex("answered_stars")).setValue(toJsonArrayString(data.answered_stars));
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
