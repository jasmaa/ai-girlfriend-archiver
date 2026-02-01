import fetchMock from "jest-fetch-mock";
import * as grok from "./grok";

fetchMock.enableMocks();

describe("test Grok generateArchiveFiles", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should create archive files", async () => {
    fetchMock.mockResponses(
      [
        JSON.stringify({
          conversations: [
            {
              conversationId: "convo1",
            },
          ],
          nextPageToken: "token1",
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          conversations: [
            {
              conversationId: "convo2",
            },
          ],
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          responseNodes: [
            {
              responseId: "convo1-response1",
            },
            {
              responseId: "convo1-response2",
            },
          ],
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          responses: [
            {
              responseId: "convo1-response1",
              message: "hello",
              sender: "human",
            },
            {
              responseId: "convo1-response2",
              message:
                "Yo wassup bruh. How's it hanging? Still not much right? Hahahaha!",
              sender: "assistant",
            },
          ],
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          responseNodes: [
            {
              responseId: "convo2-response1",
            },
            {
              responseId: "convo2-response2",
            },
          ],
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          responses: [
            {
              responseId: "convo2-response1",
              message: "How was your day?",
              sender: "human",
            },
            {
              responseId: "convo2-response2",
              message:
                "It was sick bruh. Hiked up the the Blue Ridge twin peaks. White and soft as snow up there, and oh man let me tell you that view was simply AMAZING. I'll take you next time, hahaha.",
              sender: "assistant",
            },
          ],
        }),
        { status: 200 },
      ]
    );

    const archiveFiles = await grok.generateArchiveFiles();

    expect(archiveFiles.length).toBe(2);
    expect(archiveFiles[0].fileSlug).toBe("convo1");
    expect(archiveFiles[1].fileSlug).toBe("convo2");
  });
});
