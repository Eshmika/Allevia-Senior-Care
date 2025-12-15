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
  } else if (
    ["contract", "w9", "background"].includes(e.parameter.page) &&
    e.parameter.id
  ) {
    const isValid = validateCaregiverId(e.parameter.id);
    if (isValid) {
      var template = HtmlService.createTemplateFromFile(
        "page-" + e.parameter.page
      );
      template.caregiverId = e.parameter.id;
      var details = getCaregiverDetails(e.parameter.id);
      template.caregiverData = details || {};

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
  }
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("Senior Care Admin Panel")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
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
