import FileSaver from "file-saver";
import { generateArchive, generateBulkArchive } from "../archive";
import {
  Message,
  CreateArchiveFilesRequest,
  CreateArchiveFilesResponse,
  Status,
  BulkCreateArchiveFilesRequest,
  BulkCreateArchiveFilesResponse,
} from "../messaging";
import { getProviderURL, Provider } from "../provider";

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
    if (message.id === Message.CREATE_ARCHIVE_FILES) {
      (async () => {
        try {
          const req = message as CreateArchiveFilesRequest;
          const currentTab = await getCurrentTab();
          const res = await chrome.tabs.sendMessage(currentTab.id, req);

          const now = new Date();
          const content = await generateArchive(res);
          FileSaver.saveAs(
            content,
            `archive-${res.provider.toLowerCase()}-${now.getTime()}.zip`
          );

          sendResponse(res);
        } catch (e) {
          const res: CreateArchiveFilesResponse = {
            status: Status.ERROR,
            errorMessage: e.message,
          };
          sendResponse(res);
        }
      })();
      return true;
    } else if (message.id === Message.BULK_CREATE_ARCHIVE_FILES) {
      (async () => {
        try {
          const req = message as BulkCreateArchiveFilesRequest;

          const resEntries = [];
          for (const entry of req.entries) {
            const tab = await chrome.tabs.create({
              url: getProviderURL(entry.provider),
            });
            try {
              const createArchiveFilesReq: CreateArchiveFilesRequest = {
                id: Message.CREATE_ARCHIVE_FILES,
              };
              // TODO: find a better way to wait for page load
              await new Promise((resolve) => setTimeout(resolve, 5000));
              const createArchiveFilesRes = await chrome.tabs.sendMessage(
                tab.id,
                createArchiveFilesReq
              );
              resEntries.push({
                provider: entry.provider,
                status: createArchiveFilesRes.status,
                errorMessage: createArchiveFilesRes.errorMessage,
                archiveFiles: createArchiveFilesRes.archiveFiles,
              });
            } catch (e) {
              resEntries.push({
                provider: entry.provider,
                status: Status.ERROR,
                errorMessage: e.message,
              });
            } finally {
              await chrome.tabs.remove(tab.id);
            }
          }

          const res: BulkCreateArchiveFilesResponse = {
            status: Status.SUCCESS,
            entries: resEntries,
          };

          const now = new Date();
          const content = await generateBulkArchive(res);
          FileSaver.saveAs(content, `archive-all-${now.getTime()}.zip`);

          sendResponse(res);
        } catch (e) {
          const res: BulkCreateArchiveFilesResponse = {
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
