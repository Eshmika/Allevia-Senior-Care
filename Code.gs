/**
 * Serves the HTML file for the web app.
 * If URL has ?page=apply&id=CG-xxxx, it shows the Application Form.
 */
function doGet(e) {
  if (e.parameter.page === "apply" && e.parameter.id) {
    const isValid = validateCaregiverId(e.parameter.id);
    if (isValid) {
      var template = HtmlService.createTemplateFromFile(
        "page-public-application"
      );
      template.caregiverId = e.parameter.id;

      // Fetch existing details to pre-fill
      var details = getCaregiverDetails(e.parameter.id);

      // Check if application is already completed
      if (details && details["App Status"] === "Application Completed") {
        return HtmlService.createHtmlOutput(
          `
          <div style="font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 500px;">
              <div style="width: 80px; height: 80px; background-color: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <svg style="width: 40px; height: 40px; color: #16a34a;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 10px;">Application Submitted</h1>
              <p style="color: #4b5563; line-height: 1.5;">
                Your application has already been submitted and is currently under <strong>HR Review</strong>.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                We will contact you shortly regarding the next steps.
              </p>
            </div>
          </div>
        `
        )
          .setTitle("Application Status - Allevia Senior Care")
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .addMetaTag("viewport", "width=device-width, initial-scale=1");
      }

      template.caregiverData = details || {};
      template.mode = e.parameter.mode || "edit";

      return template
        .evaluate()
        .setTitle("Application - Allevia Senior Care")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag("viewport", "width=device-width, initial-scale=1");
    } else {
      return HtmlService.createHtmlOutput(
        "<h1 style='font-family:sans-serif; text-align:center; margin-top:50px;'>Error: Invalid or Expired Application Link.</h1>"
      );
    }
  } else if (e.parameter.page === "onboarding" && e.parameter.id) {
    const isValid = validateCaregiverId(e.parameter.id);
    if (isValid) {
      var details = getCaregiverDetails(e.parameter.id);
      var template = HtmlService.createTemplateFromFile(
        "page-onboarding-steps"
      );
      template.caregiverId = e.parameter.id;
      template.caregiverData = details || {};
      template.scriptUrl = ScriptApp.getService().getUrl();
      template.status = {
        contract: !!details["Contract Link"],
        w9: !!details["W9 Link"],
        background: !!details["Background Link"],
      };

      return template
        .evaluate()
        .setTitle("Onboarding Steps - Allevia Senior Care")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag("viewport", "width=device-width, initial-scale=1");
    } else {
      return HtmlService.createHtmlOutput(
        "<h1 style='font-family:sans-serif; text-align:center; margin-top:50px;'>Error: Invalid or Expired Onboarding Link.</h1>"
      );
    }
  } else if (e.parameter.page === "payment-setup" && e.parameter.id) {
    const isValid = validateCaregiverId(e.parameter.id);
    if (isValid) {
      var details = getCaregiverDetails(e.parameter.id);

      // Check if payment details are already submitted
      if (details && details["Payment Method"]) {
        return HtmlService.createHtmlOutput(
          `
          <div style="font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 500px;">
              <div style="width: 80px; height: 80px; background-color: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <svg style="width: 40px; height: 40px; color: #16a34a;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 10px;">Payment Details Submitted</h1>
              <p style="color: #4b5563; line-height: 1.5;">
                Your payment information has already been securely recorded.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                If you need to make changes, please contact HR directly.
              </p>
            </div>
          </div>
        `
        )
          .setTitle("Payment Status - Allevia Senior Care")
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .addMetaTag("viewport", "width=device-width, initial-scale=1");
      }

      var template = HtmlService.createTemplateFromFile("page-payment-setup");
      template.caregiverId = e.parameter.id;
      return template
        .evaluate()
        .setTitle("Payment Setup - Allevia Senior Care")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag("viewport", "width=device-width, initial-scale=1");
    } else {
      return HtmlService.createHtmlOutput(
        "<h1 style='font-family:sans-serif; text-align:center; margin-top:50px;'>Error: Invalid or Expired Link.</h1>"
      );
    }
  } else if (
    ["contract", "w9", "background"].includes(e.parameter.page) &&
    e.parameter.id
  ) {
    const isValid = validateCaregiverId(e.parameter.id);
    if (isValid) {
      var details = getCaregiverDetails(e.parameter.id);

      // Check if already submitted
      const page = e.parameter.page;
      let isSubmitted = false;
      let docName = "";

      if (page === "contract" && details["Contract Link"]) {
        isSubmitted = true;
        docName = "Independent Contractor Agreement";
      } else if (page === "w9" && details["W9 Link"]) {
        isSubmitted = true;
        docName = "W-9 Form";
      } else if (page === "background" && details["Background Link"]) {
        isSubmitted = true;
        docName = "Background Check Request";
      }

      if (isSubmitted) {
        return HtmlService.createHtmlOutput(
          `
          <div style="font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 500px;">
              <div style="width: 80px; height: 80px; background-color: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <svg style="width: 40px; height: 40px; color: #16a34a;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 10px;">Document Signed</h1>
              <p style="color: #4b5563; line-height: 1.5;">
                The <strong>${docName}</strong> has already been signed and submitted.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Thank you for completing this step.
              </p>
            </div>
          </div>
        `
        )
          .setTitle("Document Status - Allevia Senior Care")
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .addMetaTag("viewport", "width=device-width, initial-scale=1");
      }

      var template = HtmlService.createTemplateFromFile(
        "page-" + e.parameter.page
      );
      template.caregiverId = e.parameter.id;
      template.caregiverData = details || {};
      template.isPdf = false;

      return template
        .evaluate()
        .setTitle("Onboarding - Allevia Senior Care")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag("viewport", "width=device-width, initial-scale=1");
    } else {
      return HtmlService.createHtmlOutput(
        "<h1 style='font-family:sans-serif; text-align:center; margin-top:50px;'>Error: Invalid Link.</h1>"
      );
    }
  } else if (e.parameter.page === "client-intake-steps" && e.parameter.id) {
    // Serve Client Intake Steps page
    var clientDetails = getClientDetails(e.parameter.id);
    if (clientDetails) {
      var template = HtmlService.createTemplateFromFile(
        "page-client-intake-steps"
      );
      template.clientId = e.parameter.id;
      template.clientData = clientDetails;
      template.scriptUrl = ScriptApp.getService().getUrl();

      // Intake status flags (default to false if links/flags not yet implemented)
      var status = {
        agreement: !!clientDetails.agreementLink,
        exhibitA: !!clientDetails.exhibitALink,
        exhibitB: !!clientDetails.exhibitBLink,
        billOfRights: !!clientDetails.billOfRightsLink,
        hipaa: !!clientDetails.hipaaLink,
        privacy: !!clientDetails.privacyLink,
      };
      template.status = status;
      template.completedCount = [
        status.agreement,
        status.exhibitA,
        status.exhibitB,
        status.billOfRights,
        status.hipaa,
        status.privacy,
      ].filter(function (v) {
        return !!v;
      }).length;

      return template
        .evaluate()
        .setTitle("Client Intake Packet - Allevia Senior Care")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag("viewport", "width=device-width, initial-scale=1");
    } else {
      return HtmlService.createHtmlOutput(
        "<h1 style='font-family:sans-serif; text-align:center; margin-top:50px;'>Error: Invalid or Expired Client Link.</h1>"
      );
    }
  } else if (e.parameter.page === "client-sign-agreement" && e.parameter.id) {
    // Serve Client Service Agreement for clients
    var clientDetails = getClientDetails(e.parameter.id);
    if (clientDetails) {
      var template = HtmlService.createTemplateFromFile(
        "Client-Service-Agreement"
      );
      // Optional: expose client details if needed by template in the future
      template.clientId = e.parameter.id;
      template.clientData = clientDetails;
      template.scriptUrl = ScriptApp.getService().getUrl();
      template.isPdf = false;

      return template
        .evaluate()
        .setTitle("Client Service Agreement - Allevia Senior Care")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag("viewport", "width=device-width, initial-scale=1");
    } else {
      return HtmlService.createHtmlOutput(
        "<h1 style='font-family:sans-serif; text-align:center; margin-top:50px;'>Error: Invalid or Expired Client Link.</h1>"
      );
    }
  }

  // Minimal handler for client agreement submission (can be extended to generate PDF and save to Drive/Sheet)
  function submitClientAgreement(form) {
    try {
      var id = form.clientId;
      var signature = form.signature;
      var signDate = form.signDate;
      if (!id) return { success: false, message: "Missing Client ID" };

      // Basic validation mirror
      var details = getClientDetails(id);
      if (!details) return { success: false, message: "Client not found" };

      // Optionally store signature and date in memory/object for future PDF generation
      // For now, just acknowledge success. Implementation of PDF + Drive saving can be added later.
      return { success: true };
    } catch (e) {
      return { success: false, message: e.toString() };
    }
  }
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("Senior Care Admin Panel")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

// Helper to check if ID exists in Sheet (Called by doGet)
function validateCaregiverId(id) {
  const sheet = getOrCreateSheet();
  const ids = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, 1)
    .getValues()
    .flat();
  return ids.includes(id);
}

function generateCaregiverPdf(id) {
  const isValid = validateCaregiverId(id);
  if (!isValid) return { success: false, message: "Invalid ID" };

  var template = HtmlService.createTemplateFromFile("page-public-application");
  template.caregiverId = id;
  template.mode = "print";

  var details = getCaregiverDetails(id);
  template.caregiverData = details || {};

  const blob = template.evaluate().getBlob();
  const pdf = blob.getAs("application/pdf").setName(`Application_${id}.pdf`);

  // Convert to Base64 to avoid DriveApp permissions
  const base64 = Utilities.base64Encode(pdf.getBytes());

  return { success: true, base64: base64, filename: `Application_${id}.pdf` };
}

function submitContract(form) {
  try {
    const id = form.caregiverId;
    const signature = form.signature;
    const signDate = form.signDate;

    if (!id) return { success: false, message: "Missing Caregiver ID" };

    // 1. Get Caregiver Details
    const details = getCaregiverDetails(id);
    if (!details) return { success: false, message: "Caregiver not found" };

    // 2. Prepare Data for PDF
    // Add signature and date to details so they appear in the PDF
    details["Signature"] = signature;
    details["SignDate"] = signDate;

    // 3. Generate PDF
    const template = HtmlService.createTemplateFromFile("page-contract");
    template.caregiverId = id;
    template.caregiverData = details;
    template.isPdf = true;

    const pdfBlob = template
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .addMetaTag("viewport", "width=device-width, initial-scale=1")
      .getAs(MimeType.PDF)
      .setName(
        `${details["First Name"]} ${details["Last Name"]} - Independent Contractor Agreement.pdf`
      );

    // 4. Upload to Drive
    const parentFolderId = "1q6_Gyjvj5FZxMMnXUQ3MhiKT2gF9KD8L";
    let folder;
    try {
      folder = getCaregiverFolder(parentFolderId, details);
    } catch (err) {
      return {
        success: false,
        message: "Error accessing/creating Drive folder: " + err,
      };
    }

    const file = folder.createFile(pdfBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 5. Save Link to Sheet
    const fileUrl = file.getUrl();
    const saved = saveDocumentLink(id, "contract", fileUrl);

    if (!saved)
      return { success: false, message: "Failed to save link to database" };

    return { success: true, url: fileUrl };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function submitBackground(form) {
  try {
    const id = form.caregiverId;
    // Collect form data
    const signature = form.signature;
    const signDate = form.signDate;
    const reasonFingerprinted = form.reasonFingerprinted;
    const reasonThisCheck = form.reasonThisCheck;
    const ssn = form.ssn;
    const dob = form.dob;
    const fullName = form.fullName;
    const street = form.street;
    const city = form.city;
    const state = form.state;
    const zip = form["zip code"]; // Access with bracket notation due to space
    const phoneNumber = form.phoneNumber;

    if (!id) return { success: false, message: "Missing Caregiver ID" };

    // 1. Get Caregiver Details
    const details = getCaregiverDetails(id);
    if (!details) return { success: false, message: "Caregiver not found" };

    // 2. Get/Create Drive Folder (Moved up to handle upload first)
    const parentFolderId = "1q6_Gyjvj5FZxMMnXUQ3MhiKT2gF9KD8L";
    let folder;
    try {
      folder = getCaregiverFolder(parentFolderId, details);
    } catch (err) {
      return {
        success: false,
        message: "Error accessing/creating Drive folder: " + err,
      };
    }

    // 3. Handle Optional Upload (Save first to get URL)
    details["BackgroundLink"] = form.backgroundLink || "";

    const hasUpload =
      form.backgroundUpload &&
      form.backgroundUpload.getName &&
      form.backgroundUpload.getName() !== "";

    if (hasUpload) {
      const uploadBlob = form.backgroundUpload;
      const uploadedFile = folder.createFile(uploadBlob);
      uploadedFile.setName(
        `UPLOADED - ${details["First Name"]} ${
          details["Last Name"]
        } - Background Check Copy - ${uploadBlob.getName()}`
      );
      uploadedFile.setSharing(
        DriveApp.Access.ANYONE_WITH_LINK,
        DriveApp.Permission.VIEW
      );
      details["UploadedBackgroundUrl"] = uploadedFile.getUrl();
    }

    // 4. Prepare Data for PDF
    details["Signature"] = signature;
    details["SignDate"] = signDate;
    details["ReasonFingerprinted"] = reasonFingerprinted;
    details["ReasonThisCheck"] = reasonThisCheck;
    details["SSN"] = ssn;
    details["DOB"] = dob;
    details["FullName"] = fullName;
    details["Street"] = street;
    details["City"] = city;
    details["State"] = state;
    details["Zip"] = zip;
    details["PhoneNumber"] = phoneNumber;

    // 5. Generate PDF
    const template = HtmlService.createTemplateFromFile("page-background");
    template.caregiverId = id;
    template.caregiverData = details;
    template.isPdf = true;

    const pdfBlob = template
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .addMetaTag("viewport", "width=device-width, initial-scale=1")
      .getAs(MimeType.PDF)
      .setName(
        `${details["First Name"]} ${details["Last Name"]} - Background Check.pdf`
      );

    // 6. Save PDF to Drive
    const file = folder.createFile(pdfBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 7. Save Link to Sheet
    const fileUrl = file.getUrl();
    // Use "background" as docType to match "Background Link" column
    const saved = saveDocumentLink(id, "background", fileUrl);

    if (!saved)
      return { success: false, message: "Failed to save link to database" };

    return { success: true, url: fileUrl };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function submitW9(form) {
  try {
    const id = form.caregiverId;
    if (!id) return { success: false, message: "Missing Caregiver ID" };

    // 1. Get Caregiver Details
    const details = getCaregiverDetails(id);
    if (!details) return { success: false, message: "Caregiver not found" };

    // 2. Prepare Data for PDF
    // Add all form fields to details object
    details["W9_Name"] = form.name;
    details["W9_BusinessName"] = form.businessName;
    details["W9_TaxClassification"] = form.taxClassification;
    details["W9_TaxLlcClass"] = form.taxLlcClass;
    details["W9_TaxOtherText"] = form.taxOtherText;
    details["W9_HasForeignOwners"] = form.hasForeignOwners ? "Yes" : "No";
    details["W9_ExemptPayeeCode"] = form.exemptPayeeCode;
    details["W9_FatcaCode"] = form.fatcaCode;
    details["W9_RequesterInfo"] = form.requesterInfo;
    details["W9_Address"] = form.address;
    details["W9_CityStateZip"] = form.cityStateZip;
    details["W9_AccountNumbers"] = form.accountNumbers;
    details["W9_SSN"] = form.ssn;
    details["W9_EIN"] = form.ein;
    details["Signature"] = form.signature;
    details["SignDate"] = form.signDate;

    // 3. Generate PDF
    const template = HtmlService.createTemplateFromFile("page-w9");
    template.caregiverId = id;
    template.caregiverData = details;
    template.isPdf = true;

    const pdfBlob = template
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .addMetaTag("viewport", "width=device-width, initial-scale=1")
      .getAs(MimeType.PDF)
      .setName(
        `${details["First Name"]} ${details["Last Name"]} - IRS W-9 Form.pdf`
      );

    // 4. Upload to Drive
    const parentFolderId = "1q6_Gyjvj5FZxMMnXUQ3MhiKT2gF9KD8L";
    let folder;
    try {
      folder = getCaregiverFolder(parentFolderId, details);
    } catch (err) {
      return {
        success: false,
        message: "Error accessing/creating Drive folder: " + err,
      };
    }

    const file = folder.createFile(pdfBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 5. Save Link to Sheet
    const fileUrl = file.getUrl();
    const saved = saveDocumentLink(id, "w9", fileUrl);

    if (!saved)
      return { success: false, message: "Failed to save link to database" };

    return { success: true, url: fileUrl };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function getCaregiverFolder(parentFolderId, details) {
  const parentFolder = DriveApp.getFolderById(parentFolderId);
  const folderName = `${details["First Name"]} ${details["Last Name"]}`.trim();

  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

/**
 * ⚠️ CRITICAL FIX FOR PERMISSIONS ⚠️
 */
function fixDrivePermissions() {
  const folderId = "1q6_Gyjvj5FZxMMnXUQ3MhiKT2gF9KD8L";
  console.log("Attempting to access folder...");

  // 1. Force access to the specific folder
  const folder = DriveApp.getFolderById(folderId);

  // 2. Force write permission by creating a temp file
  const tempFile = folder.createFile(
    "temp_permission_check.txt",
    "This is a test file to verify permissions. It will be deleted immediately."
  );

  // 3. Clean up
  tempFile.setTrashed(true);

  console.log(
    "SUCCESS: Permissions are fully active for Drive and Folder access."
  );
}
