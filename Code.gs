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


// Create a new sheet for all tags 
  const tagsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags") || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Tags");
  tagsheet.clearContents();
  tagsheet.appendRow(["Path", "Tag ID","Tag Name", "Firing Rule ID", "Set up Tag", "Paused Status","Monitoring Meta Data","Consent Settings" 
  ]);

  if(workspaces && workspaces.length > 0)

  workspaces.forEach(wp => {
    const workspaceId = wp.workspaceId;
    const tagsURL = "https://tagmanager.googleapis.com/tagmanager/v2/accounts/"+accountId+"/containers/"+containerId+"/workspaces/"+workspaceId+"/tags"

    const tagResponse = UrlFetchApp.fetch(tagsURL, {
        method: 'get',
        headers: {
          Authorization: 'Bearer ' + accessToken
        },
        muteHttpExceptions: true
      });
   
      
    const tagJson = JSON.parse(tagResponse.getContentText());
      if (tagJson.tag && tagJson.tag.length > 0) {
        tagJson.tag.forEach(tag => {
    
          tagsheet.appendRow([
            tag.path,
            tag.tagId,
            tag.name,
            tag.setupTag,
            tag.paused, 
            tag.monitoringMetadata,
            tag.consentSettings
            
          ]);
        });
      } else {
        tagsheet.appendRow([wp.name, "No Tags found", "", ""]);
      }
    });
  } else {
    tagsheet.appendRow(["No workspaces found"]);
  }
}
