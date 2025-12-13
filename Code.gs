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
