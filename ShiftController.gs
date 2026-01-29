const SHIFT_SHEET_NAME = "Shifts_DB";

function getOrCreateShiftSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHIFT_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHIFT_SHEET_NAME);
    const headers = [
      "Shift ID",
      "Client ID",
      "Caregiver ID",
      "Start Date",
      "End Date",
      "Clock In",
      "Clock Out",
      "Hours",
      "Billing Type",
      "Service Type",
      "Shift Type",
      "Client Rate",
      "Caregiver Rate",
      "Agency Share",
      "Softcare Share",
      "Total Client Price",
      "Total Caregiver Price",
      "Total Agency Price",
      "Total Softcare Price",
      "Notes",
      "Created At",
    ];
    sheet.appendRow(headers);
    sheet
      .getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#f3f4f6");
  }
  return sheet;
}

function getShifts(startDateStr, endDateStr) {
  const sheet = getOrCreateShiftSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Indices
  const dateIdx = headers.indexOf("Start Date");
  const endDateIdx = headers.indexOf("End Date");
  const clientIdx = headers.indexOf("Client ID");
  const cgIdx = headers.indexOf("Caregiver ID");
  const startIdx = headers.indexOf("Clock In");
  const endIdx = headers.indexOf("Clock Out");

  if (dateIdx === -1) return [];
  if (data.length <= 1) return []; // No data rows

  const timeZone =
    SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  end.setHours(23, 59, 59, 999);

  // Filter
  const shifts = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowDateStr = row[dateIdx]; // Assuming string YYYY-MM-DD or Date object

    // Skip empty rows
    if (!rowDateStr || !row[clientIdx] || !row[cgIdx]) continue;

    let rowDate;
    if (rowDateStr instanceof Date) {
      rowDate = new Date(rowDateStr);
    } else {
      const parts = String(rowDateStr).split("-");
      if (parts.length !== 3) continue;
      rowDate = new Date(parts[0], parts[1] - 1, parts[2]);
    }
    rowDate.setHours(0, 0, 0, 0);

    if (rowDate >= start && rowDate <= end) {
      const clockInVal = row[startIdx];
      const clockOutVal = row[endIdx];
      const endDateVal = row[endDateIdx];

      shifts.push({
        id: row[0],
        clientId: row[clientIdx],
        caregiverId: row[cgIdx],
        date: Utilities.formatDate(rowDate, timeZone, "yyyy-MM-dd"),
        endDate:
          endDateVal instanceof Date
            ? Utilities.formatDate(endDateVal, timeZone, "yyyy-MM-dd")
            : String(endDateVal || ""),
        clockIn:
          clockInVal instanceof Date
            ? Utilities.formatDate(clockInVal, timeZone, "HH:mm")
            : String(clockInVal || ""),
        clockOut:
          clockOutVal instanceof Date
            ? Utilities.formatDate(clockOutVal, timeZone, "HH:mm")
            : String(clockOutVal || ""),
        // Add names if possible, but for now IDs are fine, frontend can map them
      });
    }
  }
  return shifts;
}

function saveShift(data) {
  const sheet = getOrCreateShiftSheet();
  const timestamp = new Date();

  // Determine dates to save
  let datesToSave = [];
  // Parse YYYY-MM-DD from input
  // Note: new Date("2023-01-01") is UTC, but we want local usually.
  // But since we just want to increment days, it's fine as long as we are consistent.
  // Better to append T00:00:00 to ensure local time parsing or handle explicitly.
  // However, HTML date input returns YYYY-MM-DD.
  const parts = data.startDate.split("-");
  const startDate = new Date(parts[0], parts[1] - 1, parts[2]);

  if (data.repeat === "none") {
    datesToSave.push(new Date(startDate));
  } else if (data.repeat === "3days") {
    for (let i = 0; i < 3; i++) {
      let d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      datesToSave.push(d);
    }
  } else if (data.repeat === "5days") {
    for (let i = 0; i < 5; i++) {
      let d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      datesToSave.push(d);
    }
  } else if (data.repeat === "week") {
    for (let i = 0; i < 7; i++) {
      let d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      datesToSave.push(d);
    }
  }

  // Save each shift
  datesToSave.forEach((date) => {
    const shiftId = "SH-" + Utilities.getUuid().slice(0, 8).toUpperCase();
    const formattedDate = Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    );

    // Calculate End Date for this specific shift instance
    const startParts = data.startDate.split("-");
    const originalStart = new Date(
      startParts[0],
      startParts[1] - 1,
      startParts[2]
    );

    const endParts = data.endDate.split("-");
    const originalEnd = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    const durationDays = (originalEnd - originalStart) / (1000 * 60 * 60 * 24);

    let thisEndDate = new Date(date);
    thisEndDate.setDate(date.getDate() + durationDays);
    const formattedEndDate = Utilities.formatDate(
      thisEndDate,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    );

    const row = [
      shiftId,
      data.clientId,
      data.caregiverId,
      formattedDate,
      formattedEndDate,
      data.clockIn,
      data.clockOut,
      data.hours,
      data.billingType,
      data.serviceType,
      data.shiftType,
      data.clientRate,
      data.caregiverRate,
      data.agencyShare,
      data.softcareShare,
      data.totalClientPrice,
      data.totalCaregiverPrice,
      data.totalAgencyPrice,
      data.totalSoftcarePrice,
      data.notes,
      timestamp,
    ];
    sheet.appendRow(row);
  });

  return { success: true };
}
