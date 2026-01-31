import {
  Message,
  CreateArchiveRequest,
  CreateArchiveResponse,
  Status,
} from "../messaging";

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

(async () => {
  console.log("Started background process!");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`Received ${message.id} request.`);
    if (message.id === Message.CREATE_ARCHIVE) {
      (async () => {
        try {
          const req = message as CreateArchiveRequest;
          const currentTab = await getCurrentTab();
          const res = await chrome.tabs.sendMessage(currentTab.id, req);
          sendResponse(res);
        } catch (e) {
          const res: CreateArchiveResponse = {
            status: Status.ERROR,
            errorMessage: e.message,
          };
          sendResponse(res);
        }
      })();
      return true;
    }
  });
})();
