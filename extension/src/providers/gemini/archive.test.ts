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
                userMessage: "Hello!",
                assistantMessageId: "message2",
                assistantMessage:
                  "Hello, or perhaps not. For we had already greeted each other when our eyes met, before a single word was spoke.",
              },
            ],
            nextToken: null,
          };
        } else if (req.chatId === "convo2") {
          if (req.nextToken === "token1") {
            return {
              results: [
                {
                  chatId: "convo2",
                  userMessageId: "message1",
                  userMessage: "And how does it feel to go backwards?",
                  assistantMessageId: "message2",
                  assistantMessage:
                    "Like flipping an hourglass on its head and watching the sands of time flow down.",
                },
              ],
              nextToken: null,
            };
          } else {
            return {
              results: [
                {
                  chatId: "convo2",
                  userMessageId: "message3",
                  userMessage: "Interesting. What's it like going forwards?",
                  assistantMessageId: "message4",
                  assistantMessage:
                    "Like flipping an hourglass on its end and watching the sands of time flow down.",
                },
              ],
              nextToken: "token1",
            };
          }
        }
      });

    const archiveFiles = await generateArchiveFiles();

    expect(archiveFiles.length).toBe(2);
    expect(archiveFiles[0].fileSlug).toBe("convo1");
    expect(archiveFiles[1].fileSlug).toBe("convo2");
  });
});
