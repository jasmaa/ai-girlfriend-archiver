import fetchMock from "jest-fetch-mock";
import * as deepseek from "./deepseek";

fetchMock.enableMocks();

describe("test DeepSeek generateArchiveFiles", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should create archive files", async () => {
    localStorage.setItem(
      "userToken",
      JSON.stringify({
        value: "superSecretAccessToken",
      })
    );

    fetchMock.mockResponses(
      [
        JSON.stringify({
          data: {
            biz_data: {
              chat_sessions: [
                {
                  id: "convo1",
                },
                {
                  id: "convo2",
                },
              ],
              has_more: false,
            },
          },
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          data: {
            biz_data: {
              chat_messages: [
                {
                  message_id: 1,
                  role: "USER",
                  content: "hi",
                },
                {
                  message_id: 2,
                  role: "ASSISTANT",
                  content: "你好谢谢小笼包再见!",
                },
              ],
            },
          },
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          data: {
            biz_data: {
              chat_messages: [
                {
                  message_id: 1,
                  role: "USER",
                  content: "Hey Deepseek, say something romantic to me.",
                },
                {
                  message_id: 2,
                  role: "ASSISTANT",
                  content: "天下大勢，分久必合，合久必分",
                },
              ],
            },
          },
        }),
        { status: 200 },
      ]
    );

    const archiveFiles = await deepseek.generateArchiveFiles();

    for (let i = 0; i < fetchMock.mock.calls.length; i++) {
      expect(fetchMock.mock.calls[i][1].headers).toStrictEqual({
        authorization: `Bearer superSecretAccessToken`,
      });
    }

    expect(archiveFiles.length).toBe(2);
    expect(archiveFiles[0].fileSlug).toBe("convo1");
    expect(archiveFiles[1].fileSlug).toBe("convo2");
  });
});
