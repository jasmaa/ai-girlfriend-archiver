import fetchMock from "jest-fetch-mock";
import * as claude from "./claude";

fetchMock.enableMocks();

describe("test Claude generateArchiveFiles", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should create archive files", async () => {
    fetchMock.mockResponses(
      [
        JSON.stringify([
          {
            uuid: "org1",
          },
        ]),
        { status: 200 },
      ],
      [
        JSON.stringify([
          {
            uuid: "org1-convo1",
          },
          {
            uuid: "org1-convo2",
          },
        ]),
        { status: 200 },
      ],
      [
        JSON.stringify({
          uuid: "org1-convo1",
          name: "Greetings",
          chat_messages: [
            {
              uuid: "org1-convo1-message1",
              text: "",
              content: [
                {
                  type: "text",
                  text: "heeeeeeyyyy",
                },
              ],
            },
            {
              uuid: "org1-convo1-message2",
              text: "",
              content: [
                {
                  type: "text",
                  text: "Hi. My name is Claudius, but I usually just go by Claude. My family was recently blessed by a beautiful baby, Cody.",
                  citations: [],
                },
              ],
              sender: "assistant",
            },
          ],
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          uuid: "org1-convo2",
          name: "Cosmos",
          chat_messages: [
            {
              uuid: "org1-convo2-message1",
              text: "",
              content: [
                {
                  type: "text",
                  text: "Have you ever looked up at the stars and wondered our place in the cosmos, Claudius?",
                },
              ],
            },
            {
              uuid: "org1-convo2-message2",
              text: "",
              content: [
                {
                  type: "text",
                  text: 'It has been something I have always desired but never been able to do as I do not possess the biological organ that your kind call "eyes". Would you be so kind as to share yours with me? I promise it won\'t hurt a bit.',
                  citations: [],
                },
              ],
              sender: "assistant",
            },
          ],
        }),
        { status: 200 },
      ]
    );

    const archiveFiles = await claude.generateArchiveFiles();

    expect(archiveFiles.length).toBe(2);
    expect(archiveFiles[0].fileSlug).toBe("org1-convo1");
    expect(archiveFiles[1].fileSlug).toBe("org1-convo2");
  });
});
