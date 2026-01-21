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
      "EIN",
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
      "Ref1 Name",
      "Ref1 Phone",
      "Ref1 Relation",
      "Ref2 Name",
      "Ref2 Phone",
      "Ref2 Relation",
      "Emergency Contact",
      "Emerg. Phone",
      "Emerg. Relation",
      "Emerg. Email",
      "Emerg. Address",
      "Emerg. Apt",
      "Emerg. City",
      "Emerg. State",
      "Emerg. Zip",
      "Criminal Conviction?",
      "Conviction Details",
      "Signature Name",
      "Signature Date",
      "Agreed to Terms",
      "Interview Status",
      "Background Check",
      "Routing Number",
      "Bank Account",
      "Last Reviewed",
      "Username",
      "Started Date",
      "Years of Experience",
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
    // Check for Last Reviewed separately as it might be added later
    const updatedHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!updatedHeaders.includes("Last Reviewed")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Last Reviewed");
    }

    // Add Document Link Columns
    const finalHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!finalHeaders.includes("Contract Link")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Contract Link");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("W9 Link");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Background Link");
    }

    // Add Marital Status Columns
    const maritalHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!maritalHeaders.includes("Marital Status")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Marital Status");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Spouse Name");
    }

    // Add Emergency Contact Extra Columns
    const emHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!emHeaders.includes("Emerg. Email")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Emerg. Email");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Emerg. Address");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Emerg. Apt");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Emerg. City");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Emerg. State");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Emerg. Zip");
    }

    // Add Payment Details Columns
    const payHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!payHeaders.includes("Payment Method")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Payment Method");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Bank Name");
      sheet
        .getRange(1, sheet.getLastColumn() + 1)
        .setValue("Account Holder Name");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Account Type");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Holder Type");
    }

    // Add Check Payment Columns
    const checkHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!checkHeaders.includes("Check ID Proof")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Check ID Proof");
      sheet
        .getRange(1, sheet.getLastColumn() + 1)
        .setValue("Check Address Proof");
    }

    // Add Digital Payment Columns
    const digitalHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!digitalHeaders.includes("Digital Account Details")) {
      sheet
        .getRange(1, sheet.getLastColumn() + 1)
        .setValue("Digital Account Details");
    }
    if (!digitalHeaders.includes("Digital Name")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Digital Name");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Digital Phone");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Digital Email");
    }

    // Add Vaccination Columns
    const vaxHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!vaxHeaders.includes("Covid Vaccine")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Covid Vaccine");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Flu Vaccine");
    }

    // Add Username Column
    const userHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!userHeaders.includes("Username")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Username");
    }

    // Add Started Date Column
    const startedHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!startedHeaders.includes("Started Date")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Started Date");
    }

    // Add Years of Experience Column
    const expHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!expHeaders.includes("Years of Experience")) {
      sheet
        .getRange(1, sheet.getLastColumn() + 1)
        .setValue("Years of Experience");
    }

    // Add Detailed Employment History Columns
    const empHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!empHeaders.includes("Emp1 Company")) {
      const newHeaders = [
        "Emp1 Company",
        "Emp1 Title",
        "Emp1 Supervisor",
        "Emp1 Phone",
        "Emp1 Duties",
        "Emp2 Company",
        "Emp2 Title",
        "Emp2 Supervisor",
        "Emp2 Phone",
        "Emp2 Duties",
        "Emp3 Company",
        "Emp3 Title",
        "Emp3 Supervisor",
        "Emp3 Phone",
        "Emp3 Duties",
      ];
      const startCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, startCol, 1, newHeaders.length).setValues([newHeaders]);
    }
  }
  return sheet;
}

function saveDocumentLink(caregiverId, docType, fileUrl) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Map docType to Header Name
  const headerMap = {
    contract: "Contract Link",
    w9: "W9 Link",
    background: "Background Link",
  };

  const targetHeader = headerMap[docType];
  if (!targetHeader) return false;

  const colIndex = headers.indexOf(targetHeader);
  if (colIndex === -1) return false; // Column not found

  // Find row by Caregiver ID (Column 0)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === caregiverId) {
      sheet.getRange(i + 1, colIndex + 1).setValue(fileUrl);
      return true;
    }
  }
  return false;
}

// 1. CREATE
function handleCaregiverSubmission(data) {
  const sheet = getOrCreateSheet();

  // --- DUPLICATE CHECK ---
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    // Fetch Phone (Col 4) and Email (Col 5) columns
    // getRange(row, column, numRows, numColumns)
    const values = sheet.getRange(2, 4, lastRow - 1, 2).getDisplayValues();

    const newPhone = String(data.phone || "").replace(/\D/g, "");
    const newEmail = String(data.email || "")
      .trim()
      .toLowerCase();

    for (let i = 0; i < values.length; i++) {
      const existingPhone = String(values[i][0]).replace(/\D/g, "");
      const existingEmail = String(values[i][1]).trim().toLowerCase();

      if (newPhone && existingPhone === newPhone) {
        return {
          success: false,
          message: "Error: This Phone Number is already registered.",
        };
      }
      if (newEmail && existingEmail === newEmail) {
        return {
          success: false,
          message: "Error: This Email is already registered.",
        };
      }
    }
  }
  // -----------------------

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
  const newRow = sheet.getLastRow();
  // Find column indices for Routing/Account
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const routingIdx = headers.indexOf("Routing Number");
  const accountIdx = headers.indexOf("Bank Account");
  const reviewIdx = headers.indexOf("Last Reviewed");

  if (routingIdx > -1 && data.routingNum)
    sheet.getRange(newRow, routingIdx + 1).setValue(data.routingNum);
  if (accountIdx > -1 && data.accountNum)
    sheet.getRange(newRow, accountIdx + 1).setValue(data.accountNum);
  if (reviewIdx > -1)
    sheet.getRange(newRow, reviewIdx + 1).setValue(new Date());

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
      (r) => String(r[0]).trim().toUpperCase() === targetId,
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

    // Dynamic Map: Header Name -> Value
    const updates = {};
    updates["Middle Int"] = form.middleName || "";
    updates["DOB"] = form.dob || "";
    updates["Gender"] = form.gender || "";
    updates["SSN"] = form.ssn || "";
    updates["EIN"] = form.ein || "";
    updates["Address"] = form.address || "";
    updates["Apt"] = form.apt || "";
    updates["City"] = form.city || "";
    updates["State"] = form.state || "";
    updates["Zip"] = form.zip || "";
    updates["US Eligible?"] = form.usEligible || "No";
    updates["US Citizen?"] = form.usCitizen || "No";
    updates["Driver License?"] = form.hasLicense || "No";
    updates["License State"] = form.licenseState || "";
    updates["License #"] = form.licenseNum || "";
    updates["Has Car?"] = form.hasCar || "No";
    updates["Car Make/Model"] = form.carModel || "";
    updates["Has Insurance?"] = form.hasInsurance || "No";
    updates["Hours Avail"] = join(form.hoursAvail);
    updates["Schedule Desired"] = join(form.scheduleDays);
    updates["Times Avail"] = join(form.timesAvail);
    updates["Emergency Avail?"] = form.emergencyAvail || "No";
    updates["Live-in Avail?"] = form.liveInAvail || "No";
    updates["Certifications"] = join(form.certs);
    updates["Skills Checklist"] = join(form.skills);
    updates["Languages"] = join(form.languages);
    updates["High School"] = `${form.hsName || ""} ${
      form.hsCity ? "- " + form.hsCity : ""
    }`;
    updates["HS Degree"] = form.hsDegree;
    updates["College"] = `${form.colName || ""} ${
      form.colCity ? "- " + form.colCity : ""
    }`;
    updates["College Degree"] = form.colDegree;
    updates["Other Edu"] = form.otherEdu;
    updates["Other Degree"] = form.otherDegree;

    // Legacy mapping removed as per request
    // updates["Employer 1"] = empStr(form.emp1);

    // OLD Reference mapping removed
    // updates["Reference 1"] = refStr(form.ref1);
    // updates["Reference 2"] = refStr(form.ref2);

    // NEW Reference mapping
    updates["Ref1 Name"] = form.ref1 ? form.ref1.name : "";
    updates["Ref1 Phone"] = form.ref1 ? form.ref1.phone : "";
    updates["Ref1 Relation"] = form.ref1 ? form.ref1.relation : "";

    updates["Ref2 Name"] = form.ref2 ? form.ref2.name : "";
    updates["Ref2 Phone"] = form.ref2 ? form.ref2.phone : "";
    updates["Ref2 Relation"] = form.ref2 ? form.ref2.relation : "";

    updates["Emergency Contact"] = form.emName;
    updates["Emerg. Phone"] = form.emPhone;
    updates["Emerg. Relation"] = form.emRel;
    updates["Emerg. Email"] = form.emEmail;
    updates["Emerg. Address"] = form.emAddress;
    updates["Emerg. Apt"] = form.emApt;
    updates["Emerg. City"] = form.emCity;
    updates["Emerg. State"] = form.emState;
    updates["Emerg. Zip"] = form.emZip;
    updates["Criminal Conviction?"] = form.criminalHistory || "No";
    updates["Conviction Details"] = form.criminalExplain || "";
    updates["Signature Name"] = form.signName;
    updates["Signature Date"] = new Date();
    updates["Agreed to Terms"] = "Yes";

    // Application Status
    updates["App Status"] = "Application Completed";

    // Build Row Values dynamically
    // Start from Column 8 ("App Status") or 10 ("Middle Int")?
    // The previous code started at Col 10 for bulk, and set Col 9 ("App Status") separately.
    // Let's iterate all headers and update where we have data.
    // But setValues is faster.
    // We will update from "App Status" (Col 9) to the end of the sheet or known headers.

    // Columns: ... | App Status | Middle Int | ...
    // Indices: ... |     8      |     9      | ...

    // Get headers again (ensure fresh)
    const currentHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const startIndex = 8; // "App Status" is index 8 (col 9)
    const relevantHeaders = currentHeaders.slice(startIndex);

    const rowValues = relevantHeaders.map((h) => {
      if (updates.hasOwnProperty(h)) return updates[h];
      // Special case: if header is NOT in updates, do we leave it?
      // setValues overwrites. We must read the existing value if we want to preserve unknown columns?
      // But we already have 'data' (display values) loaded.
      // data[rowIndex] is valid.
      const headerIdx = currentHeaders.indexOf(h);
      if (headerIdx > -1) {
        // Check if we have specific logic for it (e.g. specialized fields saved below)
        // But for standard fields, if we didn't map it, maybe preserve it?
        // Actually, previous code overwrote a huge block.
        // Let's just return "" if it's one of OUR fields we missed, or preserve if unrelated.
        // Safest: return updates[h] !== undefined ? updates[h] : data[rowIndex][headerIdx];
        return updates[h] !== undefined
          ? updates[h]
          : data[rowIndex][headerIdx];
      }
      return "";
    });

    sheet
      .getRange(r, startIndex + 1, 1, rowValues.length)
      .setValues([rowValues]);

    // Save Banking Info & Last Reviewed
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const routingIdx = headers.indexOf("Routing Number");
    const accountIdx = headers.indexOf("Bank Account");
    const reviewIdx = headers.indexOf("Last Reviewed");

    if (routingIdx > -1)
      sheet.getRange(r, routingIdx + 1).setValue(form.routingNum || "");
    if (accountIdx > -1)
      sheet.getRange(r, accountIdx + 1).setValue(form.accountNum || "");
    if (reviewIdx > -1) sheet.getRange(r, reviewIdx + 1).setValue(new Date());

    // Save Marital Status Info
    const maritalStatusIdx = headers.indexOf("Marital Status");
    const spouseNameIdx = headers.indexOf("Spouse Name");

    if (maritalStatusIdx > -1)
      sheet
        .getRange(r, maritalStatusIdx + 1)
        .setValue(form.maritalStatus || "");
    if (spouseNameIdx > -1)
      sheet.getRange(r, spouseNameIdx + 1).setValue(form.spouseName || "");

    // Save Emergency Contact Extra Info
    const emEmailIdx = headers.indexOf("Emerg. Email");
    const emAddressIdx = headers.indexOf("Emerg. Address");

    if (emEmailIdx > -1)
      sheet.getRange(r, emEmailIdx + 1).setValue(form.emEmail || "");
    if (emAddressIdx > -1)
      sheet.getRange(r, emAddressIdx + 1).setValue(form.emAddress || "");

    const emAptIdx = headers.indexOf("Emerg. Apt");
    const emCityIdx = headers.indexOf("Emerg. City");
    const emStateIdx = headers.indexOf("Emerg. State");
    const emZipIdx = headers.indexOf("Emerg. Zip");

    if (emAptIdx > -1)
      sheet.getRange(r, emAptIdx + 1).setValue(form.emApt || "");
    if (emCityIdx > -1)
      sheet.getRange(r, emCityIdx + 1).setValue(form.emCity || "");
    if (emStateIdx > -1)
      sheet.getRange(r, emStateIdx + 1).setValue(form.emState || "");
    if (emZipIdx > -1)
      sheet.getRange(r, emZipIdx + 1).setValue(form.emZip || "");

    // Save Vaccination Info
    const covidIdx = headers.indexOf("Covid Vaccine");
    const fluIdx = headers.indexOf("Flu Vaccine");

    if (covidIdx > -1) {
      const val =
        form.covidVaccine === "Yes"
          ? `Yes (${form.covidDoses || "Unspecified"})`
          : form.covidVaccine || "No";
      sheet.getRange(r, covidIdx + 1).setValue(val);
    }
    if (fluIdx > -1) {
      sheet.getRange(r, fluIdx + 1).setValue(form.fluVaccine || "No");
      // Save Years of Experience
      const expIdx = headers.indexOf("Years of Experience");
      if (expIdx > -1) {
        sheet.getRange(r, expIdx + 1).setValue(form.yearsOfExperience || "");
      }
    }

    // Save Username
    const usernameIdx = headers.indexOf("Username");
    if (usernameIdx > -1) {
      sheet.getRange(r, usernameIdx + 1).setValue(form.username || "");
    }

    // Save Detailed Employment History
    // Helper to save if Index exists
    const save = (header, val) => {
      const idx = headers.indexOf(header);
      if (idx > -1) sheet.getRange(r, idx + 1).setValue(val || "");
    };

    if (form.emp1) {
      save("Emp1 Company", form.emp1.company);
      save("Emp1 Title", form.emp1.title);
      save("Emp1 Supervisor", form.emp1.supervisor);
      save("Emp1 Phone", form.emp1.phone);
      save("Emp1 Duties", form.emp1.duties);
    }
    if (form.emp2) {
      save("Emp2 Company", form.emp2.company);
      save("Emp2 Title", form.emp2.title);
      save("Emp2 Supervisor", form.emp2.supervisor);
      save("Emp2 Phone", form.emp2.phone);
      save("Emp2 Duties", form.emp2.duties);
    }
    if (form.emp3) {
      save("Emp3 Company", form.emp3.company);
      save("Emp3 Title", form.emp3.title);
      save("Emp3 Supervisor", form.emp3.supervisor);
      save("Emp3 Phone", form.emp3.phone);
      save("Emp3 Duties", form.emp3.duties);
    }

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

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const reviewIdx = headers.indexOf("Last Reviewed");
  const contractIdx = headers.indexOf("Contract Link");
  const w9Idx = headers.indexOf("W9 Link");
  const backgroundIdx = headers.indexOf("Background Link");
  const paymentIdx = headers.indexOf("Payment Method");
  const interviewIdx = headers.indexOf("Interview Status");
  const backgroundCheckIdx = headers.indexOf("Background Check");

  // Pre-fetch Last Client Seen Map
  const lastClientMap = getAllLastClientsSeen();

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
      city: row[16] || "--",
      zip: row[18] || "",
      appStatus: row[8], // App Status
      interviewStatus: interviewIdx > -1 ? row[interviewIdx] : "",
      backgroundCheck: backgroundCheckIdx > -1 ? row[backgroundCheckIdx] : "",
      lastReviewed: reviewIdx > -1 ? row[reviewIdx] : "--",
      lastClientSeen: lastClientMap[row[0].trim()] || "--",
      contractLink: contractIdx > -1 ? row[contractIdx] : "",
      w9Link: w9Idx > -1 ? row[w9Idx] : "",
      backgroundLink: backgroundIdx > -1 ? row[backgroundIdx] : "",
      hasPaymentInfo: paymentIdx > -1 && row[paymentIdx] ? true : false,
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
    (r, i) => i > 0 && String(r[0]).trim().toUpperCase() === searchId,
  );

  if (rowIndex === -1) return null;

  const row = data[rowIndex];
  let caregiver = {};
  headers.forEach((header, index) => {
    caregiver[header.trim()] = row[index];
  });

  // Add Last Client Seen
  const lastClientMap = getAllLastClientsSeen();
  caregiver["Last Client Seen"] = lastClientMap[searchId] || "--";

  return caregiver;
}

// Helper to get Last Client Seen Map
function getAllLastClientsSeen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shiftSheet = ss.getSheetByName("Shifts_DB");
  const clientSheet = ss.getSheetByName("Clients_DB");

  if (!shiftSheet || !clientSheet) return {};

  // Get Clients Map: ID -> Name
  const clientData = clientSheet.getDataRange().getDisplayValues();
  const clientMap = {};
  // Client ID=0, First=1, Middle=2, Last=3
  for (let i = 1; i < clientData.length; i++) {
    const row = clientData[i];
    clientMap[row[0]] = row[1] + " " + row[3];
  }

  // Get Shifts
  const shiftData = shiftSheet.getDataRange().getValues();
  // Shift ID=0, Client ID=1, Caregiver ID=2, Start Date=3

  const lastSeenMap = {}; // CaregiverID -> { date, clientName }

  for (let i = 1; i < shiftData.length; i++) {
    const row = shiftData[i];
    const cid = String(row[1]);
    const gid = String(row[2]);
    const date = new Date(row[3]);

    if (!lastSeenMap[gid] || date > lastSeenMap[gid].date) {
      lastSeenMap[gid] = {
        date: date,
        clientName: clientMap[cid] || cid,
      };
    }
  }

  const result = {};
  for (const key in lastSeenMap) {
    result[key] = lastSeenMap[key].clientName;
  }
  return result;
}

// 5. NEW: UPDATE STAGE STATUS
function updateCaregiverStage(id, stage, value) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getDisplayValues();
  const headers = data[0];

  const searchId = String(id).trim().toUpperCase();
  const rowIndex = data.findIndex(
    (r, i) => i > 0 && String(r[0]).trim().toUpperCase() === searchId,
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

  // If failed, move to Archived
  if (value === "Failed") {
    const appStatusIdx = headers.indexOf("App Status");
    if (appStatusIdx > -1) {
      sheet.getRange(r, appStatusIdx + 1).setValue("Archived");
    }
  }

  // Check for Activation + Payment to set Started Date
  if (stage === "Active" && value === "Active") {
    const payMethodIdx = headers.indexOf("Payment Method");
    const startedDateIdx = headers.indexOf("Started Date");

    if (payMethodIdx > -1 && startedDateIdx > -1) {
      const payMethod = data[rowIndex][payMethodIdx];
      const startedDate = data[rowIndex][startedDateIdx];

      if (payMethod && !startedDate) {
        sheet.getRange(r, startedDateIdx + 1).setValue(new Date());
      }
    }
  }

  return { success: true, newValue: value };
}

function restoreCaregiverFromArchive(id) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getDisplayValues();
  const headers = data[0];

  const searchId = String(id).trim().toUpperCase();
  const rowIndex = data.findIndex(
    (r, i) => i > 0 && String(r[0]).trim().toUpperCase() === searchId,
  );

  if (rowIndex === -1) return { success: false, message: "ID not found" };

  const r = rowIndex + 1;

  const interviewIdx = headers.indexOf("Interview Status");
  const backgroundIdx = headers.indexOf("Background Check");
  const appStatusIdx = headers.indexOf("App Status");

  if (interviewIdx > -1)
    sheet.getRange(r, interviewIdx + 1).setValue("Pending");
  if (backgroundIdx > -1)
    sheet.getRange(r, backgroundIdx + 1).setValue("Pending");
  if (appStatusIdx > -1)
    sheet.getRange(r, appStatusIdx + 1).setValue("Application Completed");

  return { success: true, message: "Caregiver restored to Interview stage." };
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

function submitPaymentDetails(form) {
  try {
    const sheet = getOrCreateSheet();
    const targetId = String(form.caregiverId).trim().toUpperCase();
    const data = sheet.getDataRange().getDisplayValues();
    const headers = data[0];

    const rowIndex = data.findIndex(
      (r) => String(r[0]).trim().toUpperCase() === targetId,
    );

    if (rowIndex === -1)
      return { success: false, message: "Caregiver not found" };
    const r = rowIndex + 1;

    // Helper to set value by header name
    const setVal = (header, val) => {
      const idx = headers.indexOf(header);
      if (idx > -1) sheet.getRange(r, idx + 1).setValue(val || "");
    };

    setVal("Payment Method", form.paymentMethod);

    // Only save bank details if method is Direct Deposit or Bank Deposit
    if (["Direct Deposit", "Bank Deposit"].includes(form.paymentMethod)) {
      setVal("Bank Name", form.bankName);
      setVal("Account Holder Name", form.holderName);
      setVal("Account Type", form.accountType);
      setVal("Holder Type", form.holderType);
      setVal("Bank Account", form.accountNum);
      setVal("Routing Number", form.routingNum);
    } else if (form.paymentMethod === "Check") {
      // Handle Check Uploads
      const parentFolderId = "1q6_Gyjvj5FZxMMnXUQ3MhiKT2gF9KD8L";

      // Get caregiver details for folder creation/retrieval
      const firstNameIdx = headers.indexOf("First Name");
      const lastNameIdx = headers.indexOf("Last Name");
      const details = {
        "First Name": data[rowIndex][firstNameIdx],
        "Last Name": data[rowIndex][lastNameIdx],
      };

      let folder;
      try {
        folder = getCaregiverFolder(parentFolderId, details);
      } catch (err) {
        return {
          success: false,
          message: "Error accessing/creating Drive folder: " + err,
        };
      }

      // Upload ID Proof
      if (
        form.checkIdUpload &&
        form.checkIdUpload.getName &&
        form.checkIdUpload.getName() !== ""
      ) {
        const idBlob = form.checkIdUpload;
        const idFile = folder.createFile(idBlob);
        idFile.setName(
          `CHECK_ID_PROOF - ${details["First Name"]} ${
            details["Last Name"]
          } - ${idBlob.getName()}`,
        );
        idFile.setSharing(
          DriveApp.Access.ANYONE_WITH_LINK,
          DriveApp.Permission.VIEW,
        );
        setVal("Check ID Proof", idFile.getUrl());
      }

      // Upload Address Proof
      if (
        form.checkAddressUpload &&
        form.checkAddressUpload.getName &&
        form.checkAddressUpload.getName() !== ""
      ) {
        const addrBlob = form.checkAddressUpload;
        const addrFile = folder.createFile(addrBlob);
        addrFile.setName(
          `CHECK_ADDRESS_PROOF - ${details["First Name"]} ${
            details["Last Name"]
          } - ${addrBlob.getName()}`,
        );
        addrFile.setSharing(
          DriveApp.Access.ANYONE_WITH_LINK,
          DriveApp.Permission.VIEW,
        );
        setVal("Check Address Proof", addrFile.getUrl());
      }
    } else if (["Zelle", "Apple Pay"].includes(form.paymentMethod)) {
      setVal("Digital Name", form.digitalFullName);
      setVal("Digital Phone", form.digitalPhone);
      setVal("Digital Email", form.digitalEmail);
    } else {
      // Clear bank details if switching to other methods?
      // Or keep them? Let's keep them but maybe clear the method specific ones if needed.
      // For now, just save what is sent.
    }

    // Check for Activation + Payment to set Started Date
    const statusIdx = headers.indexOf("Status");
    const startedDateIdx = headers.indexOf("Started Date");

    if (statusIdx > -1 && startedDateIdx > -1) {
      const status = data[rowIndex][statusIdx];
      const startedDate = data[rowIndex][startedDateIdx];

      if (status === "Active" && !startedDate) {
        sheet.getRange(r, startedDateIdx + 1).setValue(new Date());
      }
    }

    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}
