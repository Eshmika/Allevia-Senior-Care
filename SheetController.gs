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
      "Bank Account",
      "Last Reviewed",
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

    // Add Billing Address Columns
    const billingHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    if (!billingHeaders.includes("Billing Address")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Billing Address");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Billing City");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Billing State");
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Billing Zip");
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

    // Save Billing Info
    const billingAddrIdx = headers.indexOf("Billing Address");
    const billingCityIdx = headers.indexOf("Billing City");
    const billingStateIdx = headers.indexOf("Billing State");
    const billingZipIdx = headers.indexOf("Billing Zip");

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

    if (billingAddrIdx > -1)
      sheet.getRange(r, billingAddrIdx + 1).setValue(form.billingAddress || "");
    if (billingCityIdx > -1)
      sheet.getRange(r, billingCityIdx + 1).setValue(form.billingCity || "");
    if (billingStateIdx > -1)
      sheet.getRange(r, billingStateIdx + 1).setValue(form.billingState || "");
    if (billingZipIdx > -1)
      sheet.getRange(r, billingZipIdx + 1).setValue(form.billingZip || "");

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
      city: row[15] || "--",
      zip: row[17] || "",
      appStatus: row[8], // App Status
      interviewStatus: row[53], // Interview Status (Check index)
      backgroundCheck: row[54], // Background Check (Check index)
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
    (r, i) => i > 0 && String(r[0]).trim().toUpperCase() === searchId
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

function submitPaymentDetails(form) {
  try {
    const sheet = getOrCreateSheet();
    const targetId = String(form.caregiverId).trim().toUpperCase();
    const data = sheet.getDataRange().getDisplayValues();
    const headers = data[0];

    const rowIndex = data.findIndex(
      (r) => String(r[0]).trim().toUpperCase() === targetId
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
          } - ${idBlob.getName()}`
        );
        idFile.setSharing(
          DriveApp.Access.ANYONE_WITH_LINK,
          DriveApp.Permission.VIEW
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
          } - ${addrBlob.getName()}`
        );
        addrFile.setSharing(
          DriveApp.Access.ANYONE_WITH_LINK,
          DriveApp.Permission.VIEW
        );
        setVal("Check Address Proof", addrFile.getUrl());
      }
    } else {
      // Clear bank details if switching to other methods?
      // Or keep them? Let's keep them but maybe clear the method specific ones if needed.
      // For now, just save what is sent.
    }

    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}
