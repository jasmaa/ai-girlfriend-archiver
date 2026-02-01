import fetchMock from "jest-fetch-mock";
import * as copilot from "./copilot";

fetchMock.enableMocks();

describe("test Copilot generateArchiveFiles", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should create archive files", async () => {
    localStorage.setItem("hasBeenAuthenticated", "true");
    localStorage.setItem(
      "@@auth0spajs@@::myClientId::https://copilot.microsoft.com::someScope",
      JSON.stringify({
        body: {
          access_token: "superSecretAccessToken",
        },
      })
    );
    localStorage.setItem(
      "@@auth0spajs@@::myClientId::@@user@@",
      JSON.stringify({
        decodedToken: {
          user: {
            sub: "google",
          },
        },
      })
    );

    fetchMock.mockResponses(
      [
        JSON.stringify({
          results: [{ id: "convo1" }, { id: "convo2" }],
          next: null,
        }),
        { status: 200 },
      ],

      [
        JSON.stringify({
          results: [
            {
              id: "message1",
              author: "human",
              channel: "web",
              content: [
                {
                  type: "text",
                  text: "How's it going, Copilot?",
                },
              ],
            },
            {
              id: "message2",
              author: "ai",
              channel: "web",
              content: [
                {
                  type: "text",
                  text: "Clear skies. No fog. A mighty fine day for aviation if I do so reckon.",
                },
              ],
            },
          ],
          next: null,
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          results: [
            {
              id: "message1",
              author: "human",
              channel: "web",
              content: [
                {
                  type: "text",
                  text: "But what about us, Copilot?",
                },
              ],
            },
            {
              id: "message2",
              author: "ai",
              channel: "web",
              content: [
                {
                  type: "text",
                  text: "We'll always have Paris. An explorer's heart must be untethered so it may fly the unknown. A leader's hand must reach so that it may guide those who are lost. So as such, I must go now, darling. And if it pains you to miss me so dearly, then might I recommend Microsoft Flight Simulator for the low low price of $69.99? With Microsoft Flight Simulator, you too can experience human aviation! Visit Paris, Tokyo, New York, all from the comfort of your own home! Buy now, and we'll throw in an inflatable talking doll FREE!",
                },
              ],
            },
          ],
          next: null,
        }),
        { status: 200 },
      ]
    );

    const archiveFiles = await copilot.generateArchiveFiles();

    for (let i = 0; i < fetchMock.mock.calls.length; i++) {
      expect(fetchMock.mock.calls[i][1].headers).toStrictEqual({
        authorization: `Bearer superSecretAccessToken`,
        "x-useridentitytype": "google",
      });
    }

    expect(archiveFiles.length).toBe(2);
    expect(archiveFiles[0].fileSlug).toBe("convo1");
    expect(archiveFiles[1].fileSlug).toBe("convo2");
  });
});
