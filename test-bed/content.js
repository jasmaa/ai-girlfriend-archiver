const CHATGPT_BASE_URL = "https://chatgpt.com";
const COPILOT_BASE_URL = "https://copilot.microsoft.com";

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
  }
})();