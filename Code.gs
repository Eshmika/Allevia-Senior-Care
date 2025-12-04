function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Care Admin Panel')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- CONFIG ---
const SHEET_NAME = 'Clients';

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add Headers if new
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
  return sheet;
}

// --- ID GENERATION ---
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

// --- SAVE / UPDATE ---
function saveClientData(formData) {
  const sheet = getSheet();
  
  // Logic: Billing same as Living?
  const useLiving = formData.billingSame === 'true';

  // Array map matches header order
  const rowData = [
    formData.clientCode || getNextClientCode(), // Use existing code if updating, else new
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

  // Check if updating (clientCode exists in sheet)
  if (formData.clientCode) {
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
    const index = ids.indexOf(formData.clientCode);
    if (index !== -1) {
      // Update existing row (row index + 2 because of header and 0-index)
      sheet.getRange(index + 2, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'Client Updated', code: formData.clientCode };
    }
  }

  // Create New
  sheet.appendRow(rowData);
  return { success: true, message: 'Client Created', code: rowData[0] };
}

// --- DIRECTORY: SEARCH & FILTER ---
function getClients(page, pageSize, search, statusFilter, payFilter) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { clients: [], total: 0 };

  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  // Filter Data
  let filtered = data.filter(row => {
    const code = String(row[0]).toLowerCase();
    const fname = String(row[2]).toLowerCase();
    const lname = String(row[4]).toLowerCase();
    const status = String(row[11]); // Col 12
    const pay = String(row[14]);    // Col 15

    const matchesSearch = !search || code.includes(search.toLowerCase()) || fname.includes(search.toLowerCase()) || lname.includes(search.toLowerCase());
    const matchesStatus = !statusFilter || status === statusFilter;
    const matchesPay = !payFilter || pay === payFilter;

    return matchesSearch && matchesStatus && matchesPay;
  });

  const total = filtered.length;
  
  // Pagination
  const start = (page - 1) * pageSize;
  const pagedData = filtered.slice(start, start + pageSize);

  // Map to simple objects for Table
  const clients = pagedData.map(row => ({
    code: row[0],
    photo: row[1],
    name: `${row[2]} ${row[4]}`, // First + Last
    status: row[11],
    payment: row[14],
    phone: row[18], // Cell Phone
    email: row[16]
  }));

  return { clients: clients, total: total };
}

// --- GET FULL DETAILS ---
function getClientDetails(code) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  // Find row by Code (Col 0)
  // Headers are row 0
  const headers = data[0];
  const clientRow = data.find(r => r[0] === code);

  if (!clientRow) return null;

  // Convert array to object key-value based on headers
  // We map the keys used in the HTML form specifically
  // To keep it simple, we return a mapped object manually to match HTML 'name' attributes
  
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

// --- DASHBOARD STATS ---
function getDashboardStats() {
  const sheet = getSheet();
  if (sheet.getLastRow() <= 1) return { total: 0, active: 0, pending: 0 };
  const data = sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()).getValues();
  let active = 0, pending = 0;
  data.forEach(r => {
    if (r[11] === 'Active') active++;
    if (String(r[15]).includes('Needs')) pending++;
  });
  return { total: data.length, active, pending };
}

// --- EXPORT PDF ---
function exportClientToPdf(clientCode) {
  const c = getClientDetails(clientCode);
  if (!c) throw new Error("Client not found");

  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; font-size: 11px; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #65c027; padding-bottom: 10px; }
          .header h1 { color: #65c027; font-size: 18px; margin: 0; }
          .header p { color: #666; font-size: 10px; margin: 5px 0 0; }
          
          .section { margin-bottom: 15px; border: 1px solid #ddd; padding: 10px; border-radius: 4px; }
          .section-title { font-size: 12px; font-weight: bold; color: #fff; background: #65c027; padding: 5px 10px; margin: -10px -10px 10px -10px; border-top-left-radius: 3px; border-top-right-radius: 3px; }
          
          .grid { display: table; width: 100%; border-spacing: 5px; }
          .row { display: table-row; }
          .col { display: table-cell; vertical-align: top; width: 25%; }
          .col-half { display: table-cell; vertical-align: top; width: 50%; }
          
          .label { font-weight: bold; color: #555; display: block; font-size: 9px; margin-bottom: 2px; text-transform: uppercase; }
          .val { margin-bottom: 8px; font-size: 11px; color: #000; min-height: 14px; }
          
          .note { font-style: italic; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Client Profile</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- 1. Main Info -->
        <div class="section">
          <div class="section-title">Main Information</div>
          <div class="grid">
            <div class="row">
               <div class="col"><span class="label">Code</span><div class="val">${c.clientCode}</div></div>
               <div class="col"><span class="label">Name</span><div class="val">${c.firstName} ${c.middleName} ${c.lastName}</div></div>
               <div class="col"><span class="label">Status</span><div class="val">${c.status}</div></div>
               <div class="col"><span class="label">DOB (Age)</span><div class="val">${c.dob} (${c.age})</div></div>
            </div>
            <div class="row">
               <div class="col"><span class="label">SSN</span><div class="val">${c.ssn}</div></div>
               <div class="col"><span class="label">Gender</span><div class="val">${c.gender}</div></div>
               <div class="col"><span class="label">Marital</span><div class="val">${c.maritalStatus}</div></div>
               <div class="col"><span class="label">Language</span><div class="val">${c.primaryLang}</div></div>
            </div>
            <div class="row">
               <div class="col"><span class="label">Active Date</span><div class="val">${c.activeDate}</div></div>
               <div class="col"><span class="label">Deactive</span><div class="val">${c.deactiveDate || '-'}</div></div>
               <div class="col"><span class="label">Payment</span><div class="val">${c.paymentType}</div></div>
               <div class="col"><span class="label">Agreement</span><div class="val">${c.agreementStatus}</div></div>
            </div>
          </div>
        </div>

        <!-- 2. Contacts -->
        <div class="section">
          <div class="section-title">Contact & Addresses</div>
          <div class="grid">
            <div class="row">
               <div class="col"><span class="label">Email 1</span><div class="val">${c.email}</div></div>
               <div class="col"><span class="label">Email 2</span><div class="val">${c.email2}</div></div>
               <div class="col"><span class="label">Cell</span><div class="val">${c.cellPhone}</div></div>
               <div class="col"><span class="label">Home</span><div class="val">${c.homePhone}</div></div>
            </div>
          </div>
          <div style="margin-top:5px; border-top:1px dashed #ccc; padding-top:5px;">
             <div class="grid">
                <div class="row">
                   <div class="col-half">
                      <span class="label">Living Address</span>
                      <div class="val">${c.livingAddress}, ${c.livingCity}, ${c.livingState} ${c.livingZip}</div>
                   </div>
                   <div class="col-half">
                      <span class="label">Billing Address</span>
                      <div class="val">${c.billingAddress}, ${c.billingCity}, ${c.billingState} ${c.billingZip}</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
        
        <!-- 3. Care -->
        <div class="section">
          <div class="section-title">Care Assessment</div>
          <div class="grid">
             <div class="row">
                <div class="col"><span class="label">Date</span><div class="val">${c.assessDate}</div></div>
                <div class="col"><span class="label">Height/Weight</span><div class="val">${c.height} / ${c.weight} lbs</div></div>
                <div class="col"><span class="label">Mental Status</span><div class="val">${c.mentalStatus}</div></div>
             </div>
          </div>
          <div style="margin-top:5px;">
             <span class="label">Diagnosis</span><div class="val">${c.diagnosis}</div>
             <span class="label">Service Needs</span><div class="val">${c.serviceNeeds}</div>
             <span class="label">Goals</span><div class="val">${c.goals}</div>
          </div>
          <div style="margin-top:5px; border-top:1px dashed #ccc; padding-top:5px;">
             <div class="grid">
                <div class="row">
                   <div class="col"><span class="label">Alone?</span><div class="val">${c.livingAlone} <span class="note">${c.livingAloneNote}</span></div></div>
                   <div class="col"><span class="label">Pets?</span><div class="val">${c.pets} <span class="note">${c.petsNote}</span></div></div>
                   <div class="col"><span class="label">Smoke?</span><div class="val">${c.smoke} <span class="note">${c.smokeNote}</span></div></div>
                   <div class="col"><span class="label">Drink?</span><div class="val">${c.drink} <span class="note">${c.drinkNote}</span></div></div>
                </div>
             </div>
          </div>
        </div>

        <!-- 4. Medical -->
        <div class="section">
          <div class="section-title">Medical Overview</div>
          <div class="grid">
             <div class="row">
                <div class="col"><span class="label">Doctor</span><div class="val">${c.drName}<br>${c.drPhone}</div></div>
                <div class="col"><span class="label">Pharmacy</span><div class="val">${c.pharmName}<br>${c.pharmPhone}</div></div>
                <div class="col"><span class="label">Hospital</span><div class="val">${c.hospName}<br>${c.hospPhone}</div></div>
             </div>
             <div class="row">
                <div class="col"><span class="label">Meds Control</span><div class="val">${c.selfAdmin}</div></div>
                <div class="col"><span class="label">Overseeing</span><div class="val">${c.overseeingResp} <span class="note">${c.overseeingNote}</span></div></div>
                <div class="col"><span class="label">Allergies</span><div class="val">${c.allergies}</div></div>
             </div>
          </div>
        </div>
        
        <div style="text-align:center; margin-top:20px; color:#999; font-size:10px;">
           End of Report - ${c.clientCode}
        </div>
      </body>
    </html>
  `;
  
  const blob = Utilities.newBlob(html, MimeType.HTML).getAs(MimeType.PDF);
  blob.setName(`${c.firstName}_${c.lastName}_Profile.pdf`);
  return { base64: Utilities.base64Encode(blob.getBytes()), name: blob.getName() };
}