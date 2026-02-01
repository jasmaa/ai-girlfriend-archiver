import JSZip from "jszip";
import { generateArchive, generateBulkArchive } from "./archive";
import {
  BulkCreateArchiveFilesResponse,
  CreateArchiveFilesResponse,
  MessageStatus,
} from "./messaging";
import { Provider } from "./provider";

describe("test generateArchive", () => {
  it("generates archive", async () => {
    const res: CreateArchiveFilesResponse = {
      status: MessageStatus.SUCCESS,
      provider: Provider.CHATGPT,
      archiveFiles: [
        {
          fileSlug: "convo1",
          data: {},
        },
        {
          fileSlug: "convo2",
          data: {},
        },
      ],
    };

    const content = await generateArchive(res);

    const zip = await JSZip.loadAsync(content);
    expect(zip.files["convo1.json"]).toBeTruthy();
    expect(zip.files["convo2.json"]).toBeTruthy();
  });
});

describe("test generateBulkArchive", () => {
  it("generates bulk archive when all entries are successful", async () => {
    const res: BulkCreateArchiveFilesResponse = {
      status: MessageStatus.SUCCESS,
      entries: [
        {
          status: MessageStatus.SUCCESS,
          provider: Provider.CHATGPT,
          archiveFiles: [
            {
              fileSlug: "convo1",
              data: {},
            },
            {
              fileSlug: "convo2",
              data: {},
            },
          ],
        },
        {
          status: MessageStatus.SUCCESS,
          provider: Provider.GEMINI,
          archiveFiles: [
            {
              fileSlug: "convo1",
              data: {},
            },
          ],
        },
      ],
    };

    const content = await generateBulkArchive(res);

    const zip = await JSZip.loadAsync(content);
    expect(zip.files["CHATGPT/convo1.json"]).toBeTruthy();
    expect(zip.files["CHATGPT/convo2.json"]).toBeTruthy();
    expect(zip.files["GEMINI/convo1.json"]).toBeTruthy();
  });

  it("generates bulk archive when some entries are error", async () => {
    const res: BulkCreateArchiveFilesResponse = {
      status: MessageStatus.SUCCESS,
      entries: [
        {
          status: MessageStatus.SUCCESS,
          provider: Provider.CHATGPT,
          archiveFiles: [
            {
              fileSlug: "convo1",
              data: {},
            },
            {
              fileSlug: "convo2",
              data: {},
            },
          ],
        },
        {
          status: MessageStatus.ERROR,
          provider: Provider.DEEPSEEK,
          errorMessage: "User was not authorized",
        },
      ],
    };

    const content = await generateBulkArchive(res);

    const zip = await JSZip.loadAsync(content);

    expect(zip.files["CHATGPT/convo1.json"]).toBeTruthy();
    expect(zip.files["CHATGPT/convo2.json"]).toBeTruthy();
    expect(zip.files["DEEPSEEK/error.txt"]).toBeTruthy();
  });
});
