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
      "Interview Status",
      "Background Check",
      "Routing Number",
      "Bank Account"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    // Migration: Add new columns if they don't exist
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    if (!headers.includes("Routing Number")) {
      sheet.getRange(1, lastCol + 1).setValue("Routing Number");
      sheet.getRange(1, lastCol + 2).setValue("Bank Account");
    }
  }
  return sheet;
}

// 1. CREATE
function handleCaregiverSubmission(data) {
  const sheet = getOrCreateSheet();
  
  // Generate ID: CG + Random 4 digits
  // Example: CG1234
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  const newId = `CG${randomPart}`;

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
  
  // Save Banking Info if provided
  const lastRow = sheet.getLastRow();
  // Find column indices for Routing/Account
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const routingIdx = headers.indexOf("Routing Number");
  const accountIdx = headers.indexOf("Bank Account");
  
  if (routingIdx > -1 && data.routingNum) sheet.getRange(lastRow, routingIdx + 1).setValue(data.routingNum);
  if (accountIdx > -1 && data.accountNum) sheet.getRange(lastRow, accountIdx + 1).setValue(data.accountNum);

  sendRecruitmentEmail(data, newId);
  return { success: true, message: "Sent!", id: newId };
}

// 2. UPDATE (Public Form)
function submitFullApplication(form) {
  try {
    const sheet = getOrCreateSheet();
    const targetId = String(form.caregiverId).trim().toUpperCase(); // Force Upper

    // Get ALL data as Strings (DisplayValues) to match exactly what is seen
    const data = sheet.getDataRange().getDisplayValues();

    // Find Row
    const rowIndex = data.findIndex(
      (r) => String(r[0]).trim().toUpperCase() === targetId
    );

    if (rowIndex === -1)
      return { success: false, message: "ID not found in DB" };
    const r = rowIndex + 1;

    // Update Basic Info (Cols 2-6) if provided (Edit Mode)
    if (form.title) sheet.getRange(r, 6).setValue(form.title);
    if (form.firstName) sheet.getRange(r, 2).setValue(form.firstName);
    if (form.lastName) sheet.getRange(r, 3).setValue(form.lastName);
    if (form.phone) sheet.getRange(r, 4).setValue(form.phone);
    if (form.email) sheet.getRange(r, 5).setValue(form.email);
    if (form.status) sheet.getRange(r, 7).setValue(form.status);

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

    // Save Banking Info
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const routingIdx = headers.indexOf("Routing Number");
    const accountIdx = headers.indexOf("Bank Account");
    
    if (routingIdx > -1) sheet.getRange(r, routingIdx + 1).setValue(form.routingNum || "");
    if (accountIdx > -1) sheet.getRange(r, accountIdx + 1).setValue(form.accountNum || "");

    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// 3. GET LIST (For Table)
function getCaregiverList() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  // Use getDisplayValues to treat everything as String (prevents number/string mismatch)
  const data = sheet
    .getRange(2, 1, lastRow - 1, sheet.getLastColumn())
    .getDisplayValues();

  return data
    .filter((row) => row[0] !== "") // Filter ghosts
    .map((row) => ({
      id: row[0].trim(), // Exact text ID
      name: row[1] + " " + row[2],
      phone: row[3],
      email: row[4],
      title: row[5],
      status: row[6],
      city: row[15] || "--",
      zip: row[17] || "",
      appStatus: row[8], // App Status
      interviewStatus: row[53], // Interview Status (Check index)
      backgroundCheck: row[54], // Background Check (Check index)
    }))
    .reverse();
}

// 4. GET DETAILS
function getCaregiverDetails(id) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getDisplayValues(); // Get text
  const headers = data[0];

  const searchId = String(id).trim().toUpperCase();

  const rowIndex = data.findIndex(
    (r, i) => i > 0 && String(r[0]).trim().toUpperCase() === searchId
  );

  if (rowIndex === -1) return null;

  const row = data[rowIndex];
  let caregiver = {};
  headers.forEach((header, index) => {
    caregiver[header] = row[index];
  });

  return caregiver;
}

// 5. NEW: UPDATE STAGE STATUS
function updateCaregiverStage(id, stage, value) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getDisplayValues();
  const headers = data[0];

  const searchId = String(id).trim().toUpperCase();
  const rowIndex = data.findIndex(
    (r, i) => i > 0 && String(r[0]).trim().toUpperCase() === searchId
  );

  if (rowIndex === -1) return { success: false, message: "ID not found" };

  const r = rowIndex + 1;

  // Find column index
  let colIndex = -1;

  if (stage === "Interview") colIndex = headers.indexOf("Interview Status");
  if (stage === "Background") colIndex = headers.indexOf("Background Check");
  if (stage === "Active") colIndex = headers.indexOf("Status"); // This updates main status

  if (colIndex === -1) return { success: false, message: "Column not found" };

  sheet.getRange(r, colIndex + 1).setValue(value);

  return { success: true, newValue: value };
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
