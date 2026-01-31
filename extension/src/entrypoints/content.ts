import FileSaver from "file-saver";
import { CreateArchiveResponse, Message, Status } from "../messaging";
import { determineCurrentProvider } from "../provider";
import { generateArchive, generateArchiveFiles } from "../archive";

(async () => {
  console.log("Started archiver content!");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.id === Message.CREATE_ARCHIVE) {
      (async () => {
        try {
          const now = new Date();
          const provider = determineCurrentProvider();
          const archiveFiles = await generateArchiveFiles(provider);
          const content = await generateArchive(archiveFiles);
          FileSaver.saveAs(
            content,
            `archive-${provider.toLowerCase()}-${now.getTime()}.zip`
          );

          const res: CreateArchiveResponse = {
            status: Status.SUCCESS,
          };
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
