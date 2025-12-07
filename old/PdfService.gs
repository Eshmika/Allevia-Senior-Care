// PdfService.gs - Handles PDF generation

function exportClientToPdf(clientCode) {
  // We can call functions from ClientRepository directly!
  const c = getClientDetails(clientCode);
  
  if (!c) throw new Error("Client not found");

  // HTML Template for PDF
  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; font-size: 10px; color: #333; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #65c027; padding-bottom: 10px; }
          .header h1 { color: #65c027; font-size: 20px; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          
          .section { margin-bottom: 15px; page-break-inside: avoid; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
          .section-title { background: #65c027; color: white; padding: 5px 10px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
          .content { padding: 8px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
          td { vertical-align: top; padding: 3px; }
          .label { font-weight: bold; color: #555; font-size: 9px; display: block; text-transform: uppercase; margin-bottom: 2px; }
          .value { color: #000; font-size: 10px; min-height: 12px; }
          .note { font-style: italic; color: #666; margin-left: 5px; }
          
          .sub-header { font-weight: bold; border-bottom: 1px dashed #ccc; margin: 8px 0 4px 0; padding-bottom: 2px; color: #444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Client Profile: ${c.firstName} ${c.lastName}</h1>
          <p>Client Code: <b>${c.clientCode}</b> | Status: <b>${c.status}</b></p>
        </div>

        <!-- 1. PERSONAL -->
        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="content">
            <table>
              <tr>
                <td width="25%"><span class="label">Full Name</span><div class="value">${c.firstName} ${c.middleName} ${c.lastName}</div></td>
                <td width="25%"><span class="label">Date of Birth (Age)</span><div class="value">${c.dob} (${c.age})</div></td>
                <td width="25%"><span class="label">SSN</span><div class="value">${c.ssn}</div></td>
                <td width="25%"><span class="label">Gender</span><div class="value">${c.gender}</div></td>
              </tr>
              <tr>
                <td><span class="label">Marital Status</span><div class="value">${c.maritalStatus}</div></td>
                <td><span class="label">Language</span><div class="value">${c.primaryLang}</div></td>
                <td><span class="label">Payment Type</span><div class="value">${c.paymentType}</div></td>
                <td><span class="label">Agreement</span><div class="value">${c.agreementStatus}</div></td>
              </tr>
              <tr>
                <td><span class="label">Active Date</span><div class="value">${c.activeDate}</div></td>
                <td><span class="label">Deactive Date</span><div class="value">${c.deactiveDate}</div></td>
                <td colspan="2"><span class="label">Photo URL</span><div class="value" style="font-size:8px; overflow:hidden;">${c.photoUrl}</div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 2. CONTACTS & ADDRESSES -->
        <div class="section">
          <div class="section-title">Contact & Addresses</div>
          <div class="content">
            <table>
              <tr>
                <td width="25%"><span class="label">Email 1</span><div class="value">${c.email}</div></td>
                <td width="25%"><span class="label">Email 2</span><div class="value">${c.email2}</div></td>
                <td width="25%"><span class="label">Cell Phone</span><div class="value">${c.cellPhone}</div></td>
                <td width="25%"><span class="label">Home Phone</span><div class="value">${c.homePhone}</div></td>
              </tr>
            </table>
            <div style="margin-top:5px; border-top:1px dashed #eee; padding-top:5px;">
              <table>
                <tr>
                  <td width="50%">
                    <span class="label">Living Address</span>
                    <div class="value">${c.livingAddress}<br>${c.livingCity}, ${c.livingState} ${c.livingZip}</div>
                  </td>
                  <td width="50%">
                    <span class="label">Billing Address</span>
                    <div class="value">${c.billingAddress}<br>${c.billingCity}, ${c.billingState} ${c.billingZip}</div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- 3. ADDITIONAL CONTACTS -->
        <div class="section">
          <div class="section-title">Additional Contacts</div>
          <div class="content">
            <div class="sub-header">Second Contact</div>
            <table>
              <tr>
                <td width="30%"><span class="label">Name</span><div class="value">${c.con2FirstName} ${c.con2LastName}</div></td>
                <td width="30%"><span class="label">Email</span><div class="value">${c.con2Email}</div></td>
                <td width="20%"><span class="label">Cell</span><div class="value">${c.con2Cell}</div></td>
                <td width="20%"><span class="label">Home</span><div class="value">${c.con2Home}</div></td>
              </tr>
              <tr>
                <td colspan="4"><span class="label">Address</span><div class="value">${c.con2Addr}, ${c.con2City}, ${c.con2State} ${c.con2Zip}</div></td>
              </tr>
            </table>
            
            <div class="sub-header" style="color:#d32f2f;">Emergency Contact</div>
            <table>
              <tr>
                <td width="20%"><span class="label">Relation</span><div class="value">${c.emergRelation}</div></td>
                <td width="30%"><span class="label">Name</span><div class="value">${c.emergFirstName} ${c.emergLastName}</div></td>
                <td width="30%"><span class="label">Email</span><div class="value">${c.emergEmail}</div></td>
                <td width="20%"><span class="label">Phone 1</span><div class="value">${c.emergPhone1}</div></td>
              </tr>
               <tr>
                <td colspan="4"><span class="label">Address</span><div class="value">${c.emergAddr}, ${c.emergCity}, ${c.emergState} ${c.emergZip}</div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 4. CARE & ASSESSMENT -->
        <div class="section">
          <div class="section-title">Clinical Assessment</div>
          <div class="content">
            <table>
              <tr>
                <td width="20%"><span class="label">Assess Date</span><div class="value">${c.assessDate}</div></td>
                <td width="20%"><span class="label">Height</span><div class="value">${c.height}</div></td>
                <td width="20%"><span class="label">Weight</span><div class="value">${c.weight} lbs</div></td>
                <td width="40%"><span class="label">Mental Status</span><div class="value">${c.mentalStatus}</div></td>
              </tr>
            </table>
            <div style="margin-top:5px;">
              <span class="label">Diagnosis</span><div class="value" style="margin-bottom:5px;">${c.diagnosis}</div>
              <span class="label">Service Needs</span><div class="value" style="margin-bottom:5px;">${c.serviceNeeds}</div>
              <span class="label">Goals</span><div class="value">${c.goals}</div>
            </div>
          </div>
        </div>

        <!-- 5. LIFESTYLE -->
        <div class="section">
          <div class="section-title">Lifestyle & Living</div>
          <div class="content">
            <table>
              <tr>
                <td><span class="label">Living Alone?</span><div class="value">${c.livingAlone} <span class="note">${c.livingAloneNote}</span></div></td>
                <td><span class="label">Pets?</span><div class="value">${c.pets} <span class="note">${c.petsNote}</span></div></td>
                <td><span class="label">Smoke?</span><div class="value">${c.smoke} <span class="note">${c.smokeNote}</span></div></td>
                <td><span class="label">Drink?</span><div class="value">${c.drink} <span class="note">${c.drinkNote}</span></div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 6. MEDICAL -->
        <div class="section">
          <div class="section-title">Medical Overview</div>
          <div class="content">
            <div class="sub-header">Medications</div>
            <table>
              <tr>
                <td><span class="label">Can Direct Care?</span><div class="value">${c.canDirect}</div></td>
                <td><span class="label">Self Admin?</span><div class="value">${c.selfAdmin}</div></td>
                <td><span class="label">Taking Meds?</span><div class="value">${c.takingMeds}</div></td>
                <td><span class="label">Allergies?</span><div class="value">${c.allergies}</div></td>
              </tr>
              <tr>
                 <td colspan="4"><span class="label">Overseeing Resp?</span><div class="value">${c.overseeingResp} <span class="note">(${c.overseeingNote})</span></div></td>
              </tr>
            </table>

            <div class="sub-header">Providers</div>
            <table>
              <tr>
                <td width="33%"><span class="label">Primary Doctor</span><div class="value">${c.drName}<br>${c.drPhone}<br><span class="note">${c.drLoc}</span></div></td>
                <td width="33%"><span class="label">Pharmacy</span><div class="value">${c.pharmName}<br>${c.pharmPhone}<br><span class="note">${c.pharmLoc}</span></div></td>
                <td width="33%"><span class="label">Hospital</span><div class="value">${c.hospName}<br>${c.hospPhone}<br><span class="note">${c.hospLoc}</span></div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 7. SKILLS & OTHER -->
        <div class="section">
          <div class="section-title">Other Details</div>
          <div class="content">
             <table>
               <tr>
                 <td width="50%">
                    <span class="label">Vaccinations</span>
                    <div class="value">Covid: ${c.vaxCovid}</div>
                    <div class="value">Flu: ${c.vaxFlu}</div>
                 </td>
                 <td width="50%">
                    <span class="label">Languages</span>
                    <div class="value">${c.lang1}, ${c.lang2}, ${c.lang3}</div>
                 </td>
               </tr>
             </table>
             <div style="margin-top:5px;">
               <span class="label">Skills / Interests</span>
               <div class="value">${c.skill1}, ${c.skill2}, ${c.skill3}, ${c.skill4}, ${c.skill5}, ${c.skill6}</div>
             </div>
          </div>
        </div>

        <div style="text-align:center; font-size:9px; color:#999; margin-top:10px;">
           Generated on ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `;
  
  const blob = Utilities.newBlob(html, MimeType.HTML).getAs(MimeType.PDF);
  blob.setName(`${c.firstName}_${c.lastName}_Full_Report.pdf`);
  return { base64: Utilities.base64Encode(blob.getBytes()), name: blob.getName() };
}

// --- CAREGIVER PDF ---
function exportCaregiverToPdf(cgCode) {
  const c = getCaregiverDetails(cgCode);
  if (!c) throw new Error("Caregiver not found");

  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; font-size: 10px; color: #333; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #65c027; padding-bottom: 10px; }
          .header h1 { color: #65c027; font-size: 20px; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin-bottom: 15px; page-break-inside: avoid; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
          .section-title { background: #65c027; color: white; padding: 5px 10px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
          .content { padding: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
          td { vertical-align: top; padding: 3px; }
          .label { font-weight: bold; color: #555; font-size: 9px; display: block; text-transform: uppercase; margin-bottom: 2px; }
          .value { color: #000; font-size: 10px; min-height: 12px; }
          .sub-header { font-weight: bold; border-bottom: 1px dashed #ccc; margin: 8px 0 4px 0; padding-bottom: 2px; color: #444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Caregiver Profile: ${c.firstName} ${c.lastName}</h1>
          <p>Code: <b>${c.cgCode}</b> | Title: <b>${c.title}</b> | Status: <b>${c.status}</b></p>
        </div>

        <!-- 1. PERSONAL INFO -->
        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="content">
            <table>
              <tr>
                <td width="25%"><span class="label">Full Name</span><div class="value">${c.firstName} ${c.middleName} ${c.lastName}</div></td>
                <td width="25%"><span class="label">DOB (Age)</span><div class="value">${c.dob} (${c.age})</div></td>
                <td width="25%"><span class="label">SSN / EIN</span><div class="value">${c.ssn}</div></td>
                <td width="25%"><span class="label">Gender</span><div class="value">${c.gender}</div></td>
              </tr>
              <tr>
                <td><span class="label">Marital Status</span><div class="value">${c.maritalStatus}</div></td>
                <td><span class="label">Language</span><div class="value">${c.primaryLang}</div></td>
                <td><span class="label">Agreement</span><div class="value">${c.agreementStatus}</div></td>
                <td><span class="label">Dates</span><div class="value">Active: ${c.activeDate}<br>Deactive: ${c.deactiveDate}</div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 2. CONTACT & ADDRESS -->
        <div class="section">
          <div class="section-title">Contact Information</div>
          <div class="content">
            <table>
              <tr>
                <td width="25%"><span class="label">Email 1</span><div class="value">${c.email}</div></td>
                <td width="25%"><span class="label">Email 2</span><div class="value">${c.email2}</div></td>
                <td width="25%"><span class="label">Cell</span><div class="value">${c.cellPhone}</div></td>
                <td width="25%"><span class="label">Home</span><div class="value">${c.homePhone}</div></td>
              </tr>
              <tr>
                <td colspan="4"><span class="label">Address</span><div class="value">${c.address}, ${c.city}, ${c.state} ${c.zip}</div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 3. PROFESSIONAL & CERTS -->
        <div class="section">
          <div class="section-title">Professional Details</div>
          <div class="content">
            <table>
              <tr>
                <td width="25%"><span class="label">Title</span><div class="value">${c.title}</div></td>
                <td width="25%"><span class="label">Cert 1</span><div class="value">${c.cert1}</div></td>
                <td width="25%"><span class="label">Cert 2</span><div class="value">${c.cert2}</div></td>
                <td width="25%"><span class="label">Cert 3</span><div class="value">${c.cert3}</div></td>
              </tr>
              <tr>
                <td colspan="4"><span class="label">Able to Drive?</span><div class="value">${c.drive}</div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 4. BANKING (SENSITIVE - MASKED) -->
        <div class="section">
          <div class="section-title">Payment Information</div>
          <div class="content">
            <table>
              <tr>
                <td width="33%"><span class="label">Method</span><div class="value">${c.paymentMethod}</div></td>
                <td width="33%"><span class="label">Account #</span><div class="value">****${String(c.accountNum).slice(-4)}</div></td>
                <td width="33%"><span class="label">Routing #</span><div class="value">****${String(c.routingNum).slice(-4)}</div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 5. CARE PREFERENCES -->
        <div class="section">
          <div class="section-title">Care Matching Preferences</div>
          <div class="content">
            <table>
              <tr>
                <td width="25%"><span class="label">Gender Pref</span><div class="value">${c.prefGender}</div></td>
                <td width="25%"><span class="label">Max Height/Weight</span><div class="value">${c.maxHeight} / ${c.maxWeight}</div></td>
                <td width="25%"><span class="label">Pets?</span><div class="value">${c.petsPref} (${c.accPets})</div></td>
                <td width="25%"><span class="label">Smoke/Drink</span><div class="value">Smoke: ${c.smokePref}<br>Drink: ${c.drinkPref}</div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 6. EMERGENCY CONTACT -->
        <div class="section">
          <div class="section-title">Emergency Contact</div>
          <div class="content">
            <table>
              <tr>
                <td><span class="label">Name (Relation)</span><div class="value">${c.emergName} (${c.emergRelation})</div></td>
                <td><span class="label">Email</span><div class="value">${c.emergEmail}</div></td>
                <td><span class="label">Phone</span><div class="value">${c.emergPhone1} / ${c.emergPhone2}</div></td>
              </tr>
              <tr>
                <td colspan="3"><span class="label">Address</span><div class="value">${c.emergAddr}, ${c.emergCity}, ${c.emergState} ${c.emergZip}</div></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 7. SKILLS & VAX -->
        <div class="section">
          <div class="section-title">Skills & Qualifications</div>
          <div class="content">
             <div class="sub-header">Languages</div>
             <div class="value">${c.lang1}, ${c.lang2}, ${c.lang3}</div>
             
             <div class="sub-header">Skills</div>
             <div class="value" style="line-height:1.4;">${c.skill1}, ${c.skill2}, ${c.skill3}, ${c.skill4}, ${c.skill5}, ${c.skill6}</div>
             
             <div class="sub-header">Vaccinations</div>
             <div class="value">Covid: ${c.vaxCovid} | Flu: ${c.vaxFlu}</div>
          </div>
        </div>

        <div style="text-align:center; font-size:9px; color:#999; margin-top:10px;">
           Generated on ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `;
  
  const blob = Utilities.newBlob(html, MimeType.HTML).getAs(MimeType.PDF);
  blob.setName(`${c.firstName}_${c.lastName}_Caregiver_Profile.pdf`);
  return { base64: Utilities.base64Encode(blob.getBytes()), name: blob.getName() };
}