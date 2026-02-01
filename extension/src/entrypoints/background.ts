import FileSaver from "file-saver";
import { generateArchive, generateBulkArchive } from "../archive";
import {
  ContentMessage,
  CreateArchiveFilesRequest,
  CreateArchiveFilesResponse,
  MessageStatus,
  BackgroundMessage,
  CreateArchiveJobRequest,
  ArchiveJobType,
  CreateArchiveJobResponse,
  ArchiveJobStatus,
  GetCurrentArchiveJobResponse,
} from "../messaging";
import { getProviderURL } from "../provider";
import { loadBulkArchiveConfig } from "../configuration";

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

(async () => {
  console.log("Started background process!");

  let currentJobStatus = ArchiveJobStatus.NONE;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`Received ${message.id} request.`);
    if (message.id === BackgroundMessage.CREATE_ARCHIVE_JOB) {
      (async () => {
        // Do not start a new job if one is already in progress
        if (currentJobStatus === ArchiveJobStatus.IN_PROGRESS) {
          return;
        }
        currentJobStatus = ArchiveJobStatus.IN_PROGRESS;

        const req = message as CreateArchiveJobRequest;
        if (req.jobType === ArchiveJobType.SINGLE) {
          try {
            const createArchiveFilesReq = {
              id: ContentMessage.CREATE_ARCHIVE_FILES,
            } as CreateArchiveFilesRequest;
            const currentTab = await getCurrentTab();
            const res = (await chrome.tabs.sendMessage(
              currentTab.id,
              createArchiveFilesReq
            )) as CreateArchiveFilesResponse;

            const now = new Date();
            const content = await generateArchive(res.archiveFiles);
            FileSaver.saveAs(
              content,
              `archive-${res.provider.toLowerCase()}-${now.getTime()}.zip`
            );

            sendResponse(res);
          } catch (e) {
            const res: CreateArchiveJobResponse = {
              status: MessageStatus.ERROR,
              errorMessage: e.message,
            };
            sendResponse(res);
          } finally {
            currentJobStatus = ArchiveJobStatus.NONE;
          }
        } else if (req.jobType === ArchiveJobType.BULK) {
          try {
            const config = await loadBulkArchiveConfig();
            const resEntries = [];
            for (const entry of config.entries) {
              const tab = await chrome.tabs.create({
                url: getProviderURL(entry.provider),
              });
              try {
                const createArchiveFilesReq: CreateArchiveFilesRequest = {
                  id: ContentMessage.CREATE_ARCHIVE_FILES,
                };
                // TODO: find a better way to wait for page load
                await new Promise((resolve) => setTimeout(resolve, 5000));
                const createArchiveFilesRes = (await chrome.tabs.sendMessage(
                  tab.id,
                  createArchiveFilesReq
                )) as CreateArchiveFilesResponse;
                resEntries.push({
                  provider: entry.provider,
                  status: createArchiveFilesRes.status,
                  errorMessage: createArchiveFilesRes.errorMessage,
                  archiveFiles: createArchiveFilesRes.archiveFiles,
                });
              } catch (e) {
                resEntries.push({
                  provider: entry.provider,
                  status: MessageStatus.ERROR,
                  errorMessage: e.message,
                });
              } finally {
                await chrome.tabs.remove(tab.id);
              }
            }

            const now = new Date();
            const content = await generateBulkArchive(resEntries);
            FileSaver.saveAs(content, `archive-all-${now.getTime()}.zip`);

            const res: CreateArchiveJobResponse = {
              status: MessageStatus.SUCCESS,
            };
            sendResponse(res);
          } catch (e) {
            const res: CreateArchiveJobResponse = {
              status: MessageStatus.ERROR,
              errorMessage: e.message,
            };
            sendResponse(res);
          } finally {
            currentJobStatus = ArchiveJobStatus.NONE;
          }
        }
      })();
      return true;
    } else if (message.id === BackgroundMessage.GET_CURRENT_ARCHIVE_JOB) {
      const res: GetCurrentArchiveJobResponse = {
        status: MessageStatus.SUCCESS,
        jobStatus: currentJobStatus,
      };
      sendResponse(res);
      return true;
    }
  });
})();
