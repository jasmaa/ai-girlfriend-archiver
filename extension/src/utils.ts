import {
  ContentMessage,
  GetStatusRequest,
  GetStatusResponse,
  MessageStatus,
} from "./messaging";

export async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export async function waitForContentScriptAvailable(tabId: number) {
  // Attempt connecting to content script retrying with exponential backoff
  const MAX_RETRIES = 5;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const getStatusReq: GetStatusRequest = {
        id: ContentMessage.GET_STATUS,
      };
      const getStatusRes = (await chrome.tabs.sendMessage(
        tabId,
        getStatusReq
      )) as GetStatusResponse;

      if (getStatusRes.status === MessageStatus.SUCCESS) {
        break;
      } else {
        throw new Error("Did not receive SUCCESS message");
      }
    } catch (e) {
      if (i < MAX_RETRIES - 1) {
        console.log(`Content script was not healthy on try=${i}. Retrying...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * Math.pow(2, i))
        );
      } else {
        throw e;
      }
    }
  }
}
