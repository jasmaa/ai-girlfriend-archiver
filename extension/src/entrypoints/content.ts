import FileSaver from "file-saver";
import * as chatgpt from "../providers/chatgpt";
import * as copilot from "../providers/copilot";
import * as gemini from "../providers/gemini";
import * as claude from "../providers/claude";
import * as perplexity from "../providers/perplexity";
import * as grok from "../providers/grok";
import * as deepseek from "../providers/deepseek";
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
          const content = await gemini.generateArchive();
          FileSaver.saveAs(content, "example.zip");
        } else if (provider === Provider.CLAUDE) {
          const content = await claude.generateArchive();
          FileSaver.saveAs(content, "example.zip");
        } else if (provider === Provider.PERPLEXITY) {
          const content = await perplexity.generateArchive();
          FileSaver.saveAs(content, "example.zip");
        } else if (provider === Provider.GROK) {
          const content = await grok.generateArchive();
          FileSaver.saveAs(content, "example.zip");
        } else if (provider === Provider.DEEPSEEK) {
          const content = await deepseek.generateArchive();
          FileSaver.saveAs(content, "example.zip");
        } else {
          console.log("No supported provider found. Skipping.");
        }
        sendResponse({});
      })();
      return true;
    }
  });
})();
