export enum Provider {
  CHATGPT = "CHATGPT",
  COPILOT = "COPILOT",
  GEMINI = "GEMINI",
  CLAUDE = "CLAUDE",
  PERPLEXITY = "PERPLEXITY",
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
  } else {
    return null;
  }
}
