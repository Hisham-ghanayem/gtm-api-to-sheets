function getGTMContainers() {
  const accessToken = ScriptApp.getOAuthToken();
  const accountId = '6220049883';

  const url = "https://www.googleapis.com/tagmanager/v2/accounts/" + accountId + "/containers";

  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + accessToken 
    },
    muteHttpExceptions: true // If the code fail to connect with the API then dont crash the code, this helps to debug manually
  });

  const json = JSON.parse(response.getContentText());

  // Connect to your Google Sheet
  const sheet = SpreadsheetApp.openById("1J5G1SIK6j8ALbhSlweblEX9CxRRAv2lQpbTkRND8px0").getSheetByName("Sheet1");

  sheet.clearContents(); // optional: clear old data
  sheet.appendRow(["Container Name", "Container ID", "Public ID", "Tag Manager URL"]);

  // Loop through each container and write to sheet
  json.container.forEach(container => {
    sheet.appendRow([
      container.name,
      container.containerId,
      container.publicId,
      container.tagManagerUrl
    ]);
  });
}
