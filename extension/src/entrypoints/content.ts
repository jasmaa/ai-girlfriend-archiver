import FileSaver from "file-saver";
import { CreateArchiveFilesResponse, Message, Status } from "../messaging";
import { determineCurrentProvider } from "../provider";
import { generateArchive, generateArchiveFiles } from "../archive";

(async () => {
  console.log("Started archiver content!");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.id === Message.CREATE_ARCHIVE_FILES) {
      (async () => {
        try {
          const provider = determineCurrentProvider();
          const archiveFiles = await generateArchiveFiles(provider);

          const res: CreateArchiveFilesResponse = {
            status: Status.SUCCESS,
            provider,
            archiveFiles,
          };
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
    }
  });
})();
