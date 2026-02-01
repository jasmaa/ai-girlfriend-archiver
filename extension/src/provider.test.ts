import * as domHelpers from "./dom-helpers";
import { determineCurrentProvider, getProviderURL, Provider } from "./provider";

describe("test determineCurrentProvider", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it.each([
    ["https://chatgpt.com", Provider.CHATGPT],
    ["https://chatgpt.com/c/convo1", Provider.CHATGPT],
    ["https://copilot.microsoft.com", Provider.COPILOT],
    ["https://copilot.microsoft.com/chats/convo1", Provider.COPILOT],
    ["https://gemini.google.com/app", Provider.GEMINI],
    ["https://gemini.google.com/app/convo1", Provider.GEMINI],
    ["https://gemini.google.com/u/1/app", Provider.GEMINI],
    ["https://gemini.google.com//u/1/app/convo1", Provider.GEMINI],
    ["https://claude.ai", Provider.CLAUDE],
    ["https://claude.ai/recents", Provider.CLAUDE],
    ["https://claude.ai/chat/convo1", Provider.CLAUDE],
    ["https://www.perplexity.ai", Provider.PERPLEXITY],
    ["https://www.perplexity.ai/search/convo1", Provider.PERPLEXITY],
    ["https://grok.com", Provider.GROK],
    ["https://grok.com/c/convo1", Provider.GROK],
    ["https://chat.deepseek.com", Provider.DEEPSEEK],
    ["https://chat.deepseek.com/a/chat/s/convo1", Provider.DEEPSEEK],
  ])("maps url=%s to provider=%s", (url, expectedProvider) => {
    jest.spyOn(domHelpers, "getWindowLocationHref").mockImplementation(() => {
      return url;
    });

    const provider = determineCurrentProvider();
    expect(provider).toBe(expectedProvider);
  });

  it("errors for unknown url", () => {
    jest.spyOn(domHelpers, "getWindowLocationHref").mockImplementation(() => {
      return "https://example.com";
    });

    expect(() => {
      determineCurrentProvider();
    }).toThrow();
  });
});

describe("test getProviderURL", () => {
  it.each([
    [Provider.CHATGPT, "https://chatgpt.com"],
    [Provider.COPILOT, "https://copilot.microsoft.com"],
    [Provider.GEMINI, "https://gemini.google.com/app"],
    [Provider.CLAUDE, "https://claude.ai"],
    [Provider.PERPLEXITY, "https://www.perplexity.ai"],
    [Provider.GROK, "https://grok.com"],
    [Provider.DEEPSEEK, "https://chat.deepseek.com"],
  ])("maps provider=%s url=%s", (provider: Provider, expectedURL: string) => {
    const url = getProviderURL(provider);
    expect(url).toBe(expectedURL);
  });

  it("errors for unknown provider", () => {
    expect(() => {
      getProviderURL(undefined);
    }).toThrow();
  });
});
