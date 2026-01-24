import FileSaver from "file-saver";
import * as chatgpt from "../chatgpt";
import { Message } from "../messaging";

(async () => {
  console.log("Started archiver content!");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.id === Message.CREATE_ARCHIVE) {
      (async () => {
        // TODO: check if on chatgpt site
        const content = await chatgpt.generateArchive();
        FileSaver.saveAs(content, "example.zip");
        sendResponse({});
      })();
      return true;
    }
  });
})();
