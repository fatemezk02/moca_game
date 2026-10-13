/**
 * Google Apps Script Web App Endpoint for Game-Session Analytics
 *
 * Target Sheet: "game_sessions" in the active spreadsheet.
 *
 * Actions Handlers:
 *   - "visit_gallery" : Records gallery_id in "visited_galleries"
 *   - "answer_puzzle" : Records puzzle_id in "answered_puzzles"
 *   - "answer_star"   : Records star_id in "answered_stars"
 *   - "open_puzzle"   : Records puzzle_id in "opened_puzzles"
 *   - "open_star"     : Records star_id in "opened_stars"
 *   - "start"         : Initializes or resumes session row
 *   - "heartbeat"     : Periodic status & metric backup update
 *   - "end"           : Records end_time & session conclusion
 *
 * Concurrency & Integrity:
 *   - LockService ensures synchronized read-modify-write per script execution
 *   - active_seconds is strictly monotonic (never overwrites with smaller/zero value)
 *   - Array cells are merged as unique lists, never overwritten with empty arrays
 *   - All actions process duration updates (no early return before duration update)
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, status: "alive" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = false;
  try {
    hasLock = lock.tryLock(15000); // Wait up to 15 seconds for lock
    if (!hasLock) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Lock timeout" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Empty request" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    if (!data.action || !data.session_id) {
      throw new Error("Missing action or session_id");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("game_sessions");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Sheet 'game_sessions' not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Column Header Discovery & Management
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
      var newCol = headerRowValues.length + 1;
      sheet.getRange(1, newCol).setValue(colName);
      headerRowValues.push(colName);
      return newCol;
    }

    // 2. Session Row Lookup & Creation
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

    var isNewSession = (targetRow === -1);
    if (isNewSession) {
      targetRow = lastRow + 1;
      sheet.getRange(targetRow, sessionCol).setValue(sessionId);
      if (data.player_id) {
        sheet.getRange(targetRow, getColIndex("player_id")).setValue(data.player_id);
      }
      if (data.timestamp) {
        sheet.getRange(targetRow, getColIndex("start_time")).setValue(data.timestamp);
      }
    }

    // 3. Array Parsing & Safe Merging Helpers
    function parseArray(val) {
      if (val === undefined || val === null || val === "") return [];
      if (Array.isArray(val)) {
        return val.map(function(item) { return String(item).trim(); }).filter(Boolean);
      }
      var s = String(val).trim();
      if (!s || s === "[]") return [];
      try {
        var p = JSON.parse(s);
        if (Array.isArray(p)) {
          return p.map(function(item) { return String(item).trim(); }).filter(Boolean);
        }
      } catch (err) {}
      if (s.indexOf(',') !== -1 || s.indexOf('\n') !== -1) {
        return s.split(/[\n,]+/).map(function(item) {
          return String(item).replace(/[\[\]"']/g, '').trim();
        }).filter(Boolean);
      }
      var clean = s.replace(/[\[\]"']/g, '').trim();
      return clean ? [clean] : [];
    }

    function mergeIntoArrayCell(cell, itemsToAdd) {
      if (!itemsToAdd || !itemsToAdd.length) return;
      var existing = parseArray(cell.getValue());
      var modified = false;
      for (var i = 0; i < itemsToAdd.length; i++) {
        var item = String(itemsToAdd[i]).trim();
        if (item && existing.indexOf(item) === -1) {
          existing.push(item);
          modified = true;
        }
      }
      if (modified || !cell.getValue()) {
        cell.setValue(JSON.stringify(existing));
      }
    }

    // 4. Action-Specific Item Handling
    if (data.action === "visit_gallery") {
      var galleryId = String(data.gallery_id || "").trim();
      if (galleryId) {
        mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("visited_galleries", ["galleries_visited", "visitedgalleries"])), [galleryId]);
        sheet.getRange(targetRow, getColIndex("last_gallery")).setValue(galleryId);
      }
    } else if (data.action === "answer_puzzle") {
      var puzzleId = String(data.puzzle_id || "").trim();
      if (puzzleId) {
        mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("answered_puzzles", ["answered_puzzle_ids", "puzzles_answered", "answeredpuzzles"])), [puzzleId]);
      }
    } else if (data.action === "answer_star") {
      var starId = String(data.star_id || "").trim();
      if (starId) {
        mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("answered_stars", ["answered_star_ids", "stars_answered", "answeredstars"])), [starId]);
      }
    } else if (data.action === "open_puzzle") {
      var openedPuzzleId = String(data.puzzle_id || "").trim();
      if (openedPuzzleId) {
        mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("opened_puzzles", ["opened_puzzle_ids", "puzzles_opened", "openedpuzzles"])), [openedPuzzleId]);
      }
    } else if (data.action === "open_star") {
      var openedStarId = String(data.star_id || "").trim();
      if (openedStarId) {
        mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("opened_stars", ["opened_star_ids", "stars_opened", "openedstars"])), [openedStarId]);
      }
    }

    // 5. Monotonic Duration Update (Never decrease or reset to 0)
    if (data.active_seconds !== undefined && data.active_seconds !== null) {
      var incomingSec = Math.round(Number(data.active_seconds));
      if (!isNaN(incomingSec) && incomingSec >= 0) {
        var activeSecCol = getColIndex("active_seconds", ["duration", "duration_seconds", "session_duration", "activeseconds"]);
        var activeSecCell = sheet.getRange(targetRow, activeSecCol);
        var existingSecVal = activeSecCell.getValue();
        var existingSec = Number(existingSecVal) || 0;
        if (incomingSec > existingSec || (existingSecVal === "" && incomingSec >= 0)) {
          activeSecCell.setValue(incomingSec);
        }
      }
    }

    // 6. Timestamps & Metadata Updates
    if (data.timestamp) {
      sheet.getRange(targetRow, getColIndex("last_seen", ["last_time"])).setValue(data.timestamp);
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

    // 7. Backup Array Merges (Heartbeat / End payloads) - Never replace nonempty with empty
    if (data.visited_galleries && Array.isArray(data.visited_galleries) && data.visited_galleries.length > 0) {
      mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("visited_galleries", ["galleries_visited", "visitedgalleries"])), data.visited_galleries);
    }
    if (data.answered_puzzles && Array.isArray(data.answered_puzzles) && data.answered_puzzles.length > 0) {
      mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("answered_puzzles", ["answered_puzzle_ids", "puzzles_answered", "answeredpuzzles"])), data.answered_puzzles);
    }
    if (data.answered_stars && Array.isArray(data.answered_stars) && data.answered_stars.length > 0) {
      mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("answered_stars", ["answered_star_ids", "stars_answered", "answeredstars"])), data.answered_stars);
    }
    if (data.opened_puzzles && Array.isArray(data.opened_puzzles) && data.opened_puzzles.length > 0) {
      mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("opened_puzzles", ["opened_puzzle_ids", "puzzles_opened", "openedpuzzles"])), data.opened_puzzles);
    }
    if (data.opened_stars && Array.isArray(data.opened_stars) && data.opened_stars.length > 0) {
      mergeIntoArrayCell(sheet.getRange(targetRow, getColIndex("opened_stars", ["opened_star_ids", "stars_opened", "openedstars"])), data.opened_stars);
    }

    SpreadsheetApp.flush();

    var respPayload = {
      ok: true,
      action: data.action,
      session_id: sessionId
    };
    if (data.action === "answer_puzzle") {
      respPayload.stored = String(data.puzzle_id || "").trim();
    } else if (data.action === "answer_star") {
      respPayload.stored = String(data.star_id || "").trim();
    } else if (data.action === "visit_gallery") {
      respPayload.stored = String(data.gallery_id || "").trim();
    }

    return ContentService.createTextOutput(JSON.stringify(respPayload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (hasLock) {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
  }
}
