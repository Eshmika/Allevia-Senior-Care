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
        (h) => !currentHeaders.includes(h)
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
  const codeStatusIdx = headers.indexOf("Code Status");

  const cityIdx = headers.indexOf("Client City");
  const zipIdx = headers.indexOf("Client Zip");

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
        type:
          headers.indexOf("Payment Type") > -1
            ? row[headers.indexOf("Payment Type")]
            : "Lead",
        city: cityIdx > -1 ? row[cityIdx] : "--",
        zip: zipIdx > -1 ? row[zipIdx] : "--",
        codeStatus: codeStatusIdx > -1 ? row[codeStatusIdx] : "",
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

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const maxCols = sheet.getLastColumn();
  const data = sheet.getRange(2, 1, lastRow - 1, maxCols).getDisplayValues();

  // Find index of Client ID column
  const idIdx = headers.indexOf("Client ID");
  // Default to index 0 if header not found
  const searchIdx = idIdx > -1 ? idIdx : 0;

  const row = data.find((r) => r[searchIdx] === id);

  if (!row) return null;

  const getVal = (name) => {
    const idx = headers.indexOf(name);
    return idx > -1 ? row[idx] : "";
  };

  return {
    id: getVal("Client ID"),
    contactDate: getVal("Contact Date"),
    assessmentDateTime: getVal("Free Assessment Date/Time"),
    coordinator: getVal("Coordinator"),
    repName: getVal("Representative Name"),
    repPhone: getVal("Representative Phone"),
    repRelationship: getVal("Representative Relationship"),
    firstName: getVal("First Name"),
    middleName: getVal("Middle Name"),
    lastName: getVal("Last Name"),
    clientPhone: getVal("Client Phone"),
    status: getVal("Status"),
    clientAddress: getVal("Client Address"),
    clientApt: getVal("Client Apt"),
    clientCity: getVal("Client City"),
    clientState: getVal("Client State"),
    clientZip: getVal("Client Zip"),
    careNeeds: getVal("Client Care Needs"),
    referredBy: getVal("Referred By"),
    email: getVal("Email"),
    username: getVal("Username"),
    gender: getVal("Gender"),
    maritalStatus: getVal("Marital Status"),
    spouseName: getVal("Spouse Full Name"),
    dob: getVal("DOB"),
    ssn: getVal("SSN"),
    ein: getVal("EIN"),
    codeStatus: getVal("Code Status"),
    languages: getVal("Languages"),
    billingAddress: getVal("Billing Address"),
    billingApt: getVal("Billing Apt"),
    billingCity: getVal("Billing City"),
    billingState: getVal("Billing State"),
    billingZip: getVal("Billing Zip"),
    emergencyName: getVal("Emergency Name"),
    emergencyPhone: getVal("Emergency Phone"),
    emergencyEmail: getVal("Emergency Email"),
    emergencyRelationship: getVal("Emergency Relationship"),
    emergencyAddress: getVal("Emergency Address"),
    emergencyApt: getVal("Emergency Apt"),
    emergencyCity: getVal("Emergency City"),
    emergencyState: getVal("Emergency State"),
    emergencyZip: getVal("Emergency Zip"),
    authName: getVal("Auth Name"),
    authPhone: getVal("Auth Phone"),
    authEmail: getVal("Auth Email"),
    authRelationship: getVal("Auth Relationship"),
    authAddress: getVal("Auth Address"),
    authApt: getVal("Auth Apt"),
    authCity: getVal("Auth City"),
    authState: getVal("Auth State"),
    authZip: getVal("Auth Zip"),
    projectHours: getVal("Project Hours"),
    levelOfCare: getVal("Level of Care"),
    hourlyRate: getVal("Hourly Rate"),
    overtime: getVal("Overtime"),
    weeklyCost: getVal("Weekly Cost"),
    monthlyCost: getVal("Monthly Cost"),
    serviceTypes: getVal("Service Types"),
    schMO: getVal("Schedule MO"),
    schT: getVal("Schedule T"),
    schW: getVal("Schedule W"),
    schTH: getVal("Schedule TH"),
    schFR: getVal("Schedule FR"),
    schSA: getVal("Schedule SA"),
    schSU: getVal("Schedule SU"),
    height: getVal("Height"),
    weight: getVal("Weight"),
    mentalStatus: getVal("Mental Status"),
    diagnosis: getVal("Diagnosis"),
    serviceNeedsText: getVal("Service Needs"),
    goals: getVal("Goals"),
    blind: getVal("Blind"),
    glasses: getVal("Glasses"),
    dentures: getVal("Dentures"),
    continentInfo: getVal("Continent Info"),
    incontinentInfo: getVal("Incontinent Info"),
    medicalAids: getVal("Medical Aids"),
    medicalHistory: getVal("Medical History"),
    stage: getVal("Stage"),
    pets: getVal("Pets"),
    petsList: getVal("Pets List"),
    petsNote: getVal("Pets Note"),
    createdAt: getVal("Created At"),
    lastReviewed: getVal("Last Reviewed"),

    // New Fields
    mobility: getVal("Mobility"),
    dailyLivingSkills: getVal("Daily Living Skills"),
    transportation: getVal("Transportation"),
    mealPreparation: getVal("Meal Preparation"),
    lightHousekeeping: getVal("Light Housekeeping"),
    dietaryInfo: getVal("Dietary Information"),
    liveAlone: getVal("Live Alone"),
    liveFamily: getVal("Live Family"),
    liveFamilyName: getVal("Live Family Name"),
    liveSenior: getVal("Live Senior"),
    liveSeniorName: getVal("Live Senior Name"),
    liveSeniorAddress: getVal("Live Senior Address"),
    liveRehab: getVal("Live Rehab"),
    liveRehabName: getVal("Live Rehab Name"),
    liveRehabAddress: getVal("Live Rehab Address"),
    smoke: getVal("Smoke"),
    drink: getVal("Drink"),
    medReminder: getVal("Medication Reminder"),
    selfAdminMed: getVal("Self Admin Med"),
    allergies: getVal("Allergies"),
    allergiesDetail: getVal("Allergies Detail"),
    assistDirections: getVal("Assist Directions"),
    assistDirectionsDetail: getVal("Assist Directions Detail"),
    takingMed: getVal("Taking Med"),
    medOverseer: getVal("Med Overseer"),
    medList: getVal("Med List"),
    covidVaccine: getVal("Covid Vaccine"),
    covidVaccineDetail: getVal("Covid Vaccine Detail"),
    fluVaccine: getVal("Flu Vaccine"),
    fluVaccineDetail: getVal("Flu Vaccine Detail"),
    primaryDrName: getVal("Primary Dr Name"),
    drOfficeName: getVal("Dr Office Name"),
    drPhone: getVal("Dr Phone"),
    drAddress: getVal("Dr Address"),
    hospitalName: getVal("Hospital Name"),
    hospitalPhone: getVal("Hospital Phone"),
    hospitalAddress: getVal("Hospital Address"),
    pharmacyName: getVal("Pharmacy Name"),
    pharmacyPhone: getVal("Pharmacy Phone"),
    pharmacyAddress: getVal("Pharmacy Address"),
    careCertifications: getVal("Care Certifications"),
    careGender: getVal("Care Gender"),
    careSmokePremises: getVal("Care Smoke Premises"),
    careSmokeNote: getVal("Care Smoke Note"),
    careSkills: getVal("Care Skills"),
    careLiveIn: getVal("Care Live In"),
    careAccommodation: getVal("Care Accommodation"),
    paymentType: getVal("Payment Type"),
    paymentOptions: getVal("Payment Options"),
    payBankName: getVal("Pay Bank Name"),
    payHolderName: getVal("Pay Holder Name"),
    payAccountType: getVal("Pay Account Type"),
    payHolderType: getVal("Pay Holder Type"),
    payAccountNum: getVal("Pay Account Number"),
    payRoutingNum: getVal("Pay Routing Number"),
    payDigitalFullName: getVal("Pay Digital Full Name"),
    payDigitalType: getVal("Pay Digital Type"),
    payDigitalValue: getVal("Pay Digital Value"),
    insuranceCompany: getVal("Insurance Company"),
    insuranceAddress: getVal("Insurance Address"),
    insuranceApt: getVal("Insurance Apt"),
    insuranceCity: getVal("Insurance City"),
    insuranceState: getVal("Insurance State"),
    insuranceZip: getVal("Insurance Zip"),
    insurancePolicy: getVal("Insurance Policy"),
    insuranceContactName: getVal("Insurance Contact Name"),
    insuranceMemberId: getVal("Insurance Member Id"),
    insuranceContactPhone: getVal("Insurance Contact Phone"),
    insuranceCase: getVal("Insurance Case"),
    insuranceClaim: getVal("Insurance Claim"),
    insuranceAddNote: getVal("Insurance Add Note"),
    payBusinessName: getVal("Pay Business Name"),
    payCardName: getVal("Pay Card Name"),
    payCardNumber: getVal("Pay Card Number"),
    payCardExpiry: getVal("Pay Card Expiry"),
    payCardCVV: getVal("Pay Card CVV"),
    agreementLink: getVal("Agreement Link"),
    exhibitALink: getVal("Exhibit A Link"),
    exhibitBLink: getVal("Exhibit B Link"),
    billOfRightsLink: getVal("Bill of Rights Link"),
    hipaaLink: getVal("HIPAA Link"),
    privacyLink: getVal("Privacy Link"),
  };
}

function updateClient(data) {
  const sheet = getOrCreateClientSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "No clients found." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getDisplayValues()
    .flat();
  const rowIndex = ids.indexOf(data.id);

  if (rowIndex === -1) {
    return { success: false, message: "Client not found." };
  }

  const rowNum = rowIndex + 2; // +2 because of header and 0-based index

  // Read current row to preserve values for columns not being updated (though here we update almost everything)
  const currentRowValues = sheet
    .getRange(rowNum, 1, 1, headers.length)
    .getValues()[0];

  // Helper to update value if header exists
  const setVal = (headerName, value) => {
    const idx = headers.indexOf(headerName);
    if (idx > -1) {
      currentRowValues[idx] = value;
    }
  };

  setVal("Contact Date", data.contactDate);
  setVal("Free Assessment Date/Time", data.assessmentDateTime);
  setVal("Coordinator", data.coordinator);
  setVal("Representative Name", data.repName);
  setVal("Representative Phone", data.repPhone);
  setVal("Representative Relationship", data.repRelationship);
  setVal("First Name", data.firstName);
  setVal("Middle Name", data.middleName);
  setVal("Last Name", data.lastName);
  setVal("Client Phone", data.clientPhone);

  let newStatus = data.status;
  if (
    [
      "New leads",
      "Assessment",
      "Insurance Verification",
      "Client Agreements",
    ].includes(data.stage)
  ) {
    newStatus = "In progress";
  } else if (data.stage === "Convert Clients") {
    newStatus = "Active";
  }
  setVal("Status", newStatus);

  setVal("Client Address", data.clientAddress);
  setVal("Client Apt", data.clientApt);
  setVal("Client City", data.clientCity);
  setVal("Client State", data.clientState);
  setVal("Client Zip", data.clientZip);
  setVal("Client Care Needs", data.careNeeds);
  setVal("Referred By", data.referredBy);
  setVal("Email", data.email);
  setVal("Username", data.username);
  setVal("Gender", data.gender);
  setVal("Marital Status", data.maritalStatus);
  setVal("Spouse Full Name", data.spouseName);
  setVal("DOB", data.dob);
  setVal("SSN", data.ssn);
  setVal("EIN", data.ein);
  setVal("Code Status", data.codeStatus);
  setVal("Languages", data.languages);
  setVal("Billing Address", data.billingAddress);
  setVal("Billing Apt", data.billingApt);
  setVal("Billing City", data.billingCity);
  setVal("Billing State", data.billingState);
  setVal("Billing Zip", data.billingZip);
  setVal("Emergency Name", data.emergencyName);
  setVal("Emergency Phone", data.emergencyPhone);
  setVal("Emergency Email", data.emergencyEmail);
  setVal("Emergency Relationship", data.emergencyRelationship);
  setVal("Emergency Address", data.emergencyAddress);
  setVal("Emergency Apt", data.emergencyApt);
  setVal("Emergency City", data.emergencyCity);
  setVal("Emergency State", data.emergencyState);
  setVal("Emergency Zip", data.emergencyZip);
  setVal("Auth Name", data.authName);
  setVal("Auth Phone", data.authPhone);
  setVal("Auth Email", data.authEmail);
  setVal("Auth Relationship", data.authRelationship);
  setVal("Auth Address", data.authAddress);
  setVal("Auth Apt", data.authApt);
  setVal("Auth City", data.authCity);
  setVal("AuthState", data.authState);
  setVal("Auth Zip", data.authZip);
  setVal("Project Hours", data.projectHours);
  setVal("Level of Care", data.levelOfCare);
  setVal("Hourly Rate", data.hourlyRate);
  setVal("Overtime", data.overtime);
  setVal("Weekly Cost", data.weeklyCost);
  setVal("Monthly Cost", data.monthlyCost);
  setVal("Service Types", data.serviceTypes);
  setVal("Schedule MO", data.schMO);
  setVal("Schedule T", data.schT);
  setVal("Schedule W", data.schW);
  setVal("Schedule TH", data.schTH);
  setVal("Schedule FR", data.schFR);
  setVal("Schedule SA", data.schSA);
  setVal("Schedule SU", data.schSU);
  setVal("Height", data.height);
  setVal("Weight", data.weight);
  setVal("Mental Status", data.mentalStatus);
  setVal("Diagnosis", data.diagnosis);
  setVal("Service Needs", data.serviceNeedsText);
  setVal("Goals", data.goals);
  setVal("Blind", data.blind);
  setVal("Glasses", data.glasses);
  setVal("Dentures", data.dentures);
  setVal("Continent Info", data.continentInfo);
  setVal("Incontinent Info", data.incontinentInfo);
  setVal("Medical Aids", data.medicalAids);
  setVal("Medical History", data.medicalHistory);

  if (data.stage) setVal("Stage", data.stage);

  setVal("Pets", data.pets);
  setVal("Pets List", data.petsList);
  setVal("Pets Note", data.petsNote);

  setVal("Last Reviewed", new Date());

  // New Fields
  setVal("Mobility", data.mobility);
  setVal("Daily Living Skills", data.dailyLivingSkills);
  setVal("Transportation", data.transportation);
  setVal("Meal Preparation", data.mealPreparation);
  setVal("Light Housekeeping", data.lightHousekeeping);
  setVal("Dietary Information", data.dietaryInfo);
  setVal("Live Alone", data.liveAlone);
  setVal("Live Family", data.liveFamily);
  setVal("Live Family Name", data.liveFamilyName);
  setVal("Live Senior", data.liveSenior);
  setVal("Live Senior Name", data.liveSeniorName);
  setVal("Live Senior Address", data.liveSeniorAddress);
  setVal("Live Rehab", data.liveRehab);
  setVal("Live Rehab Name", data.liveRehabName);
  setVal("Live Rehab Address", data.liveRehabAddress);
  setVal("Smoke", data.smoke);
  setVal("Drink", data.drink);
  setVal("Medication Reminder", data.medReminder);
  setVal("Self Admin Med", data.selfAdminMed);
  setVal("Allergies", data.allergies);
  setVal("Allergies Detail", data.allergiesDetail);
  setVal("Assist Directions", data.assistDirections);
  setVal("Assist Directions Detail", data.assistDirectionsDetail);
  setVal("Taking Med", data.takingMed);
  setVal("Med Overseer", data.medOverseer);
  setVal("Med List", data.medList);
  setVal("Covid Vaccine", data.covidVaccine);
  setVal("Covid Vaccine Detail", data.covidVaccineDetail);
  setVal("Flu Vaccine", data.fluVaccine);
  setVal("Flu Vaccine Detail", data.fluVaccineDetail);
  setVal("Primary Dr Name", data.primaryDrName);
  setVal("Dr Office Name", data.drOfficeName);
  setVal("Dr Phone", data.drPhone);
  setVal("Dr Address", data.drAddress);
  setVal("Hospital Name", data.hospitalName);
  setVal("Hospital Phone", data.hospitalPhone);
  setVal("Hospital Address", data.hospitalAddress);
  setVal("Pharmacy Name", data.pharmacyName);
  setVal("Pharmacy Phone", data.pharmacyPhone);
  setVal("Pharmacy Address", data.pharmacyAddress);
  setVal("Care Certifications", data.careCertifications);
  setVal("Care Gender", data.careGender);
  setVal("Care Smoke Premises", data.careSmokePremises);
  setVal("Care Smoke Note", data.careSmokeNote);
  setVal("Care Skills", data.careSkills);
  setVal("Care Live In", data.careLiveIn);
  setVal("Care Accommodation", data.careAccommodation);
  setVal("Payment Type", data.paymentType);
  setVal("Payment Options", data.paymentOptions);
  setVal("Pay Bank Name", data.payBankName);
  setVal("Pay Holder Name", data.payHolderName);
  setVal("Pay Account Type", data.payAccountType);
  setVal("Pay Holder Type", data.payHolderType);
  setVal("Pay Account Number", data.payAccountNum);
  setVal("Pay Routing Number", data.payRoutingNum);
  setVal("Pay Digital Full Name", data.payDigitalFullName);
  setVal("Pay Digital Type", data.payDigitalType);
  setVal("Pay Digital Value", data.payDigitalValue);
  setVal("Insurance Company", data.insuranceCompany);
  setVal("Insurance Address", data.insuranceAddress);
  setVal("Insurance Apt", data.insuranceApt);
  setVal("Insurance City", data.insuranceCity);
  setVal("Insurance State", data.insuranceState);
  setVal("Insurance Zip", data.insuranceZip);
  setVal("Insurance Policy", data.insurancePolicy);
  setVal("Insurance Contact Name", data.insuranceContactName);
  setVal("Insurance Member Id", data.insuranceMemberId);
  setVal("Insurance Contact Phone", data.insuranceContactPhone);
  setVal("Insurance Case", data.insuranceCase);
  setVal("Insurance Claim", data.insuranceClaim);
  setVal("Insurance Add Note", data.insuranceAddNote);
  setVal("Pay Business Name", data.payBusinessName);
  setVal("Pay Card Name", data.payCardName);
  setVal("Pay Card Number", data.payCardNumber);
  setVal("Pay Card Expiry", data.payCardExpiry);
  setVal("Pay Card CVV", data.payCardCVV);

  // Write all values back
  sheet
    .getRange(rowNum, 1, 1, currentRowValues.length)
    .setValues([currentRowValues]);

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
