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
  const url = window.location.href;
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

export function getProviderUrl(provider: Provider) {
  switch (provider) {
    case Provider.CHATGPT:
      return "https://chatgpt.com";
    case Provider.COPILOT:
      return "https://copilot.microsoft.com";
    case Provider.GEMINI:
      return "https://gemini.google.com/app";
    case Provider.CLAUDE:
      return "https://claude.ai";
    case Provider.PERPLEXITY:
      return "https://www.perplexity.ai";
    case Provider.GROK:
      return "https://grok.com";
    case Provider.DEEPSEEK:
      return "https://chat.deepseek.com";
    default:
      throw new Error(`Provider ${provider} not supported`);
  }
}
