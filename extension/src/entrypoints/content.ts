import {
  CreateArchiveFilesResponse,
  ContentMessage,
  MessageStatus,
  GetStatusResponse,
} from "../messaging";
import { determineCurrentProvider } from "../provider";
import { generateArchiveFiles } from "../scrapers";

(async () => {
  console.log("Started archiver content!");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.id === ContentMessage.CREATE_ARCHIVE_FILES) {
      (async () => {
        try {
          const provider = determineCurrentProvider();
          const archiveFiles = await generateArchiveFiles(provider);

          const res: CreateArchiveFilesResponse = {
            status: MessageStatus.SUCCESS,
            provider,
            archiveFiles,
          };
          sendResponse(res);
        } catch (e) {
          const res: CreateArchiveFilesResponse = {
            status: MessageStatus.ERROR,
            errorMessage: e.message,
          };
          sendResponse(res);
        }
      })();
      return true;
    } else if (message.id === ContentMessage.GET_STATUS) {
      const res: GetStatusResponse = {
        status: MessageStatus.SUCCESS,
      };
      sendResponse(res);
    }
  });
})();
