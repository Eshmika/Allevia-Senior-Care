function getInvoiceSettings() {
  return { payPeriodMode: getShiftHistoryPayPeriodSetting() };
}

function maskSsn(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 4) {
    return "XXX-XX-XXXX";
  }
  return "XXX-XX-" + digits.slice(-4);
}

function getInvoiceHistory(filters) {
  const input = filters || {};

  const history = getShiftHistory({
    startDate: input.startDate || "",
    endDate: input.endDate || "",
    caregiverId: input.caregiverId || "all",
    clientId: input.clientId || "all",
    search: input.search || "",
    systemCheck: "all",
  });

  const approvedRows = (history.rows || []).filter((row) =>
    isShiftApprovedForInvoice(row),
  );

  return {
    ...history,
    rows: approvedRows,
  };
}

function generateCaregiverInvoicePDF(startDate, endDate, caregiverId) {
  try {
    if (!caregiverId || caregiverId === "all")
      throw new Error("A specific Caregiver must be selected.");
    if (!startDate || !endDate)
      throw new Error("Start and End dates are required.");

    // Get caregiver details
    const cgList = getCaregiverList();
    const cg = cgList.find((c) => c.id === caregiverId);
    if (!cg) throw new Error("Caregiver not found.");

    const ssnMasked = maskSsn(cg.ssn);

    // Get client list for initials
    const clList = getClientList();
    const getInitials = (clientId, name) => {
      const cl = clList.find((c) => c.id === clientId);
      let clName = cl ? cl.name : name || "";
      clName = clName.split("/")[0].trim(); // Remove "/ ID" part if present
      const parts = clName.split(" ").filter((p) => p.length > 0);
      if (parts.length === 0) return "";
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Get shifts
    const history = getShiftHistory({
      startDate: startDate,
      endDate: endDate,
      caregiverId: caregiverId,
      clientId: "all",
      systemCheck: "all",
    });

    const shiftRows = (history.rows || []).filter((row) =>
      isShiftApprovedForInvoice(row),
    );
    const shiftsData = [];
    let totalEarnings = 0;
    const invoiceId = shiftRows[0]?.invoiceId || "N/A";

    shiftRows.forEach((row) => {
      const rate = parseFloat(row.caregiverRate) || 0;
      const amount = parseFloat(row.totalCaregiverPrice) || 0;
      totalEarnings += amount;

      shiftsData.push({
        invoiceId: row.invoiceId || "N/A",
        shiftId: row.shiftId || row.id || "N/A",
        clientInitials: getInitials(row.clientId, row.clientName),
        service: row.serviceType || "N/A",
        startDate: row.startDate || "",
        endDate: row.endDate || "",
        clockIn: row.clockIn || "",
        clockOut: row.clockOut || "",
        hours: row.hours || "",
        rate: rate.toFixed(2),
        total: amount.toFixed(2),
      });
    });

    const templateData = {
      invoiceId: invoiceId,
      caregiverName: cg.name || "",
      caregiverId: cg.id || "",
      ssnMasked: ssnMasked,
      caregiverAddress: [cg.address, cg.street, cg.city, cg.state, cg.zip]
        .filter(Boolean)
        .join(" "),
      caregiverPhone: cg.phone || "",
      payPeriod: `${startDate} to ${endDate}`,
      printDate: new Date().toLocaleDateString(),
      shifts: shiftsData,
      totalEarnings: totalEarnings.toFixed(2),
    };

    const template = HtmlService.createTemplateFromFile(
      "view-caregiver-invoice-pdf",
    );
    template.data = templateData;
    const html = template.evaluate().getContent();

    const blob = Utilities.newBlob(html, MimeType.HTML).getAs(MimeType.PDF);
    blob.setName(
      `Earning_Statement_${cg.name.replace(
        /[^a-zA-Z0-9]/g,
        "_",
      )}_${startDate}.pdf`,
    );

    return {
      success: true,
      filename: blob.getName(),
      base64: Utilities.base64Encode(blob.getBytes()),
    };
  } catch (e) {
    Logger.log(e);
    return { success: false, message: e.message };
  }
}

function generateClientInvoicePDF(startDate, endDate, clientId) {
  try {
    if (!clientId || clientId === "all")
      throw new Error("A specific Client must be selected.");
    if (!startDate || !endDate)
      throw new Error("Start and End dates are required.");

    // Get client details
    const clList = getClientList();
    const cl = clList.find((c) => c.id === clientId);
    if (!cl) throw new Error("Client not found.");

    // Get caregiver list for initials
    const cgList = getCaregiverList();
    const getInitials = (caregiverId, name) => {
      const cg = cgList.find((c) => c.id === caregiverId);
      let cgName = cg ? cg.name : name || "";
      cgName = cgName.split("/")[0].trim(); // Remove "/ ID" part if present
      const parts = cgName.split(" ").filter((p) => p.length > 0);
      if (parts.length === 0) return "";
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Get shifts
    const history = getShiftHistory({
      startDate: startDate,
      endDate: endDate,
      caregiverId: "all",
      clientId: clientId,
      systemCheck: "all",
    });

    const shiftRows = (history.rows || []).filter((row) =>
      isShiftApprovedForInvoice(row),
    );
    const shiftsData = [];
    let totalDue = 0;
    const invoiceId = shiftRows[0]?.invoiceId || "N/A";

    shiftRows.forEach((row) => {
      const rate = parseFloat(row.clientRate) || 0;
      const amount = parseFloat(row.totalClientPrice) || 0;
      totalDue += amount;

      shiftsData.push({
        invoiceId: row.invoiceId || "N/A",
        caregiverInitials: getInitials(row.caregiverId, row.caregiverName),
        service: row.serviceType || "N/A",
        startDate: row.startDate || "",
        endDate: row.endDate || "",
        clockIn: row.clockIn || "",
        clockOut: row.clockOut || "",
        hours: row.hours || "",
        rate: rate.toFixed(2),
        total: amount.toFixed(2),
      });
    });

    const templateData = {
      invoiceId: invoiceId,
      clientName: cl.name || "",
      clientId: cl.id || "",
      payPeriod: `${startDate} to ${endDate}`,
      printDate: new Date().toLocaleDateString(),
      shifts: shiftsData,
      totalDue: totalDue.toFixed(2),
    };

    const template = HtmlService.createTemplateFromFile(
      "view-client-invoice-pdf",
    );
    template.data = templateData;
    const html = template.evaluate().getContent();

    const blob = Utilities.newBlob(html, MimeType.HTML).getAs(MimeType.PDF);
    blob.setName(
      `Invoice_Receipt_${cl.name.replace(
        /[^a-zA-Z0-9]/g,
        "_",
      )}_${startDate}.pdf`,
    );

    return {
      success: true,
      filename: blob.getName(),
      base64: Utilities.base64Encode(blob.getBytes()),
    };
  } catch (e) {
    Logger.log(e);
    return { success: false, message: e.message };
  }
}
