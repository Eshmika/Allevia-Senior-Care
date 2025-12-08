const SHEET_NAME = "Caregivers_DB";
const PRIMARY_COLOR = "#65c027";

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      "Caregiver ID",
      "First Name",
      "Last Name",
      "Phone",
      "Email",
      "Title",
      "Status",
      "Created At",
      "App Status",
      "Middle Int",
      "DOB",
      "Gender",
      "SSN",
      "Address",
      "Apt",
      "City",
      "State",
      "Zip",
      "US Eligible?",
      "US Citizen?",
      "Driver License?",
      "License State",
      "License #",
      "Has Car?",
      "Car Make/Model",
      "Has Insurance?",
      "Hours Avail",
      "Schedule Desired",
      "Times Avail",
      "Emergency Avail?",
      "Live-in Avail?",
      "Certifications",
      "Skills Checklist",
      "Languages",
      "High School",
      "HS Degree",
      "College",
      "College Degree",
      "Other Edu",
      "Other Degree",
      "Employer 1",
      "Employer 2",
      "Employer 3",
      "Reference 1",
      "Reference 2",
      "Emergency Contact",
      "Emerg. Phone",
      "Emerg. Relation",
      "Criminal Conviction?",
      "Conviction Details",
      "Signature Name",
      "Signature Date",
      "Agreed to Terms",
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

// Helper to normalize IDs (removes spaces, makes lowercase)
function normalizeId(id) {
  return String(id).toLowerCase().replace(/\s+/g, "");
}

function handleCaregiverSubmission(data) {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  let newId = "CG-1001";

  if (lastRow > 1) {
    const lastIdStr = sheet.getRange(lastRow, 1).getValue().toString();
    const parts = lastIdStr.split("-");
    if (parts.length > 1) {
      const lastNum = parseInt(parts[1]);
      if (!isNaN(lastNum)) {
        newId = "CG-" + (lastNum + 1);
      }
    }
  }

  sheet.appendRow([
    newId,
    data.firstName,
    data.lastName,
    data.phone,
    data.email,
    data.title,
    data.status,
    new Date(),
    "Pending Application",
  ]);

  sendRecruitmentEmail(data, newId);
  return { success: true, message: "Sent!", id: newId };
}

function submitFullApplication(form) {
  try {
    const sheet = getOrCreateSheet();
    const targetId = normalizeId(form.caregiverId); // Use Normalizer

    const data = sheet.getDataRange().getValues();
    // Use Normalizer to find row
    const rowIndex = data.findIndex((r) => normalizeId(r[0]) === targetId);

    if (rowIndex === -1) return { success: false, message: "ID not found" };
    const r = rowIndex + 1;

    // (Helper functions unchanged)
    const join = (arr) => (Array.isArray(arr) ? arr.join(", ") : arr || "");
    const empStr = (e) =>
      e ? `${e.company || ""} ${e.title ? "(" + e.title + ")" : ""}` : "";
    const refStr = (r) =>
      r ? `${r.name || ""} ${r.phone ? "- " + r.phone : ""}` : "";

    const dataToUpdate = [
      [
        form.middleName || "",
        form.dob || "",
        form.gender || "",
        form.ssn || "",
        form.address || "",
        form.apt || "",
        form.city || "",
        form.state || "",
        form.zip || "",
        form.usEligible || "No",
        form.usCitizen || "No",
        form.hasLicense || "No",
        form.licenseState || "",
        form.licenseNum || "",
        form.hasCar || "No",
        form.carModel || "",
        form.hasInsurance || "No",
        join(form.hoursAvail),
        join(form.scheduleDays),
        join(form.timesAvail),
        form.emergencyAvail || "No",
        form.liveInAvail || "No",
        join(form.certs),
        join(form.skills),
        join(form.languages),
        `${form.hsName || ""} ${form.hsCity ? "- " + form.hsCity : ""}`,
        form.hsDegree,
        `${form.colName || ""} ${form.colCity ? "- " + form.colCity : ""}`,
        form.colDegree,
        form.otherEdu,
        form.otherDegree,
        empStr(form.emp1),
        empStr(form.emp2),
        empStr(form.emp3),
        refStr(form.ref1),
        refStr(form.ref2),
        form.emName,
        form.emPhone,
        form.emRel,
        form.criminalHistory || "No",
        form.criminalExplain || "",
        form.signName,
        new Date(),
        "Yes",
      ],
    ];

    sheet.getRange(r, 9).setValue("Application Completed");
    sheet.getRange(r, 10, 1, dataToUpdate[0].length).setValues(dataToUpdate);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function getCaregiverList() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  // Get all data
  const data = sheet
    .getRange(2, 1, lastRow - 1, sheet.getLastColumn())
    .getValues();

  return data
    .filter((row) => row[0] !== "" && row[0] !== null) // Safety check for empty rows
    .map((row) => ({
      id: String(row[0]), // Send exact ID from sheet
      name: row[1] + " " + row[2],
      phone: row[3],
      email: row[4],
      title: row[5],
      status: row[6],
      city: row[15] || "--",
    }))
    .reverse();
}

// --- FIXED FUNCTION ---
function getCaregiverDetails(id) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // 1. Normalize the ID we are looking for (remove spaces, lowercase)
  const searchId = normalizeId(id);

  console.log("Searching for: " + searchId); // Log for debugging

  // 2. Find row by normalizing the sheet data too
  const row = data.find((r, i) => {
    if (i === 0) return false; // Skip header
    const sheetId = normalizeId(r[0]);
    return sheetId === searchId;
  });

  if (!row) {
    console.log("Error: ID not found.");
    return null;
  }

  let caregiver = {};
  headers.forEach((header, index) => {
    caregiver[header] =
      row[index] === "" || row[index] === undefined ? "" : row[index];
  });

  return caregiver;
}

function getDashboardStats() {
  const sheet = getOrCreateSheet();
  if (sheet.getLastRow() <= 1)
    return { total: 0, completed: 0, active: 0, inactive: 0, stna: 0 };

  const data = sheet.getRange(2, 6, sheet.getLastRow() - 1, 4).getValues();

  let stats = {
    total: data.length,
    completed: 0,
    active: 0,
    inactive: 0,
    stna: 0,
  };

  data.forEach((row) => {
    if (row[1] === "Active") stats.active++;
    if (row[1] === "Inactive") stats.inactive++;
    if (row[0] === "STNA") stats.stna++;
    if (row[3] === "Application Completed") stats.completed++;
  });

  return stats;
}
