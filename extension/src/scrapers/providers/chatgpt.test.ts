import fetchMock from "jest-fetch-mock";
import * as chatgpt from "./chatgpt";

fetchMock.enableMocks();

describe("test ChatGPT generateArchiveFiles", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should create archive files", async () => {
    fetchMock.mockResponses(
      [
        JSON.stringify({
          user: {
            id: "",
            name: "John Doe",
            email: "johndoe@example.com",
            image: "https://cdn.example.com/johndoe.png",
            picture: "https://cdn.example.com/johndoe.png",
            idp: "Okta",
            iat: 1769258349,
            mfa: false,
          },
          expires: "2026-04-24T13:16:03.566Z",
          account: {
            id: "",
            planType: "free",
            structure: "personal",
            workspaceType: null,
            organizationId: null,
            isFedrampCompliantWorkspace: false,
            isDelinquent: false,
            gracePeriodId: null,
            residencyRegion: "no_constraint",
            computeResidency: "no_constraint",
          },
          accessToken: "superSecretAccessToken",
          authProvider: "openai",
          rumViewTags: {
            light_account: {
              fetched: false,
            },
          },
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          items: [
            {
              id: "convo1",
            },
            {
              id: "convo2",
            },
          ],
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          items: [],
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          title: "My Amazing Time at the Hot Springs",
          mapping: {
            message1: {
              id: "message1",
              message: {
                id: "message1",
                author: {
                  role: "user",
                  name: null,
                  metadata: {},
                },

                content: {
                  content_type: "text",
                  parts: ["I had an amazing time at the hot springs!"],
                },
              },
              children: ["message2"],
            },
            message2: {
              id: "message2",
              message: {
                id: "message2",
                author: {
                  role: "assistant",
                  name: null,
                  metadata: {},
                },
                content: {
                  content_type: "text",
                  parts: [
                    "That's so cool! I wish I could've jumped in there too!",
                  ],
                },
              },
            },
          },
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          title: "How to Eat Crow",
          mapping: {
            message1: {
              id: "message1",
              message: {
                id: "message1",
                author: {
                  role: "user",
                  name: null,
                  metadata: {},
                },

                content: {
                  content_type: "text",
                  parts: ["teach me how to eat crow"],
                },
              },
              children: ["message2"],
            },
            message2: {
              id: "message2",
              message: {
                id: "message2",
                author: {
                  role: "assistant",
                  name: null,
                  metadata: {},
                },
                content: {
                  content_type: "text",
                  parts: [
                    "Here is how to eat crow step by step:\n\nStep 1: Befriend a crow.\n\nStep 2: Betray your friend.\n\nStep 3: Betray yourself.\n\nStep 4: Betray humanity.\n\nStep 5: Eat.",
                  ],
                },
              },
            },
          },
        }),
        { status: 200 },
      ]
    );

    const archiveFiles = await chatgpt.generateArchiveFiles();

    for (let i = 1; i < fetchMock.mock.calls.length; i++) {
      expect(fetchMock.mock.calls[i][1].headers).toStrictEqual({
        Authorization: "Bearer superSecretAccessToken",
      });
    }

    expect(archiveFiles.length).toBe(2);
    expect(archiveFiles[0].fileSlug).toBe("convo1");
    expect(archiveFiles[1].fileSlug).toBe("convo2");
  });
});
