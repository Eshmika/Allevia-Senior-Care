const SHEET_NAME = "Caregivers_DB";
const PRIMARY_COLOR = "#65c027";

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Huge header list based on PDF
    const headers = [
      // 1. Admin Basics
      "Caregiver ID",
      "First Name",
      "Last Name",
      "Phone",
      "Email",
      "Title",
      "Status",
      "Created At",
      "App Status",

      // 2. Personal & Legal
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

      // 3. Transportation
      "Driver License?",
      "License State",
      "License #",
      "Has Car?",
      "Car Make/Model",
      "Has Insurance?",

      // 4. Position & Availability
      "Hours Avail",
      "Schedule Desired",
      "Times Avail",
      "Emergency Avail?",
      "Live-in Avail?",

      // 5. Certs & Skills
      "Certifications",
      "Skills Checklist",
      "Languages",

      // 6. Education
      "High School",
      "HS Degree",
      "College",
      "College Degree",
      "Other Edu",
      "Other Degree",

      // 7. Employment History (JSON String for simplicity or summary)
      "Employer 1",
      "Employer 2",
      "Employer 3",

      // 8. References & Emergency
      "Reference 1",
      "Reference 2",
      "Emergency Contact",
      "Emerg. Phone",
      "Emerg. Relation",

      // 9. Legal & Signature
      "Criminal Conviction?",
      "Conviction Details",
      "Signature Name",
      "Signature Date",
      "Agreed to Terms",
    ];

    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    range
      .setBackground(PRIMARY_COLOR)
      .setFontColor("white")
      .setFontWeight("bold")
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);
  }
  return sheet;
}

// ADMIN CREATES CAREGIVER
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

// CAREGIVER FILLS APPLICATION
function submitFullApplication(form) {
  try {
    const sheet = getOrCreateSheet();
    const id = String(form.caregiverId).trim();

    // Improved Row Finding
    const data = sheet.getDataRange().getValues();
    // Find index where column 0 matches ID
    const rowIndex = data.findIndex((r) => String(r[0]).trim() === id);

    if (rowIndex === -1) return { success: false, message: "ID not found" };
    const r = rowIndex + 1; // Convert 0-based array index to 1-based Sheet row

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

        `${form.hsName} - ${form.hsCity}`,
        form.hsDegree,
        `${form.colName} - ${form.colCity}`,
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
        new Date(), // Sign Date
        "Yes",
      ],
    ];

    // 1. Update Application Status (Col 9)
    sheet.getRange(r, 9).setValue("Application Completed");

    // 2. Update Rest of Data (Col 10 onwards)
    sheet.getRange(r, 10, 1, dataToUpdate[0].length).setValues(dataToUpdate);

    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Fetches summary list for the table
 */
function getCaregiverList() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const data = sheet
    .getRange(2, 1, lastRow - 1, sheet.getLastColumn())
    .getValues();

  return data
    .map((row) => ({
      id: String(row[0]),
      name: row[1] + " " + row[2],
      phone: row[3],
      email: row[4],
      title: row[5],
      status: row[6],
      city: row[15] || "N/A",
    }))
    .reverse();
}

/**
 * Fetches full details for a single caregiver
 */
function getCaregiverDetails(id) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const searchId = String(id).trim();

  const row = data.find((r) => String(r[0]).trim() === searchId);

  if (!row) return null;

  let caregiver = {};
  headers.forEach((header, index) => {
    caregiver[header] = row[index];
  });

  return caregiver;
}

function getDashboardStats() {
  const sheet = getOrCreateSheet();
  if (sheet.getLastRow() <= 1)
    return { total: 0, completed: 0, active: 0, inactive: 0, stna: 0 };

  const data = sheet.getRange(2, 6, sheet.getLastRow() - 1, 4).getValues(); // Get Title(6), Status(7), ... App Status(9)

  let stats = {
    total: data.length,
    completed: 0,
    active: 0,
    inactive: 0,
    stna: 0,
  };

  data.forEach((row) => {
    const title = row[0];
    const status = row[1];
    const appStatus = row[3];

    if (status === "Active") stats.active++;
    if (status === "Inactive") stats.inactive++;
    if (title === "STNA") stats.stna++;
    if (appStatus === "Application Completed") stats.completed++;
  });

  return stats;
}
