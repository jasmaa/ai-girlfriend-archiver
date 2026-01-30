import { generateArchiveFiles } from "./archive";
import { GeminiClient } from "./gemini-client";
import * as auth from "./auth";

describe("test Gemini generateArchiveFiles", () => {
  it("should create archive files", async () => {
    jest.spyOn(auth, "getSession").mockImplementation(async () => {
      return {
        accessToken: "superSecretAccessToken",
        userIndex: 0,
      };
    });

    jest
      .spyOn(GeminiClient.prototype, "listChats")
      .mockImplementation(async () => {
        return {
          results: [
            {
              chatId: "convo1",
            },
            {
              chatId: "convo2",
            },
          ],
        };
      });

    jest
      .spyOn(GeminiClient.prototype, "readChat")
      .mockImplementation(async (req) => {
        if (req.chatId === "convo1") {
          return {
            results: [
              {
                chatId: "convo1",
                userMessageId: "message1",
                userMessage: "",
                assistantMessageId: "message2",
                assistantMessage: "",
              },
            ],
            nextToken: "",
          };
        } else if (req.chatId === "convo2") {
          return {
            results: [
              {
                chatId: "convo2",
                userMessageId: "message1",
                userMessage: "",
                assistantMessageId: "message2",
                assistantMessage: "",
              },
            ],
            nextToken: "",
          };
        }
      });

    const archiveFiles = await generateArchiveFiles();

    expect(archiveFiles.length).toBe(2);
    expect(archiveFiles[0].fileSlug).toBe("convo1");
    expect(archiveFiles[1].fileSlug).toBe("convo2");
  });
});
