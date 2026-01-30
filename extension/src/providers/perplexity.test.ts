import fetchMock from "jest-fetch-mock";
import * as perplexity from "./perplexity";

fetchMock.enableMocks();

describe("test Perplexity generateArchiveFiles", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should create archive files", async () => {
    fetchMock.mockResponses(
      [
        JSON.stringify([
          {
            slug: "convo1",
          },
          {
            slug: "convo2",
          },
        ]),
        { status: 200 },
      ],
      [
        JSON.stringify({
          entries: [{ query_str: "hello" }],
          has_next_page: false,
          next_cursor: null,
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          entries: [
            { query_str: "I love how you're so perplexing Perplexity." },
          ],
          has_next_page: false,
          next_cursor: null,
        }),
        { status: 200 },
      ]
    );

    const archiveFiles = await perplexity.generateArchiveFiles();

    expect(archiveFiles.length).toBe(2);
    expect(archiveFiles[0].fileSlug).toBe("convo1");
    expect(archiveFiles[1].fileSlug).toBe("convo2");
  });
});
