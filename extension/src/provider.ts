import { getWindowLocationHref } from "./dom-helpers";

export enum Provider {
  CHATGPT = "CHATGPT",
  COPILOT = "COPILOT",
  GEMINI = "GEMINI",
  CLAUDE = "CLAUDE",
  PERPLEXITY = "PERPLEXITY",
  GROK = "GROK",
  DEEPSEEK = "DEEPSEEK",
}

export function getAllProviders() {
  return Object.keys(Provider).map((provider) => provider);
}

export function determineCurrentProvider() {
  const url = getWindowLocationHref();
  if (url.includes("chatgpt.com")) {
    return Provider.CHATGPT;
  } else if (url.includes("copilot.microsoft.com")) {
    return Provider.COPILOT;
  } else if (url.includes("gemini.google.com")) {
    return Provider.GEMINI;
  } else if (url.includes("claude.ai")) {
    return Provider.CLAUDE;
  } else if (url.includes("perplexity.ai")) {
    return Provider.PERPLEXITY;
  } else if (url.includes("grok.com")) {
    return Provider.GROK;
  } else if (url.includes("chat.deepseek.com")) {
    return Provider.DEEPSEEK;
  } else {
    throw new Error("Unable to determine provider from url");
  }
}

export function getProviderURL(provider: Provider) {
  const mapping = new Map([
    [Provider.CHATGPT, "https://chatgpt.com"],
    [Provider.COPILOT, "https://copilot.microsoft.com"],
    [Provider.GEMINI, "https://gemini.google.com/app"],
    [Provider.CLAUDE, "https://claude.ai"],
    [Provider.PERPLEXITY, "https://www.perplexity.ai"],
    [Provider.GROK, "https://grok.com"],
    [Provider.DEEPSEEK, "https://chat.deepseek.com"],
  ]);

  if (mapping.has(provider)) {
    return mapping.get(provider);
  } else {
    throw new Error(`Provider ${provider} not supported`);
  }
}
