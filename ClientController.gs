const CLIENT_SHEET_NAME = "Clients_DB";

function getOrCreateClientSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CLIENT_SHEET_NAME);

  const additionalHeaders = [
    "Mobility",
    "Daily Living Skills",
    "Transportation",
    "Meal Preparation",
    "Light Housekeeping",
    "Dietary Information",
    "Live Alone",
    "Live Family",
    "Live Family Name",
    "Live Senior",
    "Live Senior Name",
    "Live Senior Address",
    "Live Rehab",
    "Live Rehab Name",
    "Live Rehab Address",
    "Smoke",
    "Drink",
    "Medication Reminder",
    "Self Admin Med",
    "Allergies",
    "Allergies Detail",
    "Assist Directions",
    "Assist Directions Detail",
    "Taking Med",
    "Med Overseer",
    "Med List",
    "Covid Vaccine",
    "Covid Vaccine Detail",
    "Flu Vaccine",
    "Flu Vaccine Detail",
    "Primary Dr Name",
    "Dr Office Name",
    "Dr Phone",
    "Dr Address",
    "Hospital Name",
    "Hospital Phone",
    "Hospital Address",
    "Pharmacy Name",
    "Pharmacy Phone",
    "Pharmacy Address",
    "Care Certifications",
    "Care Gender",
    "Care Smoke Premises",
    "Care Smoke Note",
    "Care Skills",
    "Care Live In",
    "Care Accommodation",
    "Payment Type",
    "Payment Options",
    "Pay Bank Name",
    "Pay Holder Name",
    "Pay Account Type",
    "Pay Holder Type",
    "Pay Account Number",
    "Pay Routing Number",
    "Pay Digital Full Name",
    "Pay Digital Type",
    "Pay Digital Value",
    "Insurance Company",
    "Insurance Address",
    "Insurance Apt",
    "Insurance City",
    "Insurance State",
    "Insurance Zip",
    "Insurance Policy",
    "Insurance Contact Name",
    "Insurance Member Id",
    "Insurance Contact Phone",
    "Insurance Case",
    "Insurance Claim",
    "Insurance Add Note",
    "Pay Business Name",
    "Pay Card Name",
    "Pay Card Number",
    "Pay Card Expiry",
    "Pay Card CVV",
    "Agreement Link",
    "Exhibit A Link",
    "Exhibit B Link",
    "Bill of Rights Link",
    "HIPAA Link",
    "Privacy Link",
  ];

  if (!sheet) {
    sheet = ss.insertSheet(CLIENT_SHEET_NAME);
    const headers = [
      "Client ID",
      "Contact Date",
      "Free Assessment Date/Time",
      "Coordinator",
      "Representative Name",
      "Representative Phone",
      "Representative Relationship",
      "First Name",
      "Middle Name",
      "Last Name",
      "Client Phone",
      "Status",
      "Client Address",
      "Client Apt",
      "Client City",
      "Client State",
      "Client Zip",
      "Client Care Needs",
      "Referred By",
      "Email",
      "Username",
      "Gender",
      "Marital Status",
      "Spouse Full Name",
      "DOB",
      "SSN",
      "EIN",
      "Code Status",
      "Languages",
      "Billing Address",
      "Billing Apt",
      "Billing City",
      "Billing State",
      "Billing Zip",
      "Emergency Name",
      "Emergency Phone",
      "Emergency Email",
      "Emergency Relationship",
      "Emergency Address",
      "Emergency Apt",
      "Emergency City",
      "Emergency State",
      "Emergency Zip",
      "Auth Name",
      "Auth Phone",
      "Auth Email",
      "Auth Relationship",
      "Auth Address",
      "Auth Apt",
      "Auth City",
      "Auth State",
      "Auth Zip",
      "Project Hours",
      "Level of Care",
      "Hourly Rate",
      "Overtime",
      "Weekly Cost",
      "Monthly Cost",
      "Service Types",
      "Schedule MO",
      "Schedule T",
      "Schedule W",
      "Schedule TH",
      "Schedule FR",
      "Schedule SA",
      "Schedule SU",
      "Height",
      "Weight",
      "Mental Status",
      "Diagnosis",
      "Service Needs",
      "Goals",
      "Blind",
      "Glasses",
      "Dentures",
      "Continent Info",
      "Incontinent Info",
      "Medical Aids",
      "Medical History",
      "Stage",
      "Pets",
      "Pets List",
      "Pets Note",
      "Created At",
      "Last Reviewed",
      ...additionalHeaders,
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet
      .getRange(1, 1, 1, headers.length)
      .setBackground("#65c027")
      .setFontColor("white")
      .setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else {
    // Check if we need to add new headers
    const currentHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    // If "Mobility" or "Pay Card Name" or "Agreement Link" is missing, we check and append missing headers
    if (
      !currentHeaders.includes("Mobility") ||
      !currentHeaders.includes("Pay Card Name") ||
      !currentHeaders.includes("Agreement Link")
    ) {
      const missingHeaders = additionalHeaders.filter(
        (h) => !currentHeaders.includes(h),
      );
      if (missingHeaders.length > 0) {
        const startCol = currentHeaders.length + 1;
        sheet
          .getRange(1, startCol, 1, missingHeaders.length)
          .setValues([missingHeaders]);
        sheet
          .getRange(1, startCol, 1, missingHeaders.length)
          .setBackground("#65c027")
          .setFontColor("white")
          .setFontWeight("bold");
      }
    }
  }
  return sheet;
}

function handleClientSubmission(data) {
  const sheet = getOrCreateClientSheet();

  // Generate ID: CL + Random 4 digits
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const newId = `CL${randomPart}`;

  // Format Array for Sheet - New comprehensive schema
  const rowData = [
    newId,
    data.contactDate,
    data.assessmentDateTime,
    data.coordinator,
    data.repName,
    data.repPhone,
    data.repRelationship,
    data.firstName,
    data.middleName || "",
    data.lastName,
    data.clientPhone,
    "In progress", // Default status for Stage 1 (New leads)
    data.clientAddress,
    data.clientApt || "",
    data.clientCity,
    data.clientState,
    data.clientZip,
    data.careNeeds || "",
    data.referredBy || "",
    data.email || "",
    data.username || "",
    data.gender || "",
    data.maritalStatus || "",
    data.spouseName || "",
    data.dob || "",
    data.ssn || "",
    data.ein || "",
    data.codeStatus || "",
    data.languages || "",
    data.billingAddress || "",
    data.billingApt || "",
    data.billingCity || "",
    data.billingState || "",
    data.billingZip || "",
    data.emergencyName || data.repName || "",
    data.emergencyPhone || data.repPhone || "",
    data.emergencyEmail || "",
    data.emergencyRelationship || data.repRelationship || "",
    data.emergencyAddress || "",
    data.emergencyApt || "",
    data.emergencyCity || "",
    data.emergencyState || "",
    data.emergencyZip || "",
    data.authName || data.repName || "",
    data.authPhone || data.repPhone || "",
    data.authEmail || "",
    data.authRelationship || data.repRelationship || "",
    data.authAddress || "",
    data.authApt || "",
    data.authCity || "",
    data.authState || "",
    data.authZip || "",
    data.projectHours || "",
    data.levelOfCare || "",
    data.hourlyRate || "",
    data.overtime || "",
    data.weeklyCost || "",
    data.monthlyCost || "",
    data.serviceTypes || "",
    data.schMO || "",
    data.schT || "",
    data.schW || "",
    data.schTH || "",
    data.schFR || "",
    data.schSA || "",
    data.schSU || "",
    data.height || "",
    data.weight || "",
    data.mentalStatus || "",
    data.diagnosis || "",
    data.serviceNeedsText || "",
    data.goals || "",
    data.blind || "",
    data.glasses || "",
    data.dentures || "",
    data.continentInfo || "",
    data.incontinentInfo || "",
    data.medicalAids || "",
    data.medicalHistory || "",
    "New leads", // Initial Stage
    data.pets || "",
    data.petsList || "",
    data.petsNote || "",
    new Date(), // Created At
    new Date(), // Last Reviewed
    // New Fields
    data.mobility || "",
    data.dailyLivingSkills || "",
    data.transportation || "",
    data.mealPreparation || "",
    data.lightHousekeeping || "",
    data.dietaryInfo || "",
    data.liveAlone || "",
    data.liveFamily || "",
    data.liveFamilyName || "",
    data.liveSenior || "",
    data.liveSeniorName || "",
    data.liveSeniorAddress || "",
    data.liveRehab || "",
    data.liveRehabName || "",
    data.liveRehabAddress || "",
    data.smoke || "",
    data.drink || "",
    data.medReminder || "",
    data.selfAdminMed || "",
    data.allergies || "",
    data.allergiesDetail || "",
    data.assistDirections || "",
    data.assistDirectionsDetail || "",
    data.takingMed || "",
    data.medOverseer || "",
    data.medList || "",
    data.covidVaccine || "",
    data.covidVaccineDetail || "",
    data.fluVaccine || "",
    data.fluVaccineDetail || "",
    data.primaryDrName || "",
    data.drOfficeName || "",
    data.drPhone || "",
    data.drAddress || "",
    data.hospitalName || "",
    data.hospitalPhone || "",
    data.hospitalAddress || "",
    data.pharmacyName || "",
    data.pharmacyPhone || "",
    data.pharmacyAddress || "",
    data.careCertifications || "",
    data.careGender || "",
    data.careSmokePremises || "",
    data.careSmokeNote || "",
    data.careSkills || "",
    data.careLiveIn || "",
    data.careAccommodation || "",
    data.paymentType || "",
    data.paymentOptions || "",
    data.payBankName || "",
    data.payHolderName || "",
    data.payAccountType || "",
    data.payHolderType || "",
    data.payAccountNum || "",
    data.payRoutingNum || "",
    data.payDigitalFullName || "",
    data.payDigitalType || "",
    data.payDigitalValue || "",
    data.insuranceCompany || "",
    data.insuranceAddress || "",
    data.insuranceApt || "",
    data.insuranceCity || "",
    data.insuranceState || "",
    data.insuranceZip || "",
    data.insurancePolicy || "",
    data.insuranceContactName || "",
    data.insuranceMemberId || "",
    data.insuranceContactPhone || "",
    data.insuranceCase || "",
    data.insuranceClaim || "",
    data.insuranceAddNote || "",
    data.payBusinessName || "",
    data.payCardName || "",
    data.payCardNumber || "",
    data.payCardExpiry || "",
    data.payCardCVV || "",
  ];

  sheet.appendRow(rowData);
  return {
    success: true,
    message: "Client information saved successfully!",
    id: newId,
  };
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
  const agreementLinkIdx = headers.indexOf("Agreement Link");
  const exhibitALinkIdx = headers.indexOf("Exhibit A Link");
  const exhibitBLinkIdx = headers.indexOf("Exhibit B Link");
  const billOfRightsLinkIdx = headers.indexOf("Bill of Rights Link");
  const hipaaLinkIdx = headers.indexOf("HIPAA Link");
  const privacyLinkIdx = headers.indexOf("Privacy Link");
  const emailIdx = headers.indexOf("Email");

  return data
    .filter((row) => row[0] !== "")
    .map((row) => {
      const fName = row[7] || "";
      const mName = row[8] || "";
      const lName = row[9] || "";
      const fullName = [fName, mName, lName].filter(Boolean).join(" ");

      return {
        id: row[0],
        name: fullName || "Unknown",
        firstName: fName,
        middleName: mName,
        lastName: lName,
        email: emailIdx > -1 ? row[emailIdx] : "--",
        phone: row[10] || "--", // Client Phone
        status: row[11] || "Pending", // Status
        type: "Lead",
        city: "--",
        zip: "--",
        stage: headers.includes("Stage")
          ? row[headers.indexOf("Stage")]
          : "New leads",
        assessmentFilled: headers.includes("Project Hours")
          ? row[headers.indexOf("Project Hours")].trim() !== ""
          : false,
        paymentFilled: headers.includes("Payment Type")
          ? row[headers.indexOf("Payment Type")].trim() !== ""
          : false,
        insuranceNote: headers.includes("Insurance Add Note")
          ? row[headers.indexOf("Insurance Add Note")]
          : "",
        lastReviewed: reviewIdx > -1 ? row[reviewIdx] : "--",
        agreementLink: agreementLinkIdx > -1 ? row[agreementLinkIdx] : "",
        exhibitALink: exhibitALinkIdx > -1 ? row[exhibitALinkIdx] : "",
        exhibitBLink: exhibitBLinkIdx > -1 ? row[exhibitBLinkIdx] : "",
        billOfRightsLink:
          billOfRightsLinkIdx > -1 ? row[billOfRightsLinkIdx] : "",
        hipaaLink: hipaaLinkIdx > -1 ? row[hipaaLinkIdx] : "",
        privacyLink: privacyLinkIdx > -1 ? row[privacyLinkIdx] : "",
      };
    })
    .reverse();
}

function getClientListForCommunication() {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const data = sheet
    .getRange(2, 1, lastRow - 1, sheet.getLastColumn())
    .getDisplayValues();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const stageIdx = headers.indexOf("Stage");
  const statusIdx = headers.indexOf("Status");
  const emailIdx = headers.indexOf("Email");
  const firstNameIdx = headers.indexOf("First Name");
  const middleNameIdx = headers.indexOf("Middle Name");
  const lastNameIdx = headers.indexOf("Last Name");

  return data
    .filter((row) => {
      const stage = stageIdx > -1 ? row[stageIdx] : "";
      const status = statusIdx > -1 ? row[statusIdx] : "";
      const email = emailIdx > -1 ? row[emailIdx] : "";
      // Filter: Stage must be "Convert Clients" AND Status must be "Active"
      return (
        row[0] !== "" &&
        stage === "Convert Clients" &&
        status === "Active" &&
        email &&
        email.includes("@")
      );
    })
    .map((row) => {
      const fName = firstNameIdx > -1 ? row[firstNameIdx] : "";
      const mName = middleNameIdx > -1 ? row[middleNameIdx] : "";
      const lName = lastNameIdx > -1 ? row[lastNameIdx] : "";
      const fullName = [fName, mName, lName].filter(Boolean).join(" ");

      return {
        id: row[0],
        name: fullName || "Unknown",
        email: emailIdx > -1 ? row[emailIdx] : "--",
      };
    })
    .reverse();
}

function updateClientStage(clientId, newStage) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "No clients found." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const stageIdx = headers.indexOf("Stage");
  if (stageIdx === -1)
    return { success: false, message: "Stage column not found." };

  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat();
  const rowIndex = ids.indexOf(clientId);

  if (rowIndex === -1) return { success: false, message: "Client not found." };

  sheet.getRange(rowIndex + 2, stageIdx + 1).setValue(newStage);

  // Update status based on stage
  const statusIdx = headers.indexOf("Status");
  if (statusIdx > -1) {
    let newStatus = "";
    if (
      [
        "New leads",
        "Assessment",
        "Insurance Verification",
        "Client Agreements",
      ].includes(newStage)
    ) {
      newStatus = "In progress";
    } else if (newStage === "Convert Clients") {
      newStatus = "Active";
    }

    if (newStatus) {
      sheet.getRange(rowIndex + 2, statusIdx + 1).setValue(newStatus);
    }
  }

  // Also update Last Reviewed
  const reviewIdx = headers.indexOf("Last Reviewed");
  if (reviewIdx > -1) {
    sheet.getRange(rowIndex + 2, reviewIdx + 1).setValue(new Date());
  }

  return { success: true, message: `Client moved to ${newStage} stage.` };
}

function updateClientStatus(clientId, newStatus) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "No clients found." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.indexOf("Status");
  if (statusIdx === -1)
    return { success: false, message: "Status column not found." };

  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat();
  const rowIndex = ids.indexOf(clientId);

  if (rowIndex === -1) return { success: false, message: "Client not found." };

  sheet.getRange(rowIndex + 2, statusIdx + 1).setValue(newStatus);

  // Also update Last Reviewed
  const reviewIdx = headers.indexOf("Last Reviewed");
  if (reviewIdx > -1) {
    sheet.getRange(rowIndex + 2, reviewIdx + 1).setValue(new Date());
  }

  return { success: true, message: `Client status updated to ${newStatus}.` };
}

function getClientDetails(id) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;

  const maxCols = sheet.getLastColumn();
  const data = sheet.getRange(2, 1, lastRow - 1, maxCols).getDisplayValues();
  const row = data.find((r) => r[0] === id);

  if (!row) return null;

  // Row Indices:
  // 0: Client ID
  // ...
  // 82: Pets Note
  // 83: Created At
  // 84: Last Reviewed
  // 85: Mobility (Start of new fields)

  return {
    id: row[0],
    contactDate: row[1],
    assessmentDateTime: row[2],
    coordinator: row[3],
    repName: row[4],
    repPhone: row[5],
    repRelationship: row[6],
    firstName: row[7],
    middleName: row[8],
    lastName: row[9],
    clientPhone: row[10],
    status: row[11],
    clientAddress: row[12],
    clientApt: row[13],
    clientCity: row[14],
    clientState: row[15],
    clientZip: row[16],
    careNeeds: row[17],
    referredBy: row[18],
    email: row[19],
    username: row[20],
    gender: row[21],
    maritalStatus: row[22],
    spouseName: row[23],
    dob: row[24],
    ssn: row[25],
    ein: row[26],
    codeStatus: row[27],
    languages: row[28],
    billingAddress: row[29],
    billingApt: row[30],
    billingCity: row[31],
    billingState: row[32],
    billingZip: row[33],
    emergencyName: row[34],
    emergencyPhone: row[35],
    emergencyEmail: row[36],
    emergencyRelationship: row[37],
    emergencyAddress: row[38],
    emergencyApt: row[39],
    emergencyCity: row[40],
    emergencyState: row[41],
    emergencyZip: row[42],
    authName: row[43],
    authPhone: row[44],
    authEmail: row[45],
    authRelationship: row[46],
    authAddress: row[47],
    authApt: row[48],
    authCity: row[49],
    authState: row[50],
    authZip: row[51],
    projectHours: row[52],
    levelOfCare: row[53],
    hourlyRate: row[54],
    overtime: row[55],
    weeklyCost: row[56],
    monthlyCost: row[57],
    serviceTypes: row[58],
    schMO: row[59],
    schT: row[60],
    schW: row[61],
    schTH: row[62],
    schFR: row[63],
    schSA: row[64],
    schSU: row[65],
    height: row[66],
    weight: row[67],
    mentalStatus: row[68],
    diagnosis: row[69],
    serviceNeedsText: row[70],
    goals: row[71],
    blind: row[72],
    glasses: row[73],
    dentures: row[74],
    continentInfo: row[75],
    incontinentInfo: row[76],
    medicalAids: row[77],
    medicalHistory: row[78],
    stage: row[79],
    pets: row[80],
    petsList: row[81],
    petsNote: row[82],
    createdAt: row[83],
    lastReviewed: row[84],

    // New Fields
    mobility: row[85] || "",
    dailyLivingSkills: row[86] || "",
    transportation: row[87] || "",
    mealPreparation: row[88] || "",
    lightHousekeeping: row[89] || "",
    dietaryInfo: row[90] || "",
    liveAlone: row[91] || "",
    liveFamily: row[92] || "",
    liveFamilyName: row[93] || "",
    liveSenior: row[94] || "",
    liveSeniorName: row[95] || "",
    liveSeniorAddress: row[96] || "",
    liveRehab: row[97] || "",
    liveRehabName: row[98] || "",
    liveRehabAddress: row[99] || "",
    smoke: row[100] || "",
    drink: row[101] || "",
    medReminder: row[102] || "",
    selfAdminMed: row[103] || "",
    allergies: row[104] || "",
    allergiesDetail: row[105] || "",
    assistDirections: row[106] || "",
    assistDirectionsDetail: row[107] || "",
    takingMed: row[108] || "",
    medOverseer: row[109] || "",
    medList: row[110] || "",
    covidVaccine: row[111] || "",
    covidVaccineDetail: row[112] || "",
    fluVaccine: row[113] || "",
    fluVaccineDetail: row[114] || "",
    primaryDrName: row[115] || "",
    drOfficeName: row[116] || "",
    drPhone: row[117] || "",
    drAddress: row[118] || "",
    hospitalName: row[119] || "",
    hospitalPhone: row[120] || "",
    hospitalAddress: row[121] || "",
    pharmacyName: row[122] || "",
    pharmacyPhone: row[123] || "",
    pharmacyAddress: row[124] || "",
    careCertifications: row[125] || "",
    careGender: row[126] || "",
    careSmokePremises: row[127] || "",
    careSmokeNote: row[128] || "",
    careSkills: row[129] || "",
    careLiveIn: row[130] || "",
    careAccommodation: row[131] || "",
    paymentType: row[132] || "",
    paymentOptions: row[133] || "",
    payBankName: row[134] || "",
    payHolderName: row[135] || "",
    payAccountType: row[136] || "",
    payHolderType: row[137] || "",
    payAccountNum: row[138] || "",
    payRoutingNum: row[139] || "",
    payDigitalFullName: row[140] || "",
    payDigitalType: row[141] || "",
    payDigitalValue: row[142] || "",
    insuranceCompany: row[143] || "",
    insuranceAddress: row[144] || "",
    insuranceApt: row[145] || "",
    insuranceCity: row[146] || "",
    insuranceState: row[147] || "",
    insuranceZip: row[148] || "",
    insurancePolicy: row[149] || "",
    insuranceContactName: row[150] || "",
    insuranceMemberId: row[151] || "",
    insuranceContactPhone: row[152] || "",
    insuranceCase: row[153] || "",
    insuranceClaim: row[154] || "",
    insuranceAddNote: row[155] || "",
    payBusinessName: row[156] || "",
    payCardName: row[157] || "",
    payCardNumber: row[158] || "",
    payCardExpiry: row[159] || "",
    payCardCVV: row[160] || "",
    agreementLink: row[161] || "",
    exhibitALink: row[162] || "",
    exhibitBLink: row[163] || "",
    billOfRightsLink: row[164] || "",
    hipaaLink: row[165] || "",
    privacyLink: row[166] || "",
  };
}

function updateClient(data) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "No clients found." };

  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getDisplayValues()
    .flat();
  const rowIndex = ids.indexOf(data.id);

  if (rowIndex === -1) {
    return { success: false, message: "Client not found." };
  }

  const rowNum = rowIndex + 2; // +2 because of header and 0-based index

  // Standard Fields (Columns 2 to 83)
  const standardFields = [
    data.contactDate || "",
    data.assessmentDateTime || "",
    data.coordinator || "",
    data.repName || "",
    data.repPhone || "",
    data.repRelationship || "",
    data.firstName,
    data.middleName,
    data.lastName,
    data.clientPhone,
    [
      "New leads",
      "Assessment",
      "Insurance Verification",
      "Client Agreements",
    ].includes(data.stage)
      ? "In progress"
      : data.stage === "Convert Clients"
        ? "Active"
        : data.status,
    data.clientAddress,
    data.clientApt,
    data.clientCity,
    data.clientState,
    data.clientZip,
    data.careNeeds || "",
    data.referredBy || "",
    data.email || "",
    data.username || "",
    data.gender || "",
    data.maritalStatus || "",
    data.spouseName || "",
    data.dob || "",
    data.ssn || "",
    data.ein || "",
    data.codeStatus || "",
    data.languages || "",
    data.billingAddress || "",
    data.billingApt || "",
    data.billingCity || "",
    data.billingState || "",
    data.billingZip || "",
    data.emergencyName || "",
    data.emergencyPhone || "",
    data.emergencyEmail || "",
    data.emergencyRelationship || "",
    data.emergencyAddress || "",
    data.emergencyApt || "",
    data.emergencyCity || "",
    data.emergencyState || "",
    data.emergencyZip || "",
    data.authName || "",
    data.authPhone || "",
    data.authEmail || "",
    data.authRelationship || "",
    data.authAddress || "",
    data.authApt || "",
    data.authCity || "",
    data.authState || "",
    data.authZip || "",
    data.projectHours || "",
    data.levelOfCare || "",
    data.hourlyRate || "",
    data.overtime || "",
    data.weeklyCost || "",
    data.monthlyCost || "",
    data.serviceTypes || "",
    data.schMO || "",
    data.schT || "",
    data.schW || "",
    data.schTH || "",
    data.schFR || "",
    data.schSA || "",
    data.schSU || "",
    data.height || "",
    data.weight || "",
    data.mentalStatus || "",
    data.diagnosis || "",
    data.serviceNeedsText || "",
    data.goals || "",
    data.blind || "",
    data.glasses || "",
    data.dentures || "",
    data.continentInfo || "",
    data.incontinentInfo || "",
    data.medicalAids || "",
    data.medicalHistory || "",
    data.stage || "",
    data.pets || "",
    data.petsList || "",
    data.petsNote || "",
  ];

  sheet
    .getRange(rowNum, 2, 1, standardFields.length)
    .setValues([standardFields]);

  // Update Last Reviewed (Col 85)
  // Headers indices:
  // ... Pets Note (82 -> Col 83)
  // Created At (83 -> Col 84)
  // Last Reviewed (84 -> Col 85)
  sheet.getRange(rowNum, 85).setValue(new Date());

  // Additional Fields (Columns 86+)
  const additionalFields = [
    data.mobility || "",
    data.dailyLivingSkills || "",
    data.transportation || "",
    data.mealPreparation || "",
    data.lightHousekeeping || "",
    data.dietaryInfo || "",
    data.liveAlone || "",
    data.liveFamily || "",
    data.liveFamilyName || "",
    data.liveSenior || "",
    data.liveSeniorName || "",
    data.liveSeniorAddress || "",
    data.liveRehab || "",
    data.liveRehabName || "",
    data.liveRehabAddress || "",
    data.smoke || "",
    data.drink || "",
    data.medReminder || "",
    data.selfAdminMed || "",
    data.allergies || "",
    data.allergiesDetail || "",
    data.assistDirections || "",
    data.assistDirectionsDetail || "",
    data.takingMed || "",
    data.medOverseer || "",
    data.medList || "",
    data.covidVaccine || "",
    data.covidVaccineDetail || "",
    data.fluVaccine || "",
    data.fluVaccineDetail || "",
    data.primaryDrName || "",
    data.drOfficeName || "",
    data.drPhone || "",
    data.drAddress || "",
    data.hospitalName || "",
    data.hospitalPhone || "",
    data.hospitalAddress || "",
    data.pharmacyName || "",
    data.pharmacyPhone || "",
    data.pharmacyAddress || "",
    data.careCertifications || "",
    data.careGender || "",
    data.careSmokePremises || "",
    data.careSmokeNote || "",
    data.careSkills || "",
    data.careLiveIn || "",
    data.careAccommodation || "",
    data.paymentType || "",
    data.paymentOptions || "",
    data.payBankName || "",
    data.payHolderName || "",
    data.payAccountType || "",
    data.payHolderType || "",
    data.payAccountNum || "",
    data.payRoutingNum || "",
    data.payDigitalFullName || "",
    data.payDigitalType || "",
    data.payDigitalValue || "",
    data.insuranceCompany || "",
    data.insuranceAddress || "",
    data.insuranceApt || "",
    data.insuranceCity || "",
    data.insuranceState || "",
    data.insuranceZip || "",
    data.insurancePolicy || "",
    data.insuranceContactName || "",
    data.insuranceMemberId || "",
    data.insuranceContactPhone || "",
    data.insuranceCase || "",
    data.insuranceClaim || "",
    data.insuranceAddNote || "",
    data.payBusinessName || "",
    data.payCardName || "",
    data.payCardNumber || "",
    data.payCardExpiry || "",
    data.payCardCVV || "",
  ];

  sheet
    .getRange(rowNum, 86, 1, additionalFields.length)
    .setValues([additionalFields]);

  return { success: true, message: "Client updated successfully!" };
}

function updateClientInsurancePending(clientId, reason, note) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "No clients found." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.indexOf("Status");
  const noteIdx = headers.indexOf("Insurance Add Note");

  if (statusIdx === -1)
    return { success: false, message: "Status column not found." };

  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat();
  const rowIndex = ids.indexOf(clientId);

  if (rowIndex === -1) return { success: false, message: "Client not found." };

  // Update status with pending info
  const statusValue = `Pending - ${reason}`;
  sheet.getRange(rowIndex + 2, statusIdx + 1).setValue(statusValue);

  // Update note if exists
  if (noteIdx > -1) {
    sheet.getRange(rowIndex + 2, noteIdx + 1).setValue(note || "");
  }

  // Update Last Reviewed
  const reviewIdx = headers.indexOf("Last Reviewed");
  if (reviewIdx > -1) {
    sheet.getRange(rowIndex + 2, reviewIdx + 1).setValue(new Date());
  }

  return { success: true, message: `Client marked as Pending - ${reason}.` };
}

function updateClientInsuranceDenied(clientId, reason, note) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "No clients found." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.indexOf("Status");
  const noteIdx = headers.indexOf("Insurance Add Note");
  const stageIdx = headers.indexOf("Stage");

  if (statusIdx === -1)
    return { success: false, message: "Status column not found." };

  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat();
  const rowIndex = ids.indexOf(clientId);

  if (rowIndex === -1) return { success: false, message: "Client not found." };

  // Update status to Archived
  sheet.getRange(rowIndex + 2, statusIdx + 1).setValue("Archived");

  // Update stage to Archived
  if (stageIdx > -1) {
    sheet.getRange(rowIndex + 2, stageIdx + 1).setValue("Archived");
  }

  // Update note with denial reason (overwrite as requested)
  if (noteIdx > -1) {
    const denialEntry = `[DENIED - ${reason}] ${note}`;
    sheet.getRange(rowIndex + 2, noteIdx + 1).setValue(denialEntry);
  }

  // Update Last Reviewed
  const reviewIdx = headers.indexOf("Last Reviewed");
  if (reviewIdx > -1) {
    sheet.getRange(rowIndex + 2, reviewIdx + 1).setValue(new Date());
  }

  return {
    success: true,
    message: `Client archived with denial reason: ${reason}.`,
  };
}

function restoreClientFromArchive(clientId, targetStage) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "No clients found." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.indexOf("Status");
  const stageIdx = headers.indexOf("Stage");

  if (statusIdx === -1)
    return { success: false, message: "Status column not found." };

  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat();
  const rowIndex = ids.indexOf(clientId);

  if (rowIndex === -1) return { success: false, message: "Client not found." };

  // Restore status based on target stage
  const stageToSet = targetStage || "New leads";
  let statusToSet = "In progress";
  if (stageToSet === "Convert Clients") {
    statusToSet = "Active";
  }
  sheet.getRange(rowIndex + 2, statusIdx + 1).setValue(statusToSet);

  // Restore stage to selected stage or default to "New leads"
  if (stageIdx > -1) {
    sheet.getRange(rowIndex + 2, stageIdx + 1).setValue(stageToSet);
  }

  // Update Last Reviewed
  const reviewIdx = headers.indexOf("Last Reviewed");
  if (reviewIdx > -1) {
    sheet.getRange(rowIndex + 2, reviewIdx + 1).setValue(new Date());
  }

  return { success: true, message: `Client restored to ${stageToSet}.` };
}

function archiveClient(clientId, reason) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "No clients found." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIdx = headers.indexOf("Status");
  const stageIdx = headers.indexOf("Stage");
  const noteIdx = headers.indexOf("Insurance Add Note");

  if (statusIdx === -1)
    return { success: false, message: "Status column not found." };

  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat();
  const rowIndex = ids.indexOf(clientId);

  if (rowIndex === -1) return { success: false, message: "Client not found." };

  // Update status and stage to Archived
  sheet.getRange(rowIndex + 2, statusIdx + 1).setValue("Archived");
  if (stageIdx > -1) {
    sheet.getRange(rowIndex + 2, stageIdx + 1).setValue("Archived");
  }

  // Add archive reason to notes (overwrite as requested)
  if (noteIdx > -1 && reason) {
    const entry = `[ARCHIVED] ${reason}`;
    sheet.getRange(rowIndex + 2, noteIdx + 1).setValue(entry);
  }

  // Update Last Reviewed
  const reviewIdx = headers.indexOf("Last Reviewed");
  if (reviewIdx > -1) {
    sheet.getRange(rowIndex + 2, reviewIdx + 1).setValue(new Date());
  }

  return { success: true, message: "Client has been moved to Archives." };
}

function processClientConversion(clientId) {
  // 1. Update Stage
  const updateRes = updateClientStage(clientId, "Convert Clients");
  if (!updateRes.success) return updateRes;

  // 2. Send Welcome Email
  const emailRes = sendWelcomeClientEmail(clientId);

  // Return combined result
  if (emailRes.success) {
    return { success: true, message: "Client passed and welcome email sent!" };
  } else {
    return {
      success: true,
      message: "Client passed, but email failed: " + emailRes.message,
    };
  }
}
