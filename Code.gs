function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('GTM API Call')
    .addItem('Open GTM Sidebar', 'startForm')
    .addToUi();
}

function startForm() {
  const html = HtmlService.createHtmlOutputFromFile('sidebar')
    .setTitle('GTM API Tools');
  SpreadsheetApp.getUi().showSidebar(html);
}

function getAccounts() {
  const accessToken = ScriptApp.getOAuthToken();
  const url = 'https://www.googleapis.com/tagmanager/v2/accounts';
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + accessToken }
  });
  const json = JSON.parse(response.getContentText());
  return json.account || [];
}

function getContainers(accountId) {
  const accessToken = ScriptApp.getOAuthToken();
  const url = `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers`;
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + accessToken }
  });
  const json = JSON.parse(response.getContentText());
  return json.container || [];
}

function getWorkspace(accountId, containerId) {
  const accessToken = ScriptApp.getOAuthToken();
  const url = `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces`;
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + accessToken }
  });
  const json = JSON.parse(response.getContentText());
  return json.workspace || [];
}


function getGTMTriggers(accountId, containerId, workspaceId) {
  const accessToken = ScriptApp.getOAuthToken();
  const workspaceUrl = `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces`;
  const response = UrlFetchApp.fetch(workspaceUrl, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + accessToken }
  });
  const json = JSON.parse(response.getContentText());
  const workspaces = json.workspace;
  const triggerMap = {};

  const triggerSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Triggers")
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Triggers");
  triggerSheet.clearContents();
  triggerSheet.appendRow(["Workspace Name", "Trigger Name", "Trigger Type", "Trigger ID", "Event Name"]);

  if (workspaces && workspaces.length > 0) {
    workspaces.forEach(wp => {
      const triggersUrl = `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${wp.workspaceId}/triggers`;
      const triggerResponse = UrlFetchApp.fetch(triggersUrl, {
        method: 'get',
        headers: { Authorization: 'Bearer ' + accessToken }
      });
      const triggerJson = JSON.parse(triggerResponse.getContentText());

      if (triggerJson.trigger) {
        triggerJson.trigger.forEach(trigger => {
          triggerMap[trigger.triggerId] = trigger.name;
          triggerSheet.appendRow([
            wp.name,
            trigger.name,
            trigger.type,
            trigger.triggerId,
            trigger.eventName || ""
          ]);
        });
      }
    });

    const tagSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags")
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Tags");
    tagSheet.clearContents();
    tagSheet.appendRow([
      "Path", "Tag ID", "Tag Name", "Firing Triggers (Names)",
      "Set up Tag", "Paused", "Monitoring Meta", "Consent Settings"
    ]);

    workspaces.forEach(wp => {
      const tagsUrl = `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${wp.workspaceId}/tags`;
      const tagResponse = UrlFetchApp.fetch(tagsUrl, {
        method: 'get',
        headers: { Authorization: 'Bearer ' + accessToken }
      });
      const tagJson = JSON.parse(tagResponse.getContentText());

      if (tagJson.tag) {
        tagJson.tag.forEach(tag => {
          const triggerNames = (tag.firingTriggerId || []).map(id => `${triggerMap[id] || "Unknown"} - ${id}`).join(", ");
          tagSheet.appendRow([
            tag.path,
            tag.tagId,
            tag.name,
            triggerNames,
            JSON.stringify(tag.setupTag || []),
            tag.paused || false,
            JSON.stringify(tag.monitoringMetadata || {}),
            JSON.stringify(tag.consentSettings || {})
          ]);
        });
      }
    });
  }
}
