const CLIENT_SHEET_NAME = "Clients_DB";

function getOrCreateClientSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CLIENT_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CLIENT_SHEET_NAME);
    const headers = [
      "Client ID",
      "First Name",
      "Middle Name",
      "Last Name",
      "Status",
      "DOB",
      "Gender",
      "Email",
      "Phone",
      "Type",
      "Address",
      "City",
      "Zip",
      "Emerg Name",
      "Emerg Relation",
      "Emerg Email",
      "Emerg Phone",
      "Emerg Address",
      "Emerg City",
      "Emerg Zip",
      "Living Alone",
      "Languages",
      "Created At",
      "Last Reviewed"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet
      .getRange(1, 1, 1, headers.length)
      .setBackground("#65c027")
      .setFontColor("white")
      .setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else {
    // Migration: Add Last Reviewed if missing
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (!headers.includes("Last Reviewed")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Last Reviewed");
    }
  }
  return sheet;
}

function handleClientSubmission(data) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  
  // Generate ID: CL + Random 4 digits
  // Example: CL1234
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  const newId = `CL${randomPart}`;

  // Format Array for Sheet
  const rowData = [
    newId,
    data.firstName,
    data.middleName,
    data.lastName,
    data.status,
    data.dob,
    data.gender,
    data.email,
    data.phone,
    data.type,
    data.address,
    data.city,
    data.zip,
    data.emName,
    data.emRel,
    data.emEmail,
    data.emPhone,
    data.emAddress,
    data.emCity,
    data.emZip,
    data.livingAlone,
    data.languages,
    new Date(),
    new Date() // Initial Last Reviewed
  ];

  sheet.appendRow(rowData);

  // Send Welcome Email
  sendClientWelcomeEmail(data, newId);

  return { success: true, message: "Client added successfully!", id: newId };
}

function getClientList() {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  // Get all data as text
  const data = sheet
    .getRange(2, 1, lastRow - 1, sheet.getLastColumn())
    .getDisplayValues();

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const reviewIdx = headers.indexOf("Last Reviewed");

  return data
    .filter((row) => row[0] !== "")
    .map((row) => ({
      id: row[0],
      name: `${row[1]} ${row[3]}`, // First + Last
      email: row[7],
      phone: row[8],
      status: row[4],
      type: row[9],
      city: row[11],
      zip: row[12],
      lastReviewed: reviewIdx > -1 ? row[reviewIdx] : "--"
    }))
    .reverse();
}

function getClientDetails(id) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;

  const data = sheet.getRange(2, 1, lastRow - 1, 23).getDisplayValues();
  const row = data.find((r) => r[0] === id);

  if (!row) return null;

  return {
    id: row[0],
    firstName: row[1],
    middleName: row[2],
    lastName: row[3],
    status: row[4],
    dob: row[5],
    gender: row[6],
    email: row[7],
    phone: row[8],
    type: row[9],
    address: row[10],
    city: row[11],
    zip: row[12],
    emName: row[13],
    emRel: row[14],
    emEmail: row[15],
    emPhone: row[16],
    emAddress: row[17],
    emCity: row[18],
    emZip: row[19],
    livingAlone: row[20],
    languages: row[21],
    createdAt: row[22],
  };
}

function updateClient(data) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "No clients found." };

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat();
  const rowIndex = ids.indexOf(data.id);

  if (rowIndex === -1) {
    return { success: false, message: "Client not found." };
  }

  const rowNum = rowIndex + 2; // +2 because of header and 0-based index

  // Update columns 2-22 (First Name to Languages)
  // Note: Created At (col 23) is not updated
  const rowData = [
    data.firstName,
    data.middleName,
    data.lastName,
    data.status,
    data.dob,
    data.gender,
    data.email,
    data.phone,
    data.type,
    data.address,
    data.city,
    data.zip,
    data.emName,
    data.emRel,
    data.emEmail,
    data.emPhone,
    data.emAddress,
    data.emCity,
    data.emZip,
    data.livingAlone,
    data.languages,
  ];

  sheet.getRange(rowNum, 2, 1, rowData.length).setValues([rowData]);

  // Update Last Reviewed
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const reviewIdx = headers.indexOf("Last Reviewed");
  if (reviewIdx > -1) {
    sheet.getRange(rowNum, reviewIdx + 1).setValue(new Date());
  }

  return { success: true, message: "Client updated successfully!" };
}
