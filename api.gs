const FILE_ID = "19zdyigxSuuwSWioFRTPQG_vbAgrFBXTc";  // معرّف ملف license.key على Google Drive

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const device_id = e.parameter.device_id;
  const username = e.parameter.username;

  if (!device_id) {
    return ContentService.createTextOutput("missing_device_id");
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === device_id) {
      const status = (data[i][1] || "").toLowerCase();
      return ContentService.createTextOutput(status || "pending");
    }
  }

  // ✅ إضافة الجهاز الجديد
  sheet.appendRow([device_id, "pending", username || ""]);

  // ✅ إرسال إيميل فور الإضافة
  sendNewDeviceEmail(device_id, username);

  return ContentService.createTextOutput("pending");
}

function updateLicenseFile(device_id) {
  const file = DriveApp.getFileById(FILE_ID);
  const content = file.getBlob().getDataAsString();

  let decoded = "";
  try {
    decoded = Utilities.base64Decode(content).toString();
  } catch (e) {
    decoded = "";
  }

  const lines = decoded.split("\n").map(l => l.trim()).filter(l => l);

  if (!lines.includes(device_id)) {
    lines.push(device_id);
    const updated = lines.join("\n");
    const encoded = Utilities.base64Encode(updated);
    file.setContent(encoded);
  }
}

function sendNewDeviceEmail(device_id, username) {
  const email = "ahmad1999a3388@gmail.com"; // ✏️ غيّر الإيميل هنا
  const subject = "New Device Added";
  const message = `A new device has been added.\n\nDevice ID: ${device_id}\nUsername: ${username || "N/A"}`;

  MailApp.sendEmail(email, subject, message);
}
