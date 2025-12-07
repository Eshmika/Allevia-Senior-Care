// CaregiverRepository.gs

function getNextCaregiverCode() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Caregivers');
  if (!sheet) return 'CG-1001';
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 'CG-1001';
  const lastId = sheet.getRange(lastRow, 1).getValue();
  if (typeof lastId === 'string' && lastId.startsWith('CG-')) {
    const num = parseInt(lastId.replace('CG-', ''));
    return 'CG-' + (num + 1);
  }
  return 'CG-' + (Date.now().toString().slice(-4));
}

function saveCaregiverData(formData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Caregivers');

  if (!sheet) {
    sheet = ss.insertSheet('Caregivers');
    const headers = [
      'Caregiver Code', 'Photo URL', 'First Name', 'Middle Name', 'Last Name', 
      'DOB', 'Age', 'SSN/EIN', 'Gender', 'Marital Status', 
      'Primary Lang', 'Status', 'Active Date', 'Deactive Date', 
      'Payment Method', 'Account #', 'Routing #', 'Agreement Status',
      'Email', 'Email 2', 'Cell Phone', 'Home Phone',
      'Address', 'City', 'State', 'Zip',
      'Title', 'Cert 1', 'Cert 2', 'Cert 3', 'Able to Drive',
      'Emerg Relation', 'Emerg Name', 'Emerg Email', 'Emerg Phone 1', 'Emerg Phone 2',
      'Emerg Addr', 'Emerg City', 'Emerg State', 'Emerg Zip',
      'Pref Gender', 'Max Height', 'Max Weight', 'Pets Pref', 'Acceptable Pets', 
      'Smoking Pref', 'Drink Pref',
      'Vax Covid', 'Vax Flu',
      'Lang 1', 'Lang 2', 'Lang 3',
      'Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5', 'Skill 6'
    ];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  const val = (k) => formData[k] || '';

  const rowData = [
    val('cgCode') || getNextCaregiverCode(),
    val('photoUrl'),
    val('firstName'), val('middleName'), val('lastName'),
    val('dob'), val('age'), val('ssn'), val('gender'), val('maritalStatus'),
    val('primaryLang'), val('status'), val('activeDate'), val('deactiveDate'),
    val('paymentMethod'), val('accountNum'), val('routingNum'), val('agreementStatus'),
    val('email'), val('email2'), val('cellPhone'), val('homePhone'),
    val('address'), val('city'), val('state'), val('zip'),
    val('title'), val('cert1'), val('cert2'), val('cert3'), val('drive'),
    val('emergRelation'), val('emergName'), val('emergEmail'), val('emergPhone1'), val('emergPhone2'),
    val('emergAddr'), val('emergCity'), val('emergState'), val('emergZip'),
    val('prefGender'), val('maxHeight'), val('maxWeight'), val('petsPref'), val('accPets'),
    val('smokePref'), val('drinkPref'),
    val('vaxCovid'), val('vaxFlu'),
    val('lang1'), val('lang2'), val('lang3'),
    val('skill1'), val('skill2'), val('skill3'), val('skill4'), val('skill5'), val('skill6')
  ];

  if (val('cgCode')) {
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
    const index = ids.indexOf(val('cgCode'));
    if (index !== -1) {
      sheet.getRange(index + 2, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'Caregiver Updated', code: val('cgCode') };
    }
  }

  sheet.appendRow(rowData);
  return { success: true, message: 'Caregiver Created', code: rowData[0] };
}

// --- GET CAREGIVERS WITH FILTERS ---
function getCaregivers(page, pageSize, search, statusFilter, titleFilter) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Caregivers');
  if (!sheet || sheet.getLastRow() <= 1) return { list: [], total: 0 };

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  
  let filtered = data.filter(row => {
    const code = String(row[0]).toLowerCase();
    const fname = String(row[2]).toLowerCase();
    const lname = String(row[4]).toLowerCase();
    
    // Status is Col 12 (index 11)
    const status = String(row[11]); 
    // Title is Col 27 (index 26)
    const title = String(row[26]);

    // Search Logic
    const s = search ? search.toLowerCase() : '';
    const matchesSearch = !s || code.includes(s) || fname.includes(s) || lname.includes(s);
    
    // Filter Logic
    const matchesStatus = !statusFilter || status === statusFilter;
    const matchesTitle = !titleFilter || title === titleFilter;

    return matchesSearch && matchesStatus && matchesTitle;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const pagedData = filtered.slice(start, start + pageSize);

  const list = pagedData.map(row => ({
    code: row[0],
    photo: row[1],
    name: `${row[2]} ${row[4]}`,
    title: row[26],
    status: row[11],
    phone: row[20],
    email: row[18]
  }));

  return { list: list, total: total };
}

function getCaregiverDetails(code) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Caregivers');
  if(!sheet) return null;
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === code);
  if (!row) return null;

  return {
    cgCode: row[0], photoUrl: row[1],
    firstName: row[2], middleName: row[3], lastName: row[4],
    dob: Utilities.formatDate(new Date(row[5]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    age: row[6], ssn: row[7], gender: row[8], maritalStatus: row[9],
    primaryLang: row[10], status: row[11],
    activeDate: Utilities.formatDate(new Date(row[12]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    deactiveDate: row[13] ? Utilities.formatDate(new Date(row[13]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
    paymentMethod: row[14], accountNum: row[15], routingNum: row[16], agreementStatus: row[17],
    email: row[18], email2: row[19], cellPhone: row[20], homePhone: row[21],
    address: row[22], city: row[23], state: row[24], zip: row[25],
    title: row[26], cert1: row[27], cert2: row[28], cert3: row[29], drive: row[30],
    emergRelation: row[31], emergName: row[32], emergEmail: row[33], emergPhone1: row[34], emergPhone2: row[35],
    emergAddr: row[36], emergCity: row[37], emergState: row[38], emergZip: row[39],
    prefGender: row[40], maxHeight: row[41], maxWeight: row[42], petsPref: row[43], accPets: row[44],
    smokePref: row[45], drinkPref: row[46],
    vaxCovid: row[47], vaxFlu: row[48],
    lang1: row[49], lang2: row[50], lang3: row[51],
    skill1: row[52], skill2: row[53], skill3: row[54], skill4: row[55], skill5: row[56], skill6: row[57]
  };
}