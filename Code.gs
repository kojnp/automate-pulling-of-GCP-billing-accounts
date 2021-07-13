function getMyGCPBillingAccounts() {

  var url = 'https://cloudbilling.googleapis.com/v1/billingAccounts';
  var token = ScriptApp.getOAuthToken();
  var headers = {
    'Authorization' : 'Bearer ' + token
  }
  var options = {
    'headers' : headers,
    'method' : 'get'
  };

  var response = UrlFetchApp.fetch(url, options);
  var data = JSON.parse(response.getContentText());
  var billingAccounts = data.billingAccounts;
  var rows = [];
  var billingAccount;
  
  Logger.log(billingAccounts);

  for (i = 0; i < billingAccounts.length; i++) {
    billingAccount = billingAccounts[i];
    rows.push([billingAccount.name, billingAccount.name.split("/")[1], billingAccount.open, billingAccount.displayName, billingAccount.masterBillingAccount]);
  }
  
  newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();

  newSheet.getRange(1, 1, 1, 5).setValues([["Billing Account ID - raw", "Billing Account ID", "OPEN?", "display name", "master Billing Account ID"]]);

  var today = Utilities.formatDate(new Date(), "EST", "MM/dd/yyyy")
  newSheet.setName("ba_"+today);

  newSheet.getRange(2, 1, rows.length, 5).setValues(rows);

  var dataRange = newSheet.getDataRange();
  var firstColumn = dataRange.getColumn();
  var lastColumn = dataRange.getLastColumn();
  newSheet.autoResizeColumns(firstColumn, lastColumn);

  var changeRange = newSheet.getRange(1, 1, 1, 5);
  changeRange.setBackground("yellow");

  var url_to_sheet = getSheetUrl(newSheet);
  Logger.log(url_to_sheet);
  sendEmails(url_to_sheet);
}

function sendEmails(url_to_sheet) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CONFIG - DO NOT RENAME");
  
  var startRow = 2; // First row of data to process
  const lrow = sheet.getRange("C2").getNextDataCell(SpreadsheetApp.Direction.DOWN).getLastRow()

  var numRows = lrow - 1; // Number of rows to process
  
  var dataRange = sheet.getRange(startRow, 3, numRows, 1);
  
  var data = dataRange.getValues();
  for (var i in data) {
    var row = data[i];
    var emailAddress = row[0];
    var subject = 'Billing Accounts Execution result';
    var message = "Found here: " + url_to_sheet;
    MailApp.sendEmail(emailAddress, subject, message);
  }
}

function getSheetUrl(sht) {
  var ss = SpreadsheetApp.getActive(),
      url = '';

  sht = sht ? sht : ss.getActiveSheet();

  url = (ss.getUrl() + '#gid=' + ss.getSheetId());

  return url;
}

