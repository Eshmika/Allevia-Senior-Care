const SHIFT_SHEET_NAME = "Shifts_DB";
const SHIFT_HISTORY_SETTING_KEY = "SHIFT_HISTORY_PAY_PERIOD_MODE";

const SHIFT_HISTORY_COLUMNS = [
  "Shift ID",
  "Invoice ID",
  "Invoice Status",
  "Pay Period Type",
  "Pay Period Start",
  "Pay Period End",
  "Segment Number",
  "Error Flag",
  "System Check",
  "Client ID",
  "Caregiver ID",
  "EVV",
  "Start Date",
  "End Date",
  "Clock In",
  "Clock Out",
  "Hours",
  "In Method",
  "Out Method",
  "Billable Hours",
  "Payable Hours",
  "Billing Type",
  "Service Type",
  "Shift Type",
  "Authorization Code",
  "Client Rate",
  "Caregiver Rate",
  "Softcare Share",
  "Agency Share",
  "Mileage KM",
  "Mileage Price",
  "Confirmation Indicator",
  "Invoice Total",
  "Schedule Note",
  "Admin Note",
  "CG Shift Status",
  "Client Shift Status",
  "System Shift Status",
  "Created By",
  "Created At",
  "Last Modified By",
  "Last Modified At",
];

function ensureShiftSheetHeaders(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missingHeaders = SHIFT_HISTORY_COLUMNS.filter(
    (header) => !headers.includes(header),
  );

  if (missingHeaders.length > 0) {
    const startCol = sheet.getLastColumn() + 1;
    sheet
      .getRange(1, startCol, 1, missingHeaders.length)
      .setValues([missingHeaders]);
    sheet
      .getRange(1, startCol, 1, missingHeaders.length)
      .setFontWeight("bold")
      .setBackground("#f3f4f6");
  }
}

function getShiftHistoryPayPeriodSetting() {
  const properties = PropertiesService.getScriptProperties();
  const savedMode = properties.getProperty(SHIFT_HISTORY_SETTING_KEY);
  return savedMode === "Weekly" ? "Weekly" : "Biweekly";
}

function saveShiftHistoryPayPeriodSetting(mode) {
  const normalized = String(mode || "").trim();
  if (!["Weekly", "Biweekly"].includes(normalized)) {
    throw new Error("Invalid pay period mode");
  }

  PropertiesService.getScriptProperties().setProperty(
    SHIFT_HISTORY_SETTING_KEY,
    normalized,
  );

  return { payPeriodMode: normalized };
}

function getShiftHistorySettings() {
  return { payPeriodMode: getShiftHistoryPayPeriodSetting() };
}

function getCurrentBiweeklyPeriod(anchorDate) {
  return getShiftHistoryPeriod(anchorDate, "Biweekly");
}

function parseShiftDate(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return new Date(dateValue);

  const text = String(dateValue).trim();
  if (!text) return null;

  const parts = text.split("-");
  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function formatShiftDate(dateValue, timeZone) {
  if (!dateValue) return "";
  if (dateValue instanceof Date) {
    return Utilities.formatDate(dateValue, timeZone, "yyyy-MM-dd");
  }
  return String(dateValue);
}

function formatShiftTime(dateValue, timeZone) {
  if (!dateValue) return "";
  if (dateValue instanceof Date) {
    return Utilities.formatDate(dateValue, timeZone, "HH:mm");
  }
  return String(dateValue);
}

function parseTo24HourTime(timeStr) {
  if (!timeStr) return "";
  const match = String(timeStr)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|am|pm)?$/);
  if (!match) return String(timeStr);

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm) {
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }

  return hours.toString().padStart(2, "0") + ":" + minutes;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(dateValue) {
  if (!(dateValue instanceof Date)) return "";
  return `${dateValue.getFullYear()}-${pad2(dateValue.getMonth() + 1)}-${pad2(
    dateValue.getDate(),
  )}`;
}

function startOfWeekSunday(dateValue) {
  const start = new Date(dateValue);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function getShiftHistoryPeriod(anchorDate, payPeriodMode) {
  const normalizedAnchor =
    anchorDate instanceof Date ? new Date(anchorDate) : new Date();
  normalizedAnchor.setHours(0, 0, 0, 0);

  let periodStart;
  const periodLengthDays = payPeriodMode === "Biweekly" ? 14 : 7;

  if (payPeriodMode === "Biweekly") {
    // Anchor to April 5, 2026 (Sunday)
    const baseAnchor = new Date(2026, 3, 5); // Month is 0-indexed: 3 = April
    baseAnchor.setHours(0, 0, 0, 0);

    // Calculate difference in days safely without daylight saving timezone shifts
    // by using Math.floor after shifting the time correctly or Math.round
    const diffTime = normalizedAnchor.getTime() - baseAnchor.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const cycles = Math.floor(diffDays / 14);
    periodStart = new Date(baseAnchor);
    periodStart.setDate(periodStart.getDate() + cycles * 14);
  } else {
    periodStart = startOfWeekSunday(normalizedAnchor);
  }

  const periodEnd = new Date(periodStart);
  // Subtract 1 because 14 days length is inclusive of start day, so +13 stops at 11:59pm on 14th day.
  // The user specifically mentioned "Apr 5–18" -> April 5 + 13 = April 18.
  if (payPeriodMode === "Biweekly") {
    periodEnd.setDate(periodStart.getDate() + 13);
  } else {
    periodEnd.setDate(periodStart.getDate() + periodLengthDays - 1);
  }

  periodEnd.setHours(23, 59, 59, 999);

  return {
    start: periodStart,
    end: periodEnd,
    label: `${Utilities.formatDate(
      periodStart,
      Session.getScriptTimeZone(),
      "MMM d, yyyy",
    )} - ${Utilities.formatDate(
      periodEnd,
      Session.getScriptTimeZone(),
      "MMM d, yyyy",
    )}`,
  };
}

function buildInvoiceId(periodStart, periodEnd) {
  const tz = Session.getScriptTimeZone();
  const yearStr = periodStart
    ? Utilities.formatDate(periodStart, tz, "yyyy")
    : String(new Date().getFullYear());
  const random6 = Math.floor(100000 + Math.random() * 900000);
  return `#${yearStr}-${random6}`;
}

function isShiftApprovedForInvoice(row) {
  const systemStatus = String(row.systemShiftStatus || "")
    .trim()
    .toLowerCase();
  const confirmation = String(row.confirmationIndicator || "")
    .trim()
    .toLowerCase();

  return (
    systemStatus === "approved" ||
    systemStatus === "confirm" ||
    systemStatus === "confirmed" ||
    confirmation === "confirmed" ||
    confirmation === "approved"
  );
}

function buildSystemCheckLabel(shiftRow) {
  const issues = [];
  if (!shiftRow.clockIn) issues.push("Missing Clock-In");
  if (!shiftRow.clockOut) issues.push("Missing Clock-Out");
  if (
    shiftRow.clockIn &&
    shiftRow.clockOut &&
    shiftRow.clockIn === shiftRow.clockOut
  ) {
    issues.push("Invalid Time Range");
  }
  if (shiftRow.segmentNumber > 1) issues.push("Overnight Split");
  return issues.length > 0 ? issues.join(", ") : "OK";
}

function buildShiftHistoryRows(
  rawShifts,
  clientMap,
  caregiverMap,
  settings,
  filters,
) {
  const timeZone = Session.getScriptTimeZone();
  const searchTerm = String(filters.search || "")
    .trim()
    .toLowerCase();
  const selectedClientId = String(filters.clientId || "all");
  const selectedCaregiverId = String(filters.caregiverId || "all");
  const selectedSystemCheck = String(filters.systemCheck || "all");

  const filterCurrentPeriod = getShiftHistoryPeriod(
    new Date(),
    settings.payPeriodMode,
  );

  let filterPeriod;
  if (filters.startDate && filters.endDate) {
    const start = new Date(`${filters.startDate}T00:00:00`);
    const end = new Date(`${filters.endDate}T23:59:59`);
    filterPeriod = {
      start: start,
      end: end,
    };
  } else if (filters.startDate) {
    const start = new Date(`${filters.startDate}T00:00:00`);
    filterPeriod = getShiftHistoryPeriod(start, settings.payPeriodMode);
  } else {
    filterPeriod = filterCurrentPeriod;
  }

  const rows = [];

  rawShifts.forEach((shift) => {
    const originalStartDate = parseShiftDate(shift.date);
    const originalEndDate = parseShiftDate(shift.endDate || shift.date);
    if (!originalStartDate) return;

    const startParts = String(shift.clockIn || "00:00").split(":");
    const endParts = String(shift.clockOut || "00:00").split(":");
    const startTime = new Date(originalStartDate);
    startTime.setHours(
      Number(startParts[0]) || 0,
      Number(startParts[1]) || 0,
      0,
      0,
    );
    let endTime = new Date(originalEndDate || originalStartDate);
    endTime.setHours(Number(endParts[0]) || 0, Number(endParts[1]) || 0, 0, 0);
    if (endTime <= startTime) {
      endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
    }

    const segments = [];
    let segmentStart = new Date(startTime);
    let segmentNumber = 1;

    while (segmentStart < endTime) {
      const boundary = new Date(segmentStart);
      boundary.setHours(24, 0, 0, 0);
      const segmentEnd = endTime < boundary ? new Date(endTime) : boundary;

      segments.push({
        segmentNumber,
        segmentStart: new Date(segmentStart),
        segmentEnd: new Date(segmentEnd),
      });

      segmentStart = new Date(segmentEnd);
      segmentNumber += 1;
    }

    segments.forEach((segment) => {
      const segmentDateKey = toDateKey(segment.segmentStart);
      const periodStartKey = toDateKey(filterPeriod.start);
      const periodEndKey = toDateKey(filterPeriod.end);

      if (
        segment.segmentStart < filterPeriod.start ||
        segment.segmentStart > filterPeriod.end
      ) {
        return;
      }

      const client = clientMap[shift.clientId] || {
        name: "Unknown Client",
        type: "",
      };
      const caregiver = caregiverMap[shift.caregiverId] || {
        name: "Unknown Caregiver",
      };
      const hours = Math.max(
        0,
        (segment.segmentEnd - segment.segmentStart) / (1000 * 60 * 60),
      );

      // Prorate pricing amounts for the specific segment hours
      const cRate = Number(shift.clientRate) || 0;
      const cgRate = Number(shift.caregiverRate) || 0;
      const isFixed = String(shift.billingType || "").toLowerCase() === "fixed";

      let segClient = 0;
      let segCaregiver = 0;
      let segAgency = 0;
      let segSoftcare = 0;

      if (isFixed) {
        // If fixed rate, divide evenly across segments or use full price for segment 1
        const totalDurationHours = Math.max(
          0.01,
          (endTime - startTime) / (1000 * 60 * 60),
        );
        const fraction = hours / totalDurationHours;
        segClient = (Number(shift.totalClientPrice) || 0) * fraction;
        segCaregiver = (Number(shift.totalCaregiverPrice) || 0) * fraction;
        segAgency = (Number(shift.totalAgencyPrice) || 0) * fraction;
        segSoftcare = (Number(shift.totalSoftcarePrice) || 0) * fraction;
      } else {
        // Hourly rate billing
        segClient = cRate * hours;
        segCaregiver = cgRate * hours;
        const margin = Math.max(0, cRate - cgRate);
        segAgency = margin * 0.8 * hours;
        segSoftcare = margin * 0.2 * hours;
      }

      const invoiceTotal = segClient.toFixed(2);
      const systemCheck = buildSystemCheckLabel({
        clockIn: shift.clockIn,
        clockOut: shift.clockOut,
        segmentNumber: segment.segmentNumber,
      });
      const errorFlag = systemCheck === "OK" ? "" : systemCheck;

      // Determine pay period boundary according to current mode (Weekly / Biweekly)
      const shiftPayPeriod = getShiftHistoryPeriod(
        segment.segmentStart,
        settings.payPeriodMode,
      );
      const generatedInvoiceId = buildInvoiceId(
        shiftPayPeriod.start,
        shiftPayPeriod.end,
      );

      // Display date for the segment corresponds to the actual calendar day of that segment
      const segmentDateStr = Utilities.formatDate(
        segment.segmentStart,
        timeZone,
        "yyyy-MM-dd",
      );

      rows.push({
        id: shift.id,
        shiftId: shift.id,
        clientId: shift.clientId,
        caregiverId: shift.caregiverId,
        invoiceId: shift.invoiceId || generatedInvoiceId,
        invoiceStatus: shift.invoiceStatus || "Unpaid",
        payPeriodType: settings.payPeriodMode,
        payPeriodStart: Utilities.formatDate(
          shiftPayPeriod.start,
          timeZone,
          "yyyy-MM-dd",
        ),
        payPeriodEnd: Utilities.formatDate(
          shiftPayPeriod.end,
          timeZone,
          "yyyy-MM-dd",
        ),
        segmentNumber: segment.segmentNumber,
        errorFlag,
        systemCheck,
        clientName: `${client.name} / ${shift.clientId}`,
        caregiverName: `${caregiver.name} / ${shift.caregiverId}`,
        clientType: client.type || "--",
        paymentMethod: client.type || "--",
        evv: shift.evv || "GPS",
        scheduledTime:
          shift.schedIn && shift.schedOut
            ? `${shift.schedIn} - ${shift.schedOut}`
            : "",
        date: segmentDateStr,
        startDate: segmentDateStr,
        endDate: segmentDateStr,
        clockIn:
          formatShiftTime(segment.segmentStart, timeZone) ||
          String(shift.clockIn || ""),
        clockOut:
          formatShiftTime(segment.segmentEnd, timeZone) ||
          String(shift.clockOut || ""),
        hours: hours.toFixed(2),
        inMethod: shift.inMethod || "GPS",
        outMethod: shift.outMethod || "GPS",
        billableHours: hours.toFixed(2),
        payableHours: hours.toFixed(2),
        billingType: shift.billingType || "Hourly",
        serviceType: shift.serviceType || "",
        shiftType: shift.shiftType || "",
        authorizationCode: shift.authorizationCode || "",
        clientRate: shift.clientRate || "",
        caregiverRate: shift.caregiverRate || "",
        softcareShare: segSoftcare.toFixed(2),
        agencyShare: segAgency.toFixed(2),
        totalClientPrice: segClient.toFixed(2),
        totalCaregiverPrice: segCaregiver.toFixed(2),
        totalAgencyPrice: segAgency.toFixed(2),
        totalSoftcarePrice: segSoftcare.toFixed(2),
        mileageKm: segment.segmentNumber === 1 ? shift.mileageKm || "" : "",
        mileagePrice:
          segment.segmentNumber === 1 ? shift.mileagePrice || "" : "",
        confirmationIndicator:
          shift.confirmationIndicator ||
          (segment.segmentNumber > 1 ? "Split" : "Unconfirmed"),
        invoiceTotal,
        scheduleNote: shift.notes || "",
        adminNote: shift.adminNote || "",
        cgShiftStatus: shift.cgShiftStatus || "Pending",
        clientShiftStatus: shift.clientShiftStatus || "Pending",
        systemShiftStatus: shift.systemShiftStatus || "Pending Approval",
        createdBy: shift.createdBy || "System",
        createdAt: shift.createdAt
          ? shift.createdAt instanceof Date
            ? shift.createdAt.toISOString()
            : String(shift.createdAt)
          : "",
        lastModifiedBy: shift.lastModifiedBy || "",
        lastModifiedAt: shift.lastModifiedAt
          ? shift.lastModifiedAt instanceof Date
            ? shift.lastModifiedAt.toISOString()
            : String(shift.lastModifiedAt)
          : "",
        notes: shift.notes || "",
        segmentDateKey,
        periodStartKey,
        periodEndKey,
      });
    });
  });

  const filteredRows = rows.filter((row) => {
    const clientMatches =
      selectedClientId === "all" || row.clientId === selectedClientId;
    const caregiverMatches =
      selectedCaregiverId === "all" || row.caregiverId === selectedCaregiverId;
    const systemMatches =
      selectedSystemCheck === "all" ||
      String(row.systemCheck || "").includes(selectedSystemCheck) ||
      String(row.errorFlag || "").includes(selectedSystemCheck);

    const haystack = [
      row.shiftId,
      row.invoiceId,
      row.clientName,
      row.caregiverName,
      row.scheduleNote,
      row.adminNote,
      row.systemCheck,
      row.billingType,
      row.serviceType,
      row.shiftType,
      row.clientType,
      row.paymentMethod,
    ]
      .join(" ")
      .toLowerCase();
    const searchMatches = !searchTerm || haystack.includes(searchTerm);

    return clientMatches && caregiverMatches && systemMatches && searchMatches;
  });

  const periodLabel = `${Utilities.formatDate(
    filterPeriod.start,
    timeZone,
    "MMM d, yyyy",
  )} - ${Utilities.formatDate(filterPeriod.end, timeZone, "MMM d, yyyy")}`;
  const currentPeriod = getShiftHistoryPeriod(
    new Date(),
    settings.payPeriodMode,
  );

  return {
    period: {
      start: Utilities.formatDate(filterPeriod.start, timeZone, "yyyy-MM-dd"),
      end: Utilities.formatDate(filterPeriod.end, timeZone, "yyyy-MM-dd"),
      label: periodLabel,
      payPeriodMode: settings.payPeriodMode,
    },
    currentPeriod: {
      start: Utilities.formatDate(currentPeriod.start, timeZone, "yyyy-MM-dd"),
      end: Utilities.formatDate(currentPeriod.end, timeZone, "yyyy-MM-dd"),
      label: currentPeriod.label,
      payPeriodMode: settings.payPeriodMode,
    },
    rows: filteredRows,
    summary: (() => {
      return filteredRows.reduce(
        (acc, row) => {
          acc.hours += Number(row.hours) || 0;
          acc.totalClient +=
            Number(row.invoiceTotal || row.totalClientPrice) || 0;
          acc.totalCaregiver += Number(row.totalCaregiverPrice) || 0;
          acc.totalAgency += Number(row.totalAgencyPrice) || 0;
          acc.totalSoftcare += Number(row.totalSoftcarePrice) || 0;
          acc.totalMileage += Number(row.mileagePrice) || 0;
          return acc;
        },
        {
          totalClient: 0,
          totalCaregiver: 0,
          totalAgency: 0,
          totalSoftcare: 0,
          totalMileage: 0,
          hours: 0,
        },
      );
    })(),
  };
}

function getShiftHistory(data) {
  const sheet = getOrCreateShiftSheet();
  ensureShiftSheetHeaders(sheet);

  const values = sheet.getDataRange().getValues();
  const displayValues = sheet.getDataRange().getDisplayValues();
  if (values.length <= 1) {
    const timeZone = Session.getScriptTimeZone();
    const settingsMode = getShiftHistoryPayPeriodSetting();
    const period = getShiftHistoryPeriod(new Date(), settingsMode);
    const currentPeriod = getShiftHistoryPeriod(new Date(), settingsMode);

    return {
      period: {
        start: Utilities.formatDate(period.start, timeZone, "yyyy-MM-dd"),
        end: Utilities.formatDate(period.end, timeZone, "yyyy-MM-dd"),
        label: period.label,
        payPeriodMode: settingsMode,
      },
      currentPeriod: {
        start: Utilities.formatDate(
          currentPeriod.start,
          timeZone,
          "yyyy-MM-dd",
        ),
        end: Utilities.formatDate(currentPeriod.end, timeZone, "yyyy-MM-dd"),
        label: currentPeriod.label,
        payPeriodMode: settingsMode,
      },
      rows: [],
      summary: {
        totalClient: 0,
        totalCaregiver: 0,
        totalAgency: 0,
        totalSoftcare: 0,
        totalMileage: 0,
        hours: 0,
      },
    };
  }

  const headers = values[0];
  const clientList = getClientList();
  const caregiverList = getCaregiverList();
  const clientMap = {};
  const caregiverMap = {};

  clientList.forEach((client) => {
    clientMap[client.id] = client;
  });
  caregiverList.forEach((caregiver) => {
    caregiverMap[caregiver.id] = caregiver;
  });

  const rawShifts = values.slice(1).map((row, rowIndex) => {
    const displayRow = displayValues[rowIndex + 1];
    const record = {};
    const displayRecord = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
      displayRecord[header] = displayRow[index];
    });
    return {
      id: record["Shift ID"],
      clientId: record["Client ID"],
      caregiverId: record["Caregiver ID"],
      date:
        record["Start Date"] instanceof Date
          ? Utilities.formatDate(
              record["Start Date"],
              Session.getScriptTimeZone(),
              "yyyy-MM-dd",
            )
          : String(record["Start Date"] || ""),
      endDate:
        record["End Date"] instanceof Date
          ? Utilities.formatDate(
              record["End Date"],
              Session.getScriptTimeZone(),
              "yyyy-MM-dd",
            )
          : String(record["End Date"] || ""),
      schedIn: parseTo24HourTime(
        displayRecord["Schedule In"] || record["Schedule In"] || "",
      ),
      schedOut: parseTo24HourTime(
        displayRecord["Schedule Out"] || record["Schedule Out"] || "",
      ),
      payableTimeIn: parseTo24HourTime(
        displayRecord["Payable In"] || record["Payable In"],
      ),
      payableTimeOut: parseTo24HourTime(
        displayRecord["Payable Out"] || record["Payable Out"],
      ),
      billableTimeIn: parseTo24HourTime(
        displayRecord["Billable In"] || record["Billable In"],
      ),
      billableTimeOut: parseTo24HourTime(
        displayRecord["Billable Out"] || record["Billable Out"],
      ),
      clockIn: parseTo24HourTime(
        displayRecord["Clock In"] || record["Clock In"],
      ),
      clockOut: parseTo24HourTime(
        displayRecord["Clock Out"] || record["Clock Out"],
      ),
      billingType: record["Billing Type"],
      serviceType: record["Service Type"],
      shiftType: record["Shift Type"],
      clientRate: record["Client Rate"],
      caregiverRate: record["Caregiver Rate"],
      totalAgencyPrice: record["Total Agency Price"],
      totalSoftcarePrice: record["Total Softcare Price"],
      totalClientPrice: record["Total Client Price"],
      totalCaregiverPrice: record["Total Caregiver Price"],
      notes: record["Notes"],
      invoiceId: record["Invoice ID"],
      invoiceStatus: record["Invoice Status"],
      authorizationCode: record["Authorization Code"],
      billableHours: record["Billable Hours"],
      payableHours: record["Payable Hours"],
      adminNote: record["Admin Note"],
      cgShiftStatus: record["CG Shift Status"],
      clientShiftStatus: record["Client Shift Status"],
      systemShiftStatus: record["System Shift Status"],
      confirmationIndicator: record["Confirmation Indicator"],
      mileageKm: record["Mileage KM"],
      mileagePrice: record["Mileage Price"],
      evv: record["EVV"],
      inMethod: record["In Method"],
      outMethod: record["Out Method"],
      createdBy: record["Created By"],
      createdAt: record["Created At"],
      lastModifiedBy: record["Last Modified By"],
      lastModifiedAt: record["Last Modified At"],
    };
  });

  return buildShiftHistoryRows(
    rawShifts,
    clientMap,
    caregiverMap,
    {
      payPeriodMode: getShiftHistoryPayPeriodSetting(),
    },
    data || {},
  );
}

function getOrCreateShiftSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHIFT_SHEET_NAME);

  const additionalHeaders = [
    "Schedule In",
    "Schedule Out",
    "Payable In",
    "Payable Out",
    "Billable In",
    "Billable Out",
    "Billable Hours",
    "Payable Hours",
    "Bonus Rate",
    "Bonus Hours",
    "Total Bonus",
    "Admin Note",
    "Invoice ID",
    "Invoice Status",
    "Last Modified By",
    "Last Modified At",
  ];

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
      ...additionalHeaders,
    ];
    sheet.appendRow(headers);
    sheet
      .getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#f3f4f6");
  } else {
    const currentHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    const missingHeaders = additionalHeaders.filter(
      (h) => !currentHeaders.includes(h),
    );
    if (missingHeaders.length > 0) {
      const startCol = currentHeaders.length + 1;
      sheet
        .getRange(1, startCol, 1, missingHeaders.length)
        .setValues([missingHeaders]);
      sheet
        .getRange(1, startCol, 1, missingHeaders.length)
        .setBackground("#f3f4f6")
        .setFontWeight("bold");
    }
  }
  return sheet;
}

function getShifts(startDateStr, endDateStr) {
  const sheet = getOrCreateShiftSheet();
  const data = sheet.getDataRange().getValues();
  const displayData = sheet.getDataRange().getDisplayValues();
  const headers = data[0];

  // Indices
  const dateIdx = headers.indexOf("Start Date");
  const endDateIdx = headers.indexOf("End Date");
  const clientIdx = headers.indexOf("Client ID");
  const cgIdx = headers.indexOf("Caregiver ID");
  const startIdx = headers.indexOf("Clock In");
  const endIdx = headers.indexOf("Clock Out");
  const hoursIdx = headers.indexOf("Hours");
  const billingTypeIdx = headers.indexOf("Billing Type");
  const serviceTypeIdx = headers.indexOf("Service Type");
  const shiftTypeIdx = headers.indexOf("Shift Type");
  const clientRateIdx = headers.indexOf("Client Rate");
  const caregiverRateIdx = headers.indexOf("Caregiver Rate");
  const totalClientPriceIdx = headers.indexOf("Total Client Price");
  const totalCaregiverPriceIdx = headers.indexOf("Total Caregiver Price");
  const notesIdx = headers.indexOf("Notes");

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

    // Simple range check (could be improved for multi-day overlaps)
    if (rowDate >= start && rowDate <= end) {
      const endDateVal = row[endDateIdx];

      // Fix: Use original string if available to avoid timezone shifts
      let dateOutput = "";
      if (rowDateStr instanceof Date) {
        dateOutput = Utilities.formatDate(rowDateStr, timeZone, "yyyy-MM-dd");
      } else if (
        typeof rowDateStr === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(rowDateStr)
      ) {
        dateOutput = rowDateStr;
      } else {
        dateOutput = Utilities.formatDate(rowDate, timeZone, "yyyy-MM-dd");
      }

      let endDateOutput = "";
      if (endDateVal instanceof Date) {
        endDateOutput = Utilities.formatDate(
          endDateVal,
          timeZone,
          "yyyy-MM-dd",
        );
      } else if (
        typeof endDateVal === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(endDateVal)
      ) {
        endDateOutput = endDateVal;
      } else {
        endDateOutput = String(endDateVal || "");
      }

      const displayRow = displayData[i];
      const clockInVal = displayRow[startIdx] || row[startIdx];
      const clockOutVal = displayRow[endIdx] || row[endIdx];

      shifts.push({
        id: row[0],
        clientId: row[clientIdx],
        caregiverId: row[cgIdx],
        date: dateOutput,
        endDate: endDateOutput,
        clockIn: parseTo24HourTime(clockInVal),
        clockOut: parseTo24HourTime(clockOutVal),
        hours: row[hoursIdx],
        billingType: row[billingTypeIdx],
        serviceType: row[serviceTypeIdx],
        shiftType: row[shiftTypeIdx],
        clientRate: row[clientRateIdx],
        caregiverRate: row[caregiverRateIdx],
        totalClientPrice: row[totalClientPriceIdx],
        totalCaregiverPrice: row[totalCaregiverPriceIdx],
        notes: row[notesIdx],
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
    const shiftId = "SH" + Math.floor(1000 + Math.random() * 9000);
    const formattedDate = Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd",
    );

    // Calculate End Date for this specific shift instance
    const startParts = data.startDate.split("-");
    const originalStart = new Date(
      startParts[0],
      startParts[1] - 1,
      startParts[2],
    );

    const endParts = data.endDate.split("-");
    const originalEnd = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    const durationDays = (originalEnd - originalStart) / (1000 * 60 * 60 * 24);

    let thisEndDate = new Date(date);
    thisEndDate.setDate(date.getDate() + durationDays);
    const formattedEndDate = Utilities.formatDate(
      thisEndDate,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd",
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

    const metaRowIndex = sheet.getLastRow();
    const headerMap = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    const invoicePeriod = getShiftHistoryPeriod(date, "Biweekly");
    const generatedInvoiceId = buildInvoiceId(
      invoicePeriod.start,
      invoicePeriod.end,
    );

    const metaUpdates = {
      "Invoice ID": generatedInvoiceId,
      "Invoice Status": "Unpaid",
      "CG Shift Status": "Pending",
      "Client Shift Status": "Pending",
      "System Shift Status": "Pending Approval",
      "Confirmation Indicator": "Unconfirmed",
      "Created By": "System",
      "Created At": timestamp,
      "Last Modified By": "System",
      "Last Modified At": timestamp,
    };

    Object.entries(metaUpdates).forEach(([header, value]) => {
      const colIdx = headerMap.indexOf(header);
      if (colIdx !== -1) {
        sheet.getRange(metaRowIndex, colIdx + 1).setValue(value);
      }
    });
  });

  return { success: true };
}

function updateShift(data) {
  const sheet = getOrCreateShiftSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  const shiftId = data.shiftId; // Ensure ID is passed

  // Find row by ID (Column 1, index 0)
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === shiftId) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error("Shift not found");
  }

  // Map headers to find column indices
  const headers = values[0];
  const updateMap = {
    "Client ID": data.clientId,
    "Caregiver ID": data.caregiverId,
    "Start Date": data.startDate,
    "End Date": data.endDate,
    "Clock In": data.clockIn,
    "Clock Out": data.clockOut,
    Hours: data.hours,
    "Billing Type": data.billingType,
    "Service Type": data.serviceType,
    "Shift Type": data.shiftType,
    "Client Rate": data.clientRate,
    "Caregiver Rate": data.caregiverRate,
    "Agency Share": data.agencyShare,
    "Softcare Share": data.softcareShare,
    "Total Client Price": data.totalClientPrice,
    "Total Caregiver Price": data.totalCaregiverPrice,
    "Total Agency Price": data.totalAgencyPrice,
    "Total Softcare Price": data.totalSoftcarePrice,
    Notes: data.notes,
  };

  // Update cells
  for (const [header, value] of Object.entries(updateMap)) {
    const colIdx = headers.indexOf(header);
    if (colIdx !== -1) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(value);
    }
  }

  const modifiedMeta = {
    "Last Modified By": "System",
    "Last Modified At": new Date(),
  };

  Object.entries(modifiedMeta).forEach(([header, value]) => {
    const colIdx = headers.indexOf(header);
    if (colIdx !== -1) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(value);
    }
  });

  return { success: true };
}

function toggleShiftConfirmation(shiftId, currentStatus) {
  const sheet = getOrCreateShiftSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values[0];

  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === shiftId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error("Shift not found");
  }

  const confirmationColIdx = headers.indexOf("Confirmation Indicator");
  if (confirmationColIdx === -1) {
    throw new Error("Confirmation Indicator column not found");
  }

  const systemStatusColIdx = headers.indexOf("System Shift Status");
  const modifiedByColIdx = headers.indexOf("Last Modified By");
  const modifiedAtColIdx = headers.indexOf("Last Modified At");

  const currentlyConfirmed =
    String(currentStatus || "")
      .trim()
      .toLowerCase() === "confirmed";
  const newStatus = currentlyConfirmed ? "Unconfirmed" : "Confirmed";
  const newSystemStatus = currentlyConfirmed ? "Pending Approval" : "Approved";

  sheet.getRange(rowIndex, confirmationColIdx + 1).setValue(newStatus);

  if (systemStatusColIdx !== -1) {
    sheet.getRange(rowIndex, systemStatusColIdx + 1).setValue(newSystemStatus);
  }

  if (modifiedByColIdx !== -1) {
    sheet.getRange(rowIndex, modifiedByColIdx + 1).setValue("System Admin");
  }

  if (modifiedAtColIdx !== -1) {
    sheet.getRange(rowIndex, modifiedAtColIdx + 1).setValue(new Date());
  }

  return {
    success: true,
    newStatus: newStatus,
    newSystemStatus: newSystemStatus,
  };
}

function deleteShift(shiftId) {
  const sheet = getOrCreateShiftSheet();
  const data = sheet.getDataRange().getValues();

  // Find row index
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === shiftId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  throw new Error("Shift not found");
}
function updateVisitDetails(payload) {
  const sheet = getOrCreateShiftSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values[0];

  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === payload.shiftId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error("Shift not found");
  }

  const updateMap = {
    "Start Date": payload.startDate,
    "End Date": payload.endDate,
    "Schedule In": payload.schedIn,
    "Schedule Out": payload.schedOut,
    "Payable In": payload.payableIn,
    "Payable Out": payload.payableOut,
    "Billable In": payload.billableIn,
    "Billable Out": payload.billableOut,
    "Billable Hours": payload.billableHrs,
    "Payable Hours": payload.payableHrs,
    "Billing Type": payload.billingType,
    "Service Type": payload.serviceType,
    "Shift Type": payload.shiftType,
    "Client Rate": payload.clientRate,
    "Caregiver Rate": payload.caregiverRate,
    "Bonus Rate": payload.bonusRate,
    "Bonus Hours": payload.bonusHrs,
    Notes: payload.scheduleReason,
    "Admin Note": payload.adminNote,
    "Agency Share": payload.agencyShare,
    "Softcare Share": payload.softcareShare,
    "Total Client Price": payload.totClient,
    "Total Caregiver Price": payload.totCaregiver,
    "Total Agency Price": payload.totAgency,
    "Total Softcare Price": payload.totSoftcare,
    "Total Bonus": payload.totBonus,
    "Last Modified By": "System Admin",
    "Last Modified At": new Date(),
  };

  for (const [header, value] of Object.entries(updateMap)) {
    const colIdx = headers.indexOf(header);
    if (colIdx !== -1) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(value);
    }
  }

  return { success: true };
}

/**
 * Handle Shift Actions from email buttons
 */
function processShiftAction(
  personId,
  personType,
  action,
  specificShiftId,
  actionInvoiceId,
) {
  if (action === "Review") {
    // Return a message that directs them to the web app login
    return {
      title: "Review Shifts",
      message:
        "Please log in to your Allevia Senior Care portal to review your individual shifts, or contact the office at 440-907-9599 if you need immediate assistance.",
      color: "#dbeafe", // blue-100
      icon: `<svg style="width: 40px; height: 40px; color: #2563eb;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"></path></svg>`,
    };
  }

  try {
    const sheet = getOrCreateShiftSheet();
    const range = sheet.getDataRange();
    const values = range.getValues();
    const headers = values[0];

    const idCol =
      personType === "client"
        ? headers.indexOf("Client ID")
        : headers.indexOf("Caregiver ID");
    const statusCol =
      personType === "client"
        ? headers.indexOf("Client Shift Status")
        : headers.indexOf("CG Shift Status");
    const shiftIdCol = headers.indexOf("Shift ID");
    const dateCol =
      headers.indexOf("Start Date") !== -1
        ? headers.indexOf("Start Date")
        : headers.indexOf("Date");

    if (idCol === -1 || statusCol === -1) {
      throw new Error("Required columns not found in Shift History");
    }

    let updatedCount = 0;
    const newStatus = action === "Confirm" ? "Confirmed" : "Declined";

    for (let i = 1; i < values.length; i++) {
      const currentStatus = values[i][statusCol];
      const matchPerson = values[i][idCol] === personId;
      if (!matchPerson) continue;

      // If an actionInvoiceId or specificShiftId was passed, match the shifts belonging to that invoice/shift
      let isTargetShift = true;
      if (specificShiftId) {
        // If specificShiftId equals this shift ID, or if specificShiftId is passed as an invoiceId or invoice matching
        isTargetShift =
          String(values[i][shiftIdCol]).trim() ===
          String(specificShiftId).trim();
      }

      // If action applies to an entire invoice or all shifts in the pay period for this person
      // update all matching shifts that are pending or not yet resolved
      if (
        isTargetShift &&
        (currentStatus === "Pending" ||
          !currentStatus ||
          currentStatus === "Unconfirmed")
      ) {
        sheet.getRange(i + 1, statusCol + 1).setValue(newStatus);
        updatedCount++;
      }
    }

    if (updatedCount === 0) {
      return {
        title: "No Pending Shifts",
        message:
          "We couldn't find any pending shifts that require your action. They may have already been confirmed or declined.",
        color: "#fef3c7", // blue-100
        icon: `<svg style="width: 40px; height: 40px; color: #d97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      };
    }

    return {
      title: `Shifts ${newStatus}`,
      message: `Thank you for your response! We have ${newStatus.toLowerCase()} ${updatedCount} pending shift(s) on your account.`,
      color: action === "Confirm" ? "#dcfce7" : "#fee2e2", // green-100 or red-100
      icon:
        action === "Confirm"
          ? `<svg style="width: 40px; height: 40px; color: #16a34a;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
          : `<svg style="width: 40px; height: 40px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
    };
  } catch (error) {
    return {
      title: "Error",
      message:
        "An error occurred while updating your shifts. Please contact the office at 440-907-9599.",
      color: "#fee2e2",
      icon: `<svg style="width: 40px; height: 40px; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    };
  }
}

function checkShiftOverlap(clientId, startDate, clockIn, clockOut) {
  try {
    const shifts = getShifts(startDate, startDate);

    // Convert new clock times to minutes
    const [inH, inM] = clockIn.split(":").map(Number);
    const [outH, outM] = clockOut.split(":").map(Number);
    const newStartMins = inH * 60 + inM;
    let newEndMins = outH * 60 + outM;
    if (newEndMins <= newStartMins) newEndMins += 24 * 60; // overnight

    for (const shift of shifts) {
      if (shift.clientId === clientId && shift.status !== "Cancelled") {
        const [sInH, sInM] = shift.clockIn.split(":").map(Number);
        const [sOutH, sOutM] = shift.clockOut.split(":").map(Number);

        const existStartMins = sInH * 60 + sInM;
        let existEndMins = sOutH * 60 + sOutM;
        if (existEndMins <= existStartMins) existEndMins += 24 * 60;

        // Check for overlap
        if (newStartMins < existEndMins && newEndMins > existStartMins) {
          return true; // Overlap detected
        }
      }
    }
    return false;
  } catch (e) {
    Logger.log("Error checking overlap: " + e.message);
    return false; // let it pass on error rather than block completely
  }
}
