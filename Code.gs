function getGTMTriggers() {
  const accessToken = ScriptApp.getOAuthToken();
  const accountId = '6220049883';
  const containerId = '179091495';

  // Step 1: Fetch all workspaces
  const workspaceUrl = `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces`;

  const response = UrlFetchApp.fetch(workspaceUrl, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + accessToken
    },
    muteHttpExceptions: true
  });

  const json = JSON.parse(response.getContentText());
  const workspaces = json.workspace;

  // Step 2: Create or select the "Triggers" tab
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Triggers")
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Triggers");
  sheet.clearContents();
  sheet.appendRow(["Workspace Name", "Trigger Name", "Trigger Type", "Trigger ID", "Event Name"]);

  // Step 3: Loop through workspaces and fetch triggers
  if (workspaces && workspaces.length > 0) {
    workspaces.forEach(wp => {
      const workspaceId = wp.workspaceId;
      const triggersUrl = `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers`;

      const triggerResponse = UrlFetchApp.fetch(triggersUrl, {
        method: 'get',
        headers: {
          Authorization: 'Bearer ' + accessToken
        },
        muteHttpExceptions: true
      });

      const triggerJson = JSON.parse(triggerResponse.getContentText());

      if (triggerJson.trigger && triggerJson.trigger.length > 0) {
        triggerJson.trigger.forEach(trigger => {
          sheet.appendRow([
            wp.name,
            trigger.name,
            trigger.type,
            trigger.triggerId,
            trigger.eventName
          ]);
        });
      } else {
        sheet.appendRow([wp.name, "No triggers found", "", ""]);
      }
    });
  } else {
    sheet.appendRow(["No workspaces found"]);
  }
}
