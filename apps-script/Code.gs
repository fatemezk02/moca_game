/**
 * Google Apps Script Web App Endpoint for Game-Session Analytics
 *
 * Target Sheet: "game_sessions" in the active spreadsheet.
 *
 * Explicit Action Handlers:
 *   - "visit_gallery" : Immediately records gallery_id in "visited_galleries"
 *   - "answer_puzzle" : Immediately records puzzle_id in "answered_puzzles"
 *   - "answer_star"   : Immediately records star_id in "answered_stars"
 *   - "start"         : Initializes session row
 *   - "heartbeat"     : Periodic status & metric backup update
 *   - "end"           : Records end_time & session conclusion
 *
 * All actions update the SAME active session row identified by session_id.
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

    // 9. FIND COLUMNS BY HEADER: Read row 1 and find columns by exact header names
    var lastCol = Math.max(1, sheet.getLastColumn());
    var headerRowValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    function normalizeHeader(name) {
      return (name || "").toString().toLowerCase().replace(/[\s_\-]/g, "");
    }

    function getColIndex(colName, altNames) {
      var targets = [colName].concat(altNames || []);
      for (var t = 0; t < targets.length; t++) {
        var tNorm = normalizeHeader(targets[t]);
        for (var i = 0; i < headerRowValues.length; i++) {
          if (normalizeHeader(headerRowValues[i]) === tNorm) {
            return i + 1;
          }
        }
      }
      var newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue(colName);
      headerRowValues.push(colName);
      return newCol;
    }

    // Locate session_id column and existing session row
    var sessionCol = getColIndex("session_id");
    var sessionId = String(data.session_id).trim();
    var lastRow = sheet.getLastRow();

    var targetRow = -1;
    if (lastRow > 1) {
      var sessionRange = sheet.getRange(2, sessionCol, lastRow - 1, 1).getValues();
      for (var r = sessionRange.length - 1; r >= 0; r--) {
        if (String(sessionRange[r][0]).trim() === sessionId) {
          targetRow = r + 2;
          break;
        }
      }
    }

    // If session row does not exist yet, create it
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

    // Helper: Safely parse cell value into string array (defaults to [] if empty)
    function parseArray(val) {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(function(item) { return String(item).trim(); }).filter(Boolean);
      var s = String(val).trim();
      if (!s || s === "[]") return [];
      try {
        var p = JSON.parse(s);
        if (Array.isArray(p)) {
          return p.map(function(item) { return String(item).trim(); }).filter(Boolean);
        }
        return [s];
      } catch (err) {
        return [s];
      }
    }

    // =========================================================================
    // 6. VISIT_GALLERY SERVER LOGIC
    // =========================================================================
    if (data.action === "visit_gallery") {
      var galleryId = String(data.gallery_id || "").trim();
      if (galleryId) {
        var visitedCol = getColIndex("visited_galleries");
        var visitedCell = sheet.getRange(targetRow, visitedCol);
        var existingVisited = parseArray(visitedCell.getValue());
        if (existingVisited.indexOf(galleryId) === -1) {
          existingVisited.push(galleryId);
        }
        visitedCell.setValue(JSON.stringify(existingVisited));

        var lastGalleryCol = getColIndex("last_gallery");
        sheet.getRange(targetRow, lastGalleryCol).setValue(galleryId);
      }

      if (data.timestamp) {
        var lastSeenCol = getColIndex("last_seen", ["last_time"]);
        sheet.getRange(targetRow, lastSeenCol).setValue(data.timestamp);
      }

      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        action: "visit_gallery",
        stored: galleryId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // 7. ANSWER_PUZZLE SERVER LOGIC
    // =========================================================================
    if (data.action === "answer_puzzle") {
      var puzzleId = String(data.puzzle_id || "").trim();
      if (puzzleId) {
        var puzzlesCol = getColIndex("answered_puzzles");
        var puzzlesCell = sheet.getRange(targetRow, puzzlesCol);
        var existingPuzzles = parseArray(puzzlesCell.getValue());
        if (existingPuzzles.indexOf(puzzleId) === -1) {
          existingPuzzles.push(puzzleId);
        }
        puzzlesCell.setValue(JSON.stringify(existingPuzzles));
      }

      if (data.timestamp) {
        var lastSeenColP = getColIndex("last_seen", ["last_time"]);
        sheet.getRange(targetRow, lastSeenColP).setValue(data.timestamp);
      }

      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        action: "answer_puzzle",
        stored: puzzleId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // 8. ANSWER_STAR SERVER LOGIC
    // =========================================================================
    if (data.action === "answer_star") {
      var starId = String(data.star_id || "").trim();
      if (starId) {
        var starsCol = getColIndex("answered_stars");
        var starsCell = sheet.getRange(targetRow, starsCol);
        var existingStars = parseArray(starsCell.getValue());
        if (existingStars.indexOf(starId) === -1) {
          existingStars.push(starId);
        }
        starsCell.setValue(JSON.stringify(existingStars));
      }

      if (data.timestamp) {
        var lastSeenColS = getColIndex("last_seen", ["last_time"]);
        sheet.getRange(targetRow, lastSeenColS).setValue(data.timestamp);
      }

      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        action: "answer_star",
        stored: starId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // General Session Actions (heartbeat, start, end)
    // 10. DO NOT OVERWRITE LISTS: only merge if array has items, never replace with []
    // =========================================================================
    if (data.timestamp) {
      sheet.getRange(targetRow, getColIndex("last_seen", ["last_time"])).setValue(data.timestamp);
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
    if (data.action === "end" && data.timestamp) {
      sheet.getRange(targetRow, getColIndex("end_time")).setValue(data.timestamp);
    }

    // Merge visited_galleries from backup heartbeat if provided and non-empty
    if (data.visited_galleries && Array.isArray(data.visited_galleries) && data.visited_galleries.length > 0) {
      var vCol = getColIndex("visited_galleries");
      var vCell = sheet.getRange(targetRow, vCol);
      var exV = parseArray(vCell.getValue());
      for (var vi = 0; vi < data.visited_galleries.length; vi++) {
        var gItem = String(data.visited_galleries[vi]).trim();
        if (gItem && exV.indexOf(gItem) === -1) {
          exV.push(gItem);
        }
      }
      vCell.setValue(JSON.stringify(exV));
    }

    // Merge answered_puzzles from backup heartbeat if provided and non-empty
    if (data.answered_puzzles && Array.isArray(data.answered_puzzles) && data.answered_puzzles.length > 0) {
      var apCol = getColIndex("answered_puzzles");
      var apCell = sheet.getRange(targetRow, apCol);
      var exP = parseArray(apCell.getValue());
      for (var pi = 0; pi < data.answered_puzzles.length; pi++) {
        var pItem = String(data.answered_puzzles[pi]).trim();
        if (pItem && exP.indexOf(pItem) === -1) {
          exP.push(pItem);
        }
      }
      apCell.setValue(JSON.stringify(exP));
    }

    // Merge answered_stars from backup heartbeat if provided and non-empty
    if (data.answered_stars && Array.isArray(data.answered_stars) && data.answered_stars.length > 0) {
      var asCol = getColIndex("answered_stars");
      var asCell = sheet.getRange(targetRow, asCol);
      var exS = parseArray(asCell.getValue());
      for (var si = 0; si < data.answered_stars.length; si++) {
        var sItem = String(data.answered_stars[si]).trim();
        if (sItem && exS.indexOf(sItem) === -1) {
          exS.push(sItem);
        }
      }
      asCell.setValue(JSON.stringify(exS));
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true, action: data.action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
