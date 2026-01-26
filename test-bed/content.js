const CHATGPT_BASE_URL = "https://chatgpt.com";
const COPILOT_BASE_URL = "https://copilot.microsoft.com";
const GEMINI_BASE_URL = "https://gemini.google.com";
const GEMINI_LIST_CHATS_RPC_ID = "MaZiqc";
const GEMINI_READ_CHAT_RPC_ID = "hNvQHb";
const CLAUDE_BASE_URL = "https://claude.ai";

async function getChatGPTSession() {
  const getSessionRes = await fetch(`${CHATGPT_BASE_URL}/api/auth/session`)
  const getSessionData = await getSessionRes.json();
  return getSessionData;
}

async function generateChatGPTArchive() {
  const session = await getChatGPTSession();
  const accessToken = session.accessToken;

  const listConversationsRes = await fetch(`${CHATGPT_BASE_URL}/backend-api/conversations`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    }
  });
  const listConversationsData = await listConversationsRes.json();

  console.log(listConversationsData);

  const zip = new JSZip();
  for (const conversation of listConversationsData.items) {
    const conversationId = conversation.id;
    const getConversationRes = await fetch(`${CHATGPT_BASE_URL}/backend-api/conversation/${conversationId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      }
    });
    const getConversationData = await getConversationRes.json();
    console.log(getConversationData);
    zip.file(`${conversationId}.json`, JSON.stringify(getConversationData));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}

async function getCopilotSession() {
  if (!localStorage.getItem("hasBeenAuthenticated")) {
    throw new Error("no session found!")
  }

  const session = {}

  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.match(/@@auth0spajs@@::(?<clientId>.+)::https:\/\/copilot\.microsoft\.com::(?<scopes>.+)/)) {
      const item = JSON.parse(localStorage.getItem(key));
      session.accessCredentials = item;
    } else if (key.match(/@@auth0spajs@@::(?<clientId>.+)::@@user@@/)) {
      const item = JSON.parse(localStorage.getItem(key));
      session.idCredentials = item;
    }
  }
  return session;
}

async function generateCopilotArchive() {

  const session = await getCopilotSession();
  const accessToken = session.accessCredentials.body.access_token;

  let identityType;
  const sub = session.idCredentials.decodedToken.user.sub;
  if (sub.includes("google")) {
    identityType = "google";
  } else {
    throw new Error("unknown identity type");
  }

  const listConversationsRes = await fetch(`${COPILOT_BASE_URL}/c/api/conversations?types=chat,character,xbox,group`, {
    headers: {
      "authorization": `Bearer ${accessToken}`,
      "x-useridentitytype": identityType,
    }
  });
  const listConversationsData = await listConversationsRes.json();

  console.log(listConversationsData);

  const zip = new JSZip();
  for (const conversation of listConversationsData.results) {
    const conversationId = conversation.id;
    const getConversationHistoryRes = await fetch(`${COPILOT_BASE_URL}/c/api/conversations/${conversationId}/history`, {
      headers: {
        "authorization": `Bearer ${accessToken}`,
        "x-useridentitytype": identityType,
      }
    });
    const getConversationHistoryData = await getConversationHistoryRes.json();
    console.log(getConversationHistoryData);
    zip.file(`${conversationId}.json`, JSON.stringify(getConversationHistoryData));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}

function getGoogleUserIndex() {
  const userIndexRe = /u\/(\d+)/;
  const parts = userIndexRe.exec(window.location.href);
  if (!parts && parts.length < 1) {
    // Default 0th user
    return 0;
  } else {
    return parseInt(parts[1]);
  }
}

async function getGeminiSession() {
  const scriptEls = document.querySelectorAll('[data-id="_gd"]');

  if (scriptEls.length < 1) {
    throw new Error("unable to find access token");
  }

  const scriptText = scriptEls[0].textContent;
  const accessTokenRe = /"SNlM0e":"(.*?)"/;
  const parts = accessTokenRe.exec(scriptText);

  if (!parts || parts.length < 1) {
    throw new Error("unable to find access token");
  }

  const accessToken = parts[1];

  return accessToken;
}

async function generateGeminiArchive() {
  const accessToken = await getGeminiSession();

  const userIndex = getGoogleUserIndex();

  // List all chats
  // [resultsPerPage, null, [???, null, ???]]
  const listChatsReqPayload = [100, null, [0, null, 1]];
  const listChatsReqFormData = new FormData();
  listChatsReqFormData.append("f.req", JSON.stringify([
    [[GEMINI_LIST_CHATS_RPC_ID, JSON.stringify(listChatsReqPayload), null, "generic"]],
  ]));
  listChatsReqFormData.append("at", accessToken);
  const listChatsRes = await fetch(`${GEMINI_BASE_URL}/u/${userIndex}/_/BardChatUi/data/batchexecute`, {
    method: "POST",
    body: new URLSearchParams(listChatsReqFormData),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    }
  });

  const listChatsData = await listChatsRes.text();
  const parsedListChatsData = JSON.parse(listChatsData.replace(")]}'", ""));
  const chats = JSON.parse(parsedListChatsData[0][2])[2];

  console.log(chats);

  const zip = new JSZip();
  for (const chat of chats) {
    const chatId = chat[0];

    // Read chat content
    // [chatId, ...???]
    const readChatReqPayload = [chatId, 10, null, 1, [0], [4], null, 1];
    const readChatReqFormData = new FormData();
    readChatReqFormData.append("f.req", JSON.stringify([
      [[GEMINI_READ_CHAT_RPC_ID, JSON.stringify(readChatReqPayload), null, "generic"]],
    ]));
    readChatReqFormData.append("at", accessToken);
    const readChatRes = await fetch(`${GEMINI_BASE_URL}/u/${userIndex}/_/BardChatUi/data/batchexecute`, {
      method: "POST",
      body: new URLSearchParams(readChatReqFormData),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      }
    });

    const readChatData = await readChatRes.text();
    const parsedReadChatData = JSON.parse(readChatData.replace(")]}'", ""));
    const chatContent = JSON.parse(parsedReadChatData[0][2])[0];

    console.log(readChatData);

    zip.file(`${chatId}.json`, JSON.stringify(chatContent));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}

async function generateClaudeArchive() {
  const listOrganizationsRes = await fetch(`${CLAUDE_BASE_URL}/api/organizations`);
  const listOrganizationsData = await listOrganizationsRes.json();
  console.log(listOrganizationsData);

  for (const organizationSummary of listOrganizationsData) {
    const organizationUUID = organizationSummary.uuid;
    const listConversationsRes = await fetch(`${CLAUDE_BASE_URL}/api/organizations/${organizationUUID}/chat_conversations?limit=30&offset=0&starred=false&consistency=strong`);
    const listConversationsData = await listConversationsRes.json();
    console.log(listConversationsData);

    for (const conversationSummary of listConversationsData) {
      const conversationUUID = conversationSummary.uuid;
      const getConversationRes = await fetch(`${CLAUDE_BASE_URL}/api/organizations/${organizationUUID}/chat_conversations/${conversationUUID}?tree=True&rendering_mode=messages&render_all_tools=true&consistency=strong`)
      const getConversationData = await getConversationRes.json();
      console.log(getConversationData);
    }
  }
}

(async () => {
  console.log("Hello from archiver!");

  const url = window.location.href;
  if (url.includes("chatgpt.com")) {
    console.log("Found chatgpt website.");
    console.log("Archiving conversations...");
    const content = await generateChatGPTArchive();
  } else if (url.includes("copilot.microsoft.com")) {
    console.log("Found copilot website");
    console.log("Archiving conversations...");
    const content = await generateCopilotArchive();
  } else if (url.includes("gemini.google.com")) {
    console.log("Found gemini website");
    console.log("Archiving conversations...");
    const content = await generateGeminiArchive();
  } else if (url.includes("claude.ai")) {
    console.log("Found claude website");
    console.log("Archiving conversations...");
    const content = await generateClaudeArchive();
  }
})();