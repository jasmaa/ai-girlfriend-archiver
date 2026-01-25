import FileSaver from "file-saver";
import * as chatgpt from "../providers/chatgpt";
import * as copilot from "../providers/copilot";
import { Message } from "../messaging";
import { determineCurrentProvider, Provider } from "../provider";

(async () => {
  console.log("Started archiver content!");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.id === Message.CREATE_ARCHIVE) {
      (async () => {
        const provider = determineCurrentProvider();
        if (provider === Provider.CHATGPT) {
          const content = await chatgpt.generateArchive();
          FileSaver.saveAs(content, "example.zip");
        } else if (provider === Provider.COPILOT) {
          const content = await copilot.generateArchive();
          FileSaver.saveAs(content, "example.zip");
        } else if (provider === Provider.GEMINI) {
          // TODO
        } else {
          console.log("No supported provider found. Skipping.");
        }
        sendResponse({});
      })();
      return true;
    }
  });
})();
