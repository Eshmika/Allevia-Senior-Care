// ClientRepository.gs - Database interactions

function getSheet() {
  const SHEET_NAME = 'Clients';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Headers are added in saveClientData if row count is 0
  }
  return sheet;
}

function getNextClientCode() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 'CL-1001';
  
  const lastId = sheet.getRange(lastRow, 1).getValue();
  if (typeof lastId === 'string' && lastId.startsWith('CL-')) {
    const num = parseInt(lastId.replace('CL-', ''));
    return 'CL-' + (num + 1);
  }
  return 'CL-' + (Date.now().toString().slice(-4));
}

function saveClientData(formData) {
  const sheet = getSheet();
  const useLiving = formData.billingSame === 'true';

  if (sheet.getLastRow() === 0) {
    const headers = [
      'Client Code', 'Photo URL', 'First Name', 'Middle Name', 'Last Name', 
      'DOB', 'Age', 'SSN', 'Gender', 'Marital Status', 
      'Primary Lang', 'Status', 'Active Date', 'Deactive Date', 
      'Payment Type', 'Agreement Status', 
      'Email 1', 'Email 2', 'Cell Phone', 'Home Phone',
      'Living Addr', 'Living City', 'Living State', 'Living Zip',
      'Billing Addr', 'Billing City', 'Billing State', 'Billing Zip',
      'Con2 First Name', 'Con2 Middle', 'Con2 Last Name', 
      'Con2 Email', 'Con2 Cell', 'Con2 Home', 
      'Con2 Addr', 'Con2 City', 'Con2 State', 'Con2 Zip',
      'Emerg Relation', 'Emerg First Name', 'Emerg Last Name', 
      'Emerg Email', 'Emerg Phone 1', 'Emerg Phone 2', 
      'Emerg Addr', 'Emerg City', 'Emerg State', 'Emerg Zip',
      'Assess Date', 'Height', 'Weight', 'Mental Status', 
      'Diagnosis', 'Service Needs', 'Goals',
      'Alone?', 'Alone Note', 'Pets?', 'Pets Note', 
      'Smoke?', 'Smoke Note', 'Drink?', 'Drink Note',
      'Can Direct?', 'Self Admin?', 'Taking Meds?', 'Allergies?', 
      'Overseeing Resp?', 'Overseeing Note',
      'Dr Name', 'Dr Location', 'Dr Phone',
      'Pharm Name', 'Pharm Location', 'Pharm Phone',
      'Hosp Name', 'Hosp Location', 'Hosp Phone',
      'Vax Covid', 'Vax Flu',
      'Lang 1', 'Lang 2', 'Lang 3',
      'Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5', 'Skill 6'
    ];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  const rowData = [
    formData.clientCode || getNextClientCode(),
    formData.photoUrl || '',
    formData.firstName, formData.middleName, formData.lastName,
    formData.dob, formData.age, formData.ssn, formData.gender, formData.maritalStatus,
    formData.primaryLang, formData.status, formData.activeDate, formData.deactiveDate,
    formData.paymentType, formData.agreementStatus,
    formData.email, formData.email2, formData.cellPhone, formData.homePhone,
    formData.livingAddress, formData.livingCity, formData.livingState, formData.livingZip,
    useLiving ? formData.livingAddress : formData.billingAddress,
    useLiving ? formData.livingCity : formData.billingCity,
    useLiving ? formData.livingState : formData.billingState,
    useLiving ? formData.livingZip : formData.billingZip,
    formData.con2FirstName, formData.con2MiddleName, formData.con2LastName,
    formData.con2Email, formData.con2Cell, formData.con2Home,
    formData.con2Addr, formData.con2City, formData.con2State, formData.con2Zip,
    formData.emergRelation, formData.emergFirstName, formData.emergLastName,
    formData.emergEmail, formData.emergPhone1, formData.emergPhone2,
    formData.emergAddr, formData.emergCity, formData.emergState, formData.emergZip,
    formData.assessDate, formData.height, formData.weight, formData.mentalStatus,
    formData.diagnosis, formData.serviceNeeds, formData.goals,
    formData.livingAlone, formData.livingAloneNote,
    formData.pets, formData.petsNote,
    formData.smoke, formData.smokeNote,
    formData.drink, formData.drinkNote,
    formData.canDirect, formData.selfAdmin, formData.takingMeds, formData.allergies,
    formData.overseeingResp, formData.overseeingNote,
    formData.drName, formData.drLoc, formData.drPhone,
    formData.pharmName, formData.pharmLoc, formData.pharmPhone,
    formData.hospName, formData.hospLoc, formData.hospPhone,
    formData.vaxCovid, formData.vaxFlu,
    formData.lang1, formData.lang2, formData.lang3,
    formData.skill1, formData.skill2, formData.skill3, formData.skill4, formData.skill5, formData.skill6
  ];

  if (formData.clientCode) {
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
    const index = ids.indexOf(formData.clientCode);
    if (index !== -1) {
      sheet.getRange(index + 2, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'Client Updated', code: formData.clientCode };
    }
  }

  sheet.appendRow(rowData);
  return { success: true, message: 'Client Created', code: rowData[0] };
}

function getClients(page, pageSize, search, statusFilter, payFilter) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { clients: [], total: 0 };

  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  let filtered = data.filter(row => {
    const code = String(row[0]).toLowerCase();
    const fname = String(row[2]).toLowerCase();
    const lname = String(row[4]).toLowerCase();
    const status = String(row[11]);
    const pay = String(row[14]);

    // Flexible search logic
    const s = search ? search.toLowerCase() : '';
    const matchesSearch = !s || code.includes(s) || fname.includes(s) || lname.includes(s);
    
    // Strict filters
    const matchesStatus = !statusFilter || status === statusFilter;
    const matchesPay = !payFilter || pay === payFilter;

    return matchesSearch && matchesStatus && matchesPay;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const pagedData = filtered.slice(start, start + pageSize);

  const clients = pagedData.map(row => ({
    code: row[0],
    photo: row[1],
    name: `${row[2]} ${row[4]}`,
    status: row[11],
    payment: row[14],
    phone: row[18],
    email: row[16]
  }));

  return { clients: clients, total: total };
}

function getClientDetails(code) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const clientRow = data.find(r => r[0] === code);

  if (!clientRow) return null;

  return {
    clientCode: clientRow[0],
    photoUrl: clientRow[1],
    firstName: clientRow[2], middleName: clientRow[3], lastName: clientRow[4],
    dob: Utilities.formatDate(new Date(clientRow[5]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    age: clientRow[6], ssn: clientRow[7], gender: clientRow[8], maritalStatus: clientRow[9],
    primaryLang: clientRow[10], status: clientRow[11], 
    activeDate: Utilities.formatDate(new Date(clientRow[12]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    deactiveDate: clientRow[13] ? Utilities.formatDate(new Date(clientRow[13]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
    paymentType: clientRow[14], agreementStatus: clientRow[15],
    email: clientRow[16], email2: clientRow[17], cellPhone: clientRow[18], homePhone: clientRow[19],
    livingAddress: clientRow[20], livingCity: clientRow[21], livingState: clientRow[22], livingZip: clientRow[23],
    billingAddress: clientRow[24], billingCity: clientRow[25], billingState: clientRow[26], billingZip: clientRow[27],
    con2FirstName: clientRow[28], con2MiddleName: clientRow[29], con2LastName: clientRow[30],
    con2Email: clientRow[31], con2Cell: clientRow[32], con2Home: clientRow[33],
    con2Addr: clientRow[34], con2City: clientRow[35], con2State: clientRow[36], con2Zip: clientRow[37],
    emergRelation: clientRow[38], emergFirstName: clientRow[39], emergLastName: clientRow[40],
    emergEmail: clientRow[41], emergPhone1: clientRow[42], emergPhone2: clientRow[43],
    emergAddr: clientRow[44], emergCity: clientRow[45], emergState: clientRow[46], emergZip: clientRow[47],
    assessDate: clientRow[48] ? Utilities.formatDate(new Date(clientRow[48]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
    height: clientRow[49], weight: clientRow[50], mentalStatus: clientRow[51],
    diagnosis: clientRow[52], serviceNeeds: clientRow[53], goals: clientRow[54],
    livingAlone: clientRow[55], livingAloneNote: clientRow[56],
    pets: clientRow[57], petsNote: clientRow[58],
    smoke: clientRow[59], smokeNote: clientRow[60],
    drink: clientRow[61], drinkNote: clientRow[62],
    canDirect: clientRow[63], selfAdmin: clientRow[64], takingMeds: clientRow[65], allergies: clientRow[66],
    overseeingResp: clientRow[67], overseeingNote: clientRow[68],
    drName: clientRow[69], drLoc: clientRow[70], drPhone: clientRow[71],
    pharmName: clientRow[72], pharmLoc: clientRow[73], pharmPhone: clientRow[74],
    hospName: clientRow[75], hospLoc: clientRow[76], hospPhone: clientRow[77],
    vaxCovid: clientRow[78], vaxFlu: clientRow[79],
    lang1: clientRow[80], lang2: clientRow[81], lang3: clientRow[82],
    skill1: clientRow[83], skill2: clientRow[84], skill3: clientRow[85], skill4: clientRow[86], skill5: clientRow[87], skill6: clientRow[88]
  };
}