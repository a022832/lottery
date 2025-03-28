/*
===================================================================
🚀 Integrity6 Bus Lottery System - Google Apps Script | Version 1.9.7
===================================================================

📝 Provided as a courtesy by Integrity6 to our customers.
⚠️ No support or maintenance is provided. Use at your own discretion.

📜 License: Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 (CC BY-NC-ND 4.0)
✅ You may use, share, and distribute this script freely.
✅ You must credit Integrity6 by name and website (www.integrity6.com).
❌ You may NOT use this script for commercial purposes (no selling or profiting).
❌ You may NOT modify, alter, or create derivative works based on this script.
❌ You may NOT remove this notice or claim ownership of this script.

🔗 License Details: https://creativecommons.org/licenses/by-nc-nd/4.0/

📅 Version: 1.9.7 | 📆 Release Date: March 2025 | 📌 Last Updated: March 2025
🚀 Updates:
   - Version 1.9.7: Removed debug logging from 1.9.6b for production readiness.
   - Version 1.9.6: Ensured all applicants processed in Mode 2, added logging for unprocessed.
   - Version 1.9.5: Fixed syntax error in getLotteryData().
   - Version 1.9.4: Fixed sibling mapping, full processing in Mode 2.

© 2025 Integrity6. All Rights Reserved.
===================================================================
*/
function getLotteryData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("import file");
  var targetSheet = ss.getSheetByName("lottery data");
  var weightSheet = ss.getSheetByName("weight table");

  if (!sourceSheet || !targetSheet || !weightSheet) {
    Logger.log("Missing sheets: import file, lottery data, or weight table.");
    return;
  }

  var lastRow = sourceSheet.getLastRow();
  if (lastRow < 6) {
    Logger.log("No data found in 'import file'.");
    return;
  }

  var columnRanges = [
    sourceSheet.getRange(6, 2, lastRow - 5, 1).getValues(), // B
    sourceSheet.getRange(6, 3, lastRow - 5, 1).getValues(), // C
    sourceSheet.getRange(6, 4, lastRow - 5, 1).getValues(), // D
    sourceSheet.getRange(6, 5, lastRow - 5, 1).getValues(), // E
    sourceSheet.getRange(6, 11, lastRow - 5, 1).getValues(), // K
    sourceSheet.getRange(6, 12, lastRow - 5, 1).getValues(), // L
    sourceSheet.getRange(6, 28, lastRow - 5, 1).getValues()  // AB
  ];
  var filteredData = columnRanges[0].map((_, i) => columnRanges.map(col => col[i][0]));

  var weightData = weightSheet.getDataRange().getValues();
  var weightRanges = buildWeightRanges(weightData);

  var outputData = filteredData.map((row, index) => {
    var firstName = row[0] || "";
    var lastName = row[1] || "";
    var milesRaw = row[4];
    var miles = parseFloat(String(milesRaw).trim()) || 0;

    var uniqueID = generateUniqueID();
    var combinedNameWithID = `${firstName} ${lastName} (ID:${uniqueID})`;
    var weight = getWeightForMilesFromRanges(weightRanges, miles);

    var newRow = [...row];
    newRow.splice(5, 0, weight);
    newRow.push(combinedNameWithID);
    return newRow;
  });

  var totalBusSeats = outputData.reduce((sum, row) => {
    var seats = parseInt(row[6]) || 0;
    return sum + seats;
  }, 0);

  var lastRowTarget = targetSheet.getLastRow();
  if (lastRowTarget > 5) {
    targetSheet.getRange(6, 1, lastRowTarget - 5, 26).clearContent();
  }
  if (outputData.length > 0) {
    targetSheet.getRange(6, 1, outputData.length, outputData[0].length).setValues(outputData);
  }

  targetSheet.getRange("G3").setValue(totalBusSeats);
  Logger.log("Lottery data updated! Total seats requested: " + totalBusSeats);
}

function generateUniqueID() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var id = "";
  for (var i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function buildWeightRanges(weightData) {
  var weightRanges = [];
  for (var i = 1; i < weightData.length; i++) {
    var rangeText = weightData[i][0];
    var weight = weightData[i][1];
    if (!rangeText || !weight) continue;

    var [minDistance, maxDistance] = rangeText.split("-").map(val => parseFloat(val.trim()));
    if (isNaN(minDistance) || isNaN(maxDistance)) continue;

    weightRanges.push({ min: minDistance, max: maxDistance, weight: weight });
  }
  return weightRanges;
}

function getWeightForMilesFromRanges(weightRanges, miles) {
  if (!miles || isNaN(miles)) return "";
  for (var i = 0; i < weightRanges.length; i++) {
    var range = weightRanges[i];
    if (miles >= range.min && miles <= range.max) {
      return range.weight;
    }
  }
  return "";
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function runLottery() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("lottery data");
  var resultsSheet = ss.getSheetByName("Lottery Results");
  var privateSheet = ss.getSheetByName("Private Results") || ss.insertSheet("Private Results");
  var setupSheet = ss.getSheetByName("Setup");

  if (!dataSheet || !resultsSheet || !setupSheet) {
    Logger.log("Missing sheets: lottery data, Lottery Results, or Setup.");
    return;
  }

  resultsSheet.getRange("F2").setValue("Clearing previous lottery...");
  SpreadsheetApp.flush();
  var lastRowResults = resultsSheet.getLastRow();
  if (lastRowResults >= 6) {
    resultsSheet.getRange(6, 1, lastRowResults - 5, resultsSheet.getLastColumn()).clearContent();
  }

  var totalSeats = parseInt(setupSheet.getRange("F6").getValue()) || 0;
  if (totalSeats <= 0) {
    Logger.log("Invalid seats in Setup F6: " + setupSheet.getRange("F6").getValue());
    return;
  }

  var fullRequestValue = setupSheet.getRange("F7").getValue().toString().trim().toLowerCase();
  var fullRequestRequired = fullRequestValue === "yes";
  
  var lotteryMode = parseInt(setupSheet.getRange("F8").getValue()) || 1;
  Logger.log("Lottery Mode set to: " + lotteryMode);

  var lastRow = dataSheet.getLastRow();
  if (lastRow < 6) {
    Logger.log("No data found in 'lottery data'.");
    return;
  }
  var dataRange = dataSheet.getRange(6, 1, lastRow - 5, dataSheet.getLastColumn()).getValues();
  Logger.log("Raw data from 'lottery data' (first 5 rows): " + JSON.stringify(dataRange.slice(0, 5)));
  Logger.log("Total rows retrieved: " + dataRange.length);

  var siblingApplicants = [];
  var regularApplicants = [];
  var allApplicants = [];
  var totalSiblingWeight = 0;
  var totalRegularWeight = 0;
  var totalWeight = 0;

  for (var i = 0; i < dataRange.length; i++) {
    var row = dataRange[i];
    var firstName = row[0] || "";               // A: First Name
    var lastName = row[1] || "";                // B: Last Name
    var email1 = row[2] || "";                  // C: Email 1
    var email2 = row[3] || "";                  // D: Email 2
    var weight = parseInt(row[5]) || 0;         // F: Weight
    var seatsRequested = parseInt(row[6]) || 0; // G: Seats Requested
    var siblingPref = row[7] && row[7].toString().toLowerCase() === "yes" ? 1 : 0; // H: Sibling Preference
    var combinedNameWithID = row[8] || `${firstName} ${lastName} (ID:${generateUniqueID()})`; // I: Combined Name with ID

    if (!combinedNameWithID || seatsRequested <= 0 || weight <= 0) {
      Logger.log(`Skipping row ${i + 6}: Invalid data - Name: ${combinedNameWithID}, Seats: ${seatsRequested}, Weight: ${weight}`);
      continue;
    }

    var applicant = {
      name: combinedNameWithID,
      sibling: siblingPref,
      seatsNeeded: seatsRequested,
      email1: email1,
      email2: email2,
      weight: weight
    };

    if (lotteryMode === 1) {
      if (applicant.sibling === 1) {
        siblingApplicants.push(applicant);
        totalSiblingWeight += weight;
      } else {
        regularApplicants.push(applicant);
        totalRegularWeight += weight;
      }
    } else { // Mode 2
      allApplicants.push(applicant);
      totalWeight += weight;
    }
  }

  Logger.log("Sibling applicants: " + siblingApplicants.length + ", Regular applicants: " + regularApplicants.length + ", All applicants: " + allApplicants.length);

  if ((lotteryMode === 1 && siblingApplicants.length === 0 && regularApplicants.length === 0) ||
      (lotteryMode === 2 && allApplicants.length === 0)) {
    Logger.log("No valid applicants found after processing.");
    return;
  }

  if (lotteryMode === 1) {
    siblingApplicants = shuffleArray(siblingApplicants);
    regularApplicants = shuffleArray(regularApplicants);
  } else {
    allApplicants = shuffleArray(allApplicants);
  }

  var awardedSeats = 0;
  var waitlistNum = 1;
  var results = [];
  var privateResults = [];
  var processedApplicants = new Set();
  var totalApplicants = lotteryMode === 1 ? (siblingApplicants.length + regularApplicants.length) : allApplicants.length;
  var processedCount = 0;

  function pickWeighted(applicants, totalWeight) {
    if (applicants.length === 0) return null;
    var r = Math.random() * totalWeight;
    var cumulative = 0;
    for (var i = 0; i < applicants.length; i++) {
      cumulative += applicants[i].weight;
      if (r <= cumulative) {
        var picked = applicants.splice(i, 1)[0];
        totalWeight -= picked.weight;
        return { applicant: picked, newTotalWeight: totalWeight };
      }
    }
    Logger.log("Warning: No applicant picked in pickWeighted despite applicants remaining.");
    return null;
  }

  if (lotteryMode === 1) {
    while (siblingApplicants.length > 0 && awardedSeats < totalSeats) {
      var pick = pickWeighted(siblingApplicants, totalSiblingWeight);
      if (!pick) break;
      var applicant = pick.applicant;
      totalSiblingWeight = pick.newTotalWeight;

      if (processedApplicants.has(applicant.name)) continue;

      var seatsAvailable = totalSeats - awardedSeats;
      var seatsToAward = applicant.seatsNeeded;

      if (fullRequestRequired) {
        if (seatsToAward <= seatsAvailable) {
          awardedSeats += seatsToAward;
          results.push([applicant.name, "Awarded", "", seatsToAward, applicant.email1, applicant.email2]);
          privateResults.push([
            formatName(applicant.name),
            "Awarded",
            "",
            seatsToAward,
            applicant.email1 ? formatEmail(applicant.email1) : "",
            applicant.email2 ? formatEmail(applicant.email2) : ""
          ]);
        } else {
          results.push([applicant.name, "Waitlist", waitlistNum, seatsToAward, applicant.email1, applicant.email2]);
          privateResults.push([
            formatName(applicant.name),
            "Waitlist",
            waitlistNum,
            seatsToAward,
            applicant.email1 ? formatEmail(applicant.email1) : "",
            applicant.email2 ? formatEmail(applicant.email2) : ""
          ]);
          waitlistNum += seatsToAward;
        }
      } else {
        seatsToAward = Math.min(seatsToAward, seatsAvailable);
        awardedSeats += seatsToAward;
        results.push([applicant.name, "Awarded", "", seatsToAward, applicant.email1, applicant.email2]);
        privateResults.push([
          formatName(applicant.name),
          "Awarded",
          "",
          seatsToAward,
          applicant.email1 ? formatEmail(applicant.email1) : "",
          applicant.email2 ? formatEmail(applicant.email2) : ""
        ]);
        if (applicant.seatsNeeded > seatsToAward) {
          var seatsWaitlisted = applicant.seatsNeeded - seatsToAward;
          results.push([applicant.name, "Waitlist", waitlistNum, seatsWaitlisted, applicant.email1, applicant.email2]);
          privateResults.push([
            formatName(applicant.name),
            "Waitlist",
            waitlistNum,
            seatsWaitlisted,
            applicant.email1 ? formatEmail(applicant.email1) : "",
            applicant.email2 ? formatEmail(applicant.email2) : ""
          ]);
          waitlistNum += seatsWaitlisted;
        }
      }
      processedApplicants.add(applicant.name);
      processedCount++;
      if (processedCount % 10 === 0) {
        resultsSheet.getRange("F2").setValue(`Processed ${processedCount} of ${totalApplicants} applicants`);
        resultsSheet.getRange("F3").setValue(`Total Records Processed: ${processedCount}`);
        SpreadsheetApp.flush();
      }
    }

    while (regularApplicants.length > 0 && awardedSeats < totalSeats) {
      var pick = pickWeighted(regularApplicants, totalRegularWeight);
      if (!pick) break;
      var applicant = pick.applicant;
      totalRegularWeight = pick.newTotalWeight;

      if (processedApplicants.has(applicant.name)) continue;

      var seatsAvailable = totalSeats - awardedSeats;
      var seatsToAward = applicant.seatsNeeded;

      if (fullRequestRequired) {
        if (seatsToAward <= seatsAvailable) {
          awardedSeats += seatsToAward;
          results.push([applicant.name, "Awarded", "", seatsToAward, applicant.email1, applicant.email2]);
          privateResults.push([
            formatName(applicant.name),
            "Awarded",
            "",
            seatsToAward,
            applicant.email1 ? formatEmail(applicant.email1) : "",
            applicant.email2 ? formatEmail(applicant.email2) : ""
          ]);
        } else {
          results.push([applicant.name, "Waitlist", waitlistNum, seatsToAward, applicant.email1, applicant.email2]);
          privateResults.push([
            formatName(applicant.name),
            "Waitlist",
            waitlistNum,
            seatsToAward,
            applicant.email1 ? formatEmail(applicant.email1) : "",
            applicant.email2 ? formatEmail(applicant.email2) : ""
          ]);
          waitlistNum += seatsToAward;
        }
      } else {
        seatsToAward = Math.min(seatsToAward, seatsAvailable);
        awardedSeats += seatsToAward;
        results.push([applicant.name, "Awarded", "", seatsToAward, applicant.email1, applicant.email2]);
        privateResults.push([
          formatName(applicant.name),
          "Awarded",
          "",
          seatsToAward,
          applicant.email1 ? formatEmail(applicant.email1) : "",
          applicant.email2 ? formatEmail(applicant.email2) : ""
        ]);
        if (applicant.seatsNeeded > seatsToAward) {
          var seatsWaitlisted = applicant.seatsNeeded - seatsToAward;
          results.push([applicant.name, "Waitlist", waitlistNum, seatsWaitlisted, applicant.email1, applicant.email2]);
          privateResults.push([
            formatName(applicant.name),
            "Waitlist",
            waitlistNum,
            seatsWaitlisted,
            applicant.email1 ? formatEmail(applicant.email1) : "",
            applicant.email2 ? formatEmail(applicant.email2) : ""
          ]);
          waitlistNum += seatsWaitlisted;
        }
      }
      processedApplicants.add(applicant.name);
      processedCount++;
      if (processedCount % 10 === 0) {
        resultsSheet.getRange("F2").setValue(`Processed ${processedCount} of ${totalApplicants} applicants`);
        resultsSheet.getRange("F3").setValue(`Total Records Processed: ${processedCount}`);
        SpreadsheetApp.flush();
      }
    }
  } else { // Mode 2
    while (allApplicants.length > 0) {
      var pick = pickWeighted(allApplicants, totalWeight);
      if (!pick) {
        Logger.log("No pick returned, remaining applicants: " + allApplicants.length);
        break;
      }
      var applicant = pick.applicant;
      totalWeight = pick.newTotalWeight;

      if (processedApplicants.has(applicant.name)) {
        Logger.log(`Duplicate applicant skipped: ${applicant.name}`);
        continue;
      }

      var seatsAvailable = totalSeats - awardedSeats;
      var seatsToAward = applicant.seatsNeeded;

      if (applicant.sibling === 1) {
        if (seatsToAward <= seatsAvailable) {
          awardedSeats += seatsToAward;
          results.push([applicant.name, "Awarded", "", seatsToAward, applicant.email1, applicant.email2]);
          privateResults.push([
            formatName(applicant.name),
            "Awarded",
            "",
            seatsToAward,
            applicant.email1 ? formatEmail(applicant.email1) : "",
            applicant.email2 ? formatEmail(applicant.email2) : ""
          ]);
        } else {
          results.push([applicant.name, "Waitlist", waitlistNum, seatsToAward, applicant.email1, applicant.email2]);
          privateResults.push([
            formatName(applicant.name),
            "Waitlist",
            waitlistNum,
            seatsToAward,
            applicant.email1 ? formatEmail(applicant.email1) : "",
            applicant.email2 ? formatEmail(applicant.email2) : ""
          ]);
          waitlistNum += seatsToAward;
        }
      } else {
        if (fullRequestRequired) {
          if (seatsToAward <= seatsAvailable) {
            awardedSeats += seatsToAward;
            results.push([applicant.name, "Awarded", "", seatsToAward, applicant.email1, applicant.email2]);
            privateResults.push([
              formatName(applicant.name),
              "Awarded",
              "",
              seatsToAward,
              applicant.email1 ? formatEmail(applicant.email1) : "",
              applicant.email2 ? formatEmail(applicant.email2) : ""
            ]);
          } else {
            results.push([applicant.name, "Waitlist", waitlistNum, seatsToAward, applicant.email1, applicant.email2]);
            privateResults.push([
              formatName(applicant.name),
              "Waitlist",
              waitlistNum,
              seatsToAward,
              applicant.email1 ? formatEmail(applicant.email1) : "",
              applicant.email2 ? formatEmail(applicant.email2) : ""
            ]);
            waitlistNum += seatsToAward;
          }
        } else {
          seatsToAward = Math.min(seatsToAward, seatsAvailable);
          if (seatsToAward > 0) {
            awardedSeats += seatsToAward;
            results.push([applicant.name, "Awarded", "", seatsToAward, applicant.email1, applicant.email2]);
            privateResults.push([
              formatName(applicant.name),
              "Awarded",
              "",
              seatsToAward,
              applicant.email1 ? formatEmail(applicant.email1) : "",
              applicant.email2 ? formatEmail(applicant.email2) : ""
            ]);
          }
          if (applicant.seatsNeeded > seatsToAward) {
            var seatsWaitlisted = applicant.seatsNeeded - seatsToAward;
            results.push([applicant.name, "Waitlist", waitlistNum, seatsWaitlisted, applicant.email1, applicant.email2]);
            privateResults.push([
              formatName(applicant.name),
              "Waitlist",
              waitlistNum,
              seatsWaitlisted,
              applicant.email1 ? formatEmail(applicant.email1) : "",
              applicant.email2 ? formatEmail(applicant.email2) : ""
            ]);
            waitlistNum += seatsWaitlisted;
          }
        }
      }
      processedApplicants.add(applicant.name);
      processedCount++;
      if (processedCount % 10 === 0) {
        resultsSheet.getRange("F2").setValue(`Processed ${processedCount} of ${totalApplicants} applicants`);
        resultsSheet.getRange("F3").setValue(`Total Records Processed: ${processedCount}`);
        SpreadsheetApp.flush();
      }
    }

    if (allApplicants.length > 0) {
      Logger.log("Unprocessed applicants remaining: " + allApplicants.length);
      allApplicants.forEach((applicant, index) => {
        Logger.log(`Unprocessed applicant ${index + 1}: ${applicant.name}`);
      });
    }
  }

  var allRemaining = lotteryMode === 1 ? [...siblingApplicants, ...regularApplicants] : allApplicants;
  for (var i = 0; i < allRemaining.length; i++) {
    var applicant = allRemaining[i];
    if (!processedApplicants.has(applicant.name)) {
      results.push([applicant.name, "Waitlist", waitlistNum, applicant.seatsNeeded, applicant.email1, applicant.email2]);
      privateResults.push([
        formatName(applicant.name),
        "Waitlist",
        waitlistNum,
        applicant.seatsNeeded,
        applicant.email1 ? formatEmail(applicant.email1) : "",
        applicant.email2 ? formatEmail(applicant.email2) : ""
      ]);
      waitlistNum += applicant.seatsNeeded;
      processedApplicants.add(applicant.name);
      processedCount++;
      if (processedCount % 10 === 0) {
        resultsSheet.getRange("F2").setValue(`Processed ${processedCount} of ${totalApplicants} applicants`);
        resultsSheet.getRange("F3").setValue(`Total Records Processed: ${processedCount}`);
        SpreadsheetApp.flush();
      }
    }
  }

  resultsSheet.getRange("F2").setValue("Sorting and writing results...");
  resultsSheet.getRange("F3").setValue(`Total Records Processed: ${processedCount}`);
  SpreadsheetApp.flush();

  privateResults.sort((a, b) => a[0].localeCompare(b[0]));
  results.sort((a, b) => (a[1] === "Awarded" && b[1] === "Waitlist") ? -1 : (a[1] === "Waitlist" && b[1] === "Awarded") ? 1 : 0);

  resultsSheet.getRange("A6:Z").clearContent();
  if (results.length > 0) {
    resultsSheet.getRange(6, 1, results.length, results[0].length).setValues(results);
  }

  privateSheet.getRange("A6:Z").clearContent();
  if (privateResults.length > 0) {
    privateSheet.getRange(6, 1, privateResults.length, privateResults[0].length).setValues(privateResults);
  }

  resultsSheet.getRange("F2").setValue("Lottery complete! Total awarded: " + awardedSeats);
  resultsSheet.getRange("F3").setValue(`Total Records Processed: ${processedCount}`);
  SpreadsheetApp.flush();

  Logger.log("Lottery completed! Awarded: " + awardedSeats + ", Waitlisted: " + (waitlistNum - 1));
}

function formatName(name) {
  var match = name.match(/(\w+)\s+(\w+)\s+\(ID:(\w+)\)/);
  if (!match) return name;
  var firstName = match[1];
  var lastName = match[2];
  var id = match[3];
  return (firstName[0] + lastName.slice(0, 3)).toUpperCase() + " (ID:" + id + ")";
}

function formatEmail(email) {
  var [local, domain] = email.split("@");
  var localMasked = local[0] + "*".repeat(local.length - 2) + local.slice(-1);
  var domainMasked = domain[0] + "*".repeat(domain.length - 1);
  return localMasked + "@" + domainMasked;
}

function cleanUpSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsToClean = ["lottery data", "Lottery Results", "Private Results"];
  Logger.log("Starting cleanup of sheets.");

  sheetsToClean.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log("Sheet not found: " + sheetName);
      return;
    }

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var startRow = 6;
    if (lastRow >= startRow) {
      var rowsToClear = lastRow - (startRow - 1);
      sheet.getRange(startRow, 1, rowsToClear, lastCol).clearContent();
    }

    if (sheetName === "Lottery Results") {
      sheet.getRange("F2").clearContent();
      sheet.getRange("F3").setValue("");
    }
  });

  Logger.log("Cleanup complete! Data removed from A6 downward and progress indicators cleared.");
}

function cleanUpImportFile() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Import File");
  Logger.log("Starting cleanup of Import File.");

  if (!sheet) {
    Logger.log("Sheet not found: Import File");
    return;
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var startRow = 6;
  if (lastRow >= startRow) {
    var rowsToClear = lastRow - (startRow - 1);
    sheet.getRange(startRow, 1, rowsToClear, lastCol).clearContent();
  }

  Logger.log("Cleanup complete! Data removed from A6 downward in 'Import File'.");
}
