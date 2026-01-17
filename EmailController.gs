//Caregiver email
function sendRecruitmentEmail(data, caregiverId) {
  // 1. Setup Links
  const webAppUrl = ScriptApp.getService().getUrl();
  const applicationLink = `${webAppUrl}?page=apply&id=${caregiverId}`;

  // 2. Email Content
  const subject = `Complete Your Application`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background-color: #65c027; padding: 24px; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 24px;">Allevia Senior Care</h2>
        <p style="color: #f0fdf4; margin: 5px 0 0; font-style: italic;">Because Home is Where the Care Is</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 30px; background-color: #ffffff;">
        <p style="margin-top: 0;">Dear <strong>${data.firstName}</strong>,</p>
        
        <p>Thank you for your interest in joining Allevia Senior Care. To move forward, please complete your online application using the link below:</p>
        
        <!-- Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${applicationLink}" style="background-color: #65c027; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(101, 192, 39, 0.2);">
              👉 Application Form
          </a>
        </div>
        
        <p>Once your application is submitted, we will review it and contact you with the next steps.</p>
        
        <p>We appreciate your prompt attention and look forward to learning more about you.</p>

        <br>
        <p style="margin-bottom: 5px;">Best regards,</p>
        <p style="margin: 0; font-weight: bold;">Ines k. M & Allevia Teams</p>
        <p style="margin: 0; color: #666; font-size: 14px;">Managing Director | Allevia Senior Care</p>
        
        <p style="font-size: 13px; color: #888; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          If the button doesn't work, copy this link:<br>
          <a href="${applicationLink}" style="color: #65c027;">${applicationLink}</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
        &copy; 2025 Allevia Senior Care. All rights reserved.
      </div>
    </div>
  `;

  // 3. Send
  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody,
  });
}

function sendOnboardingEmail(caregiverId) {
  try {
    const details = getCaregiverDetails(caregiverId);
    if (!details) return { success: false, message: "Caregiver not found" };

    const subject = `Action Required: On boarding Caregiver Complete sign & review`;

    // Dynamic Web App Links
    const webAppUrl = ScriptApp.getService().getUrl();
    const onboardingLink = `${webAppUrl}?page=onboarding&id=${caregiverId}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #65c027; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Allevia Senior Care</h2>
          <p style="color: #f0fdf4; margin: 5px 0 0; font-style: italic;">Onboarding Process</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="margin-top: 0;">Dear <strong>${details["First Name"]}</strong>,</p>
          
          <p>To finalize your application with Allevia Senior Care, please complete the onboarding process.</p>
          
          <p>We have streamlined the process into 3 simple steps:</p>
          <ol style="margin-bottom: 20px;">
            <li>Sign Independent Contractor Agreement</li>
            <li>Submit IRS W-9 Form</li>
            <li>Complete Background Check</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${onboardingLink}" style="background-color: #65c027; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(101, 192, 39, 0.2);">
                👉 Start Onboarding
            </a>
          </div>
          
          <p>Please complete these steps as soon as possible to avoid delays in your hiring process.</p>

          <br>
          <p style="margin-bottom: 5px;">Best regards,</p>
          <p style="margin: 0; font-weight: bold;">Ines k. M & Allevia Teams</p>
          <p style="margin: 0; color: #666; font-size: 14px;">Managing Director | Allevia Senior Care</p>
          
          <p style="font-size: 13px; color: #888; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            If the button doesn't work, copy this link:<br>
            <a href="${onboardingLink}" style="color: #65c027;">${onboardingLink}</a>
          </p>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; 2025 Allevia Senior Care. All rights reserved.
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: details["Email"],
      subject: subject,
      htmlBody: htmlBody,
    });

    return { success: true, message: "Onboarding email sent!" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function sendCustomEmail(cgIds, clIds, subject, message) {
  try {
    let recipients = [];

    // 1. Fetch Caregivers if needed
    if (cgIds && cgIds.length > 0) {
      const list = getCaregiverList();
      const selected = list.filter(
        (c) => cgIds.includes(c.id) && c.email && c.email.includes("@"),
      );
      recipients = recipients.concat(selected);
    }

    // 2. Fetch Clients if needed
    if (clIds && clIds.length > 0) {
      const list = getClientList();
      const selected = list.filter(
        (c) => clIds.includes(c.id) && c.email && c.email.includes("@"),
      );
      recipients = recipients.concat(selected);
    }

    if (recipients.length === 0)
      return { success: false, message: "No valid recipients found." };

    // 2. Send Emails
    // Note: For "All", this might hit quotas. For production, consider batching or BCC.
    // For now, we loop.
    let count = 0;
    recipients.forEach((r) => {
      try {
        const htmlBody = `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <p>${message.replace(/\n/g, "<br>")}</p>
            <br>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #888;">Allevia Senior Care Communication</p>
          </div>
        `;

        MailApp.sendEmail({
          to: r.email,
          subject: subject,
          htmlBody: htmlBody,
        });
        count++;
      } catch (err) {
        console.error(`Failed to send to ${r.email}: ${err.message}`);
      }
    });

    return { success: true, message: `Sent to ${count} recipient(s).` };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function resendCaregiverEmail(caregiverId) {
  try {
    const details = getCaregiverDetails(caregiverId);
    if (!details) return { success: false, message: "Caregiver not found" };

    const data = {
      firstName: details["First Name"],
      lastName: details["Last Name"],
      email: details["Email"],
      phone: details["Phone"],
    };

    sendRecruitmentEmail(data, caregiverId);
    return { success: true, message: "Email resent successfully" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function sendRejectionEmail(caregiverId) {
  try {
    const details = getCaregiverDetails(caregiverId);
    if (!details) return { success: false, message: "Caregiver not found" };

    const subject = `Update on your application with Allevia Senior Care`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #65c027; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Allevia Senior Care</h2>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="margin-top: 0;">Dear <strong>${details["First Name"]}</strong>,</p>
          
          <p>Thank you for your interest in working with Allevia Senior Care. While we’ve decided to move forward with another candidate for this particular role, we were impressed by your background and the compassion you bring to caregiving.</p>

          <p>We encourage you to stay connected with us and apply for future opportunities that may be a stronger match. Your dedication to care is valued, and we look forward to the possibility of working together in the future.</p>

          <br>
          <p style="margin-bottom: 5px;">Warm regards,</p>
          <p style="margin: 0; font-weight: bold;">Ines k. M & Allevia Teams</p>
          <p style="margin: 0; color: #666; font-size: 14px;">Managing Director | Allevia Senior Care</p>
          <p style="margin: 0; color: #666; font-size: 14px;">440-9079599</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; 2025 Allevia Senior Care. All rights reserved.
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: details["Email"],
      subject: subject,
      htmlBody: htmlBody,
    });

    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function sendPaymentSetupEmail(caregiverId) {
  try {
    const details = getCaregiverDetails(caregiverId);
    if (!details) return { success: false, message: "Caregiver not found" };

    const subject = `Action Required: Payment Setup - Allevia Senior Care`;
    const webAppUrl = ScriptApp.getService().getUrl();
    const paymentLink = `${webAppUrl}?page=payment-setup&id=${caregiverId}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #65c027; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Allevia Senior Care</h2>
          <p style="color: #f0fdf4; margin: 5px 0 0; font-style: italic;">Payment Setup</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="margin-top: 0;">Dear <strong>${details["First Name"]}</strong>,</p>
          
          <p>Congratulations! You have been activated as a caregiver with Allevia Senior Care.</p>
          
          <p>To ensure you receive your payments on time, please provide your preferred payment method and details securely using the link below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background-color: #65c027; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(101, 192, 39, 0.2);">
                👉 Setup Payment
            </a>
          </div>
          
          <p><strong>Note:</strong> If you choose Direct Deposit, please have your Bank Name, Account Number, and Routing Number ready.</p>

          <br>
          <p style="margin-bottom: 5px;">Best regards,</p>
          <p style="margin: 0; font-weight: bold;">Ines k. M & Allevia Teams</p>
          <p style="margin: 0; color: #666; font-size: 14px;">Managing Director | Allevia Senior Care</p>
          
          <p style="font-size: 13px; color: #888; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            If the button doesn't work, copy this link:<br>
            <a href="${paymentLink}" style="color: #65c027;">${paymentLink}</a>
          </p>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; 2025 Allevia Senior Care. All rights reserved.
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: details["Email"],
      subject: subject,
      htmlBody: htmlBody,
    });

    return { success: true, message: "Payment setup email sent!" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// function testEmailPermission() {
//   MailApp.getRemainingDailyQuota(); // This forces the email permission check
//   console.log("Permissions granted!");
// }

function sendIntakePacketEmail(clientId) {
  try {
    const details = getClientDetails(clientId);
    if (!details) return { success: false, message: "Client not found" };

    const subject = `Your Allevia Senior Care Intake Packet`;
    const webAppUrl = ScriptApp.getService().getUrl();
    // Assuming a page for signing documents exists or will be created
    const signLink = `${webAppUrl}?page=client-intake-sign&id=${clientId}`;
    // Assuming a page/link for downloading records exists
    const downloadLink = `${webAppUrl}?page=client-intake-records&id=${clientId}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #65c027; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Allevia Senior Care</h2>
          <p style="color: #f0fdf4; margin: 5px 0 0; font-style: italic;">Welcome to the Family</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="margin-top: 0;">Dear <strong>${details.firstName} ${details.lastName}</strong>,</p>
          
          <p>Welcome to Allevia Senior Care. We are honored to support you and your family with compassionate, reliable home care. To begin services, please review the attached intake packet.</p>
          
          <p>For clarity, we’ve separated the documents into two categories:</p>

          <div style="margin-top: 20px; margin-bottom: 20px;">
            <p style="font-weight: bold; color: #d97706; margin-bottom: 10px;">📌 Please Sign & Return:</p>
            <ul style="color: #555; font-size: 14px; line-height: 1.6;">
              <li>Client Service Agreement</li>
              <li>Exhibit A – Cost of Services</li>
              <li>Exhibit B – Plan of Care</li>
              <li>Bill of Rights (Client Rights & Responsibilities)</li>
              <li>HIPAA Release of Health Information</li>
              <li>Notice of Privacy Practices (Acknowledgment)</li>
            </ul>
            <div style="text-align: center; margin-top: 15px;">
              <a href="${signLink}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                  PLEASE SIGN AND RETURN
              </a>
            </div>
          </div>

          <hr style="border: 0; border-top: 1px dashed #eee; margin: 25px 0;">

          <div style="margin-top: 20px; margin-bottom: 20px;">
            <p style="font-weight: bold; color: #2563eb; margin-bottom: 10px;">📘 For Your Records:</p>
            <ul style="color: #555; font-size: 14px; line-height: 1.6;">
              <li>Policies and Procedures</li>
              <li>Health Information Sheet for Emergency</li>
            </ul>
             <div style="text-align: center; margin-top: 15px;">
              <a href="${downloadLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                  Download For Your Records
              </a>
            </div>
          </div>
          
          <p style="margin-top: 30px;">Once you’ve signed the required documents don’t forget to submit them. At Allevia Senior Care, we take confidentiality seriously. All information is handled in accordance with HIPAA regulations to protect your privacy.</p>

          <p>If you have any questions while reviewing the packet, please contact our office. We look forward to serving you.</p>

          <br>
          <p style="margin-bottom: 5px;">Warm regards,</p>
          <p style="margin: 0; font-weight: bold;">The Allevia Senior Care Team</p>
          <p style="margin: 0; color: #666; font-size: 14px;"><a href="${webAppUrl}" style="color: #65c027; text-decoration: none;">www.alleviaseniorcare.com</a> | 440-9079599 | <a href="mailto:info@alleviaseniorcare.com" style="color: #65c027; text-decoration: none;">info@alleviaseniorcare.com</a></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; 2025 Allevia Senior Care. All rights reserved.
        </div>
      </div>
    `;

    // Only send if email is present
    if (details.email && details.email.includes("@")) {
      MailApp.sendEmail({
        to: details.email,
        subject: subject,
        htmlBody: htmlBody,
      });
      return {
        success: true,
        message: "Intake packet email sent successfully!",
      };
    } else {
      return { success: false, message: "Client email invalid or missing." };
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: e.toString() };
  }
}
