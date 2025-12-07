// ShiftRepository.gs - Handles Scheduling & Matching

function getNextInvoiceId() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Shifts');
  if (!sheet) return 'INV-1001';
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 'INV-1001';
  
  const lastId = sheet.getRange(lastRow, 1).getValue(); // Column A
  if (typeof lastId === 'string' && lastId.startsWith('INV-')) {
    const num = parseInt(lastId.replace('INV-', ''));
    return 'INV-' + (num + 1);
  }
  return 'INV-' + Date.now().toString().slice(-4);
}

// Fetch Lists for Dropdowns with MATCHING DATA included
function getShiftDropdownData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cSheet = ss.getSheetByName('Clients');
  const cgSheet = ss.getSheetByName('Caregivers');
  
  let clients = [];
  let caregivers = [];

  // 1. Get Clients (Cols: Code=0, Name=2+4, Pets=57, Smoke=59, Drink=61 - indices from ClientRepository save order)
  if (cSheet && cSheet.getLastRow() > 1) {
    const data = cSheet.getRange(2, 1, cSheet.getLastRow()-1, cSheet.getLastColumn()).getValues();
    clients = data.map(r => ({
      code: r[0],
      name: `${r[2]} ${r[4]}`,
      firstName: r[2],
      lastName: r[4],
      pets: r[57], // Index 57 is 'Pets?'
      smoke: r[59], // Index 59 is 'Smoke?'
      drink: r[61]  // Index 61 is 'Drink?'
    }));
  }

  // 2. Get Caregivers (Cols: Code=0, Name=2+4, PetsPref=43, SmokePref=45, DrinkPref=46)
  if (cgSheet && cgSheet.getLastRow() > 1) {
    const data = cgSheet.getRange(2, 1, cgSheet.getLastRow()-1, cgSheet.getLastColumn()).getValues();
    caregivers = data.map(r => ({
      code: r[0],
      name: `${r[2]} ${r[4]}`,
      firstName: r[2],
      lastName: r[4],
      pets: r[43],
      smoke: r[45],
      drink: r[46]
    }));
  }

  return { clients, caregivers, nextInvoice: getNextInvoiceId() };
}

function saveShiftData(formData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Shifts');

  if (!sheet) {
    sheet = ss.insertSheet('Shifts');
    const headers = [
      'Invoice #', 'Client Code', 'Client Name', 'Caregiver Code', 'Caregiver Name',
      'Start Date', 'End Date', 'Clock In', 'Clock Out', 'Total Hours',
      'Rate Type', 'Service', 'Type',
      'Client Rate', 'Caregiver Rate', 'Total Client Amt', 'Total Caregiver Amt', 'Profit',
      'Matching Notes'
    ];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  const rowData = [
    formData.invoiceId || getNextInvoiceId(),
    formData.clientCode,
    formData.clientName,
    formData.cgCode,
    formData.cgName,
    formData.startDate,
    formData.endDate,
    formData.clockIn,
    formData.clockOut,
    formData.totalHours,
    formData.rateType,
    formData.serviceType,
    formData.shiftType,
    formData.clientRate,
    formData.cgRate,
    formData.totalClientAmt,
    formData.totalCgAmt,
    formData.profit,
    formData.matchNotes
  ];

  sheet.appendRow(rowData);
  return { success: true, message: 'Shift Scheduled Successfully!', invoice: rowData[0] };
}