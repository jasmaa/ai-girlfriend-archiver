const CHATGPT_BASE_URL = "https://chatgpt.com";
const COPILOT_BASE_URL = "https://copilot.microsoft.com";
const GEMINI_BASE_URL = "https://gemini.google.com";
const GEMINI_LIST_CHATS_RPC_ID = "MaZiqc";
const GEMINI_READ_CHAT_RPC_ID = "hNvQHb";

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

  // TODO: figure this out for rest of id types
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
  if (!parts && parts < 1) {
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

  // TODO: abstract RPC logic and serialization into separate class
  // TODO: figure out what rest of RPC args are. Reference: https://github.com/HanaokaYuzu/Gemini-API/

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

(async () => {
  console.log("Hello from archiver!");

  const url = window.location.href;
  if (url.includes("chatgpt.com")) {
    console.log("Found chatgpt website.");
    console.log("Archiving conversations...");
    const content = await generateChatGPTArchive();
    saveAs(content, "example.zip");
  } else if (url.includes("copilot.microsoft.com")) {
    console.log("Found copilot website");
    console.log("Archiving conversations...");
    const content = await generateCopilotArchive();
    saveAs(content, "example.zip");
  } else if (url.includes("gemini.google.com")) {
    console.log("Found gemini website");
    console.log("Archiving conversations...");
    const content = await generateGeminiArchive();
    saveAs(content, "example.zip");
  }
})();