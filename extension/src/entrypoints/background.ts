import {
  Message,
  CreateArchiveRequest,
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
        const req = message as CreateArchiveRequest;

        const currentTab = await getCurrentTab();
        await chrome.tabs.sendMessage(currentTab.id, req);

        sendResponse({});
      })();
      return true;
    }
  });
})();