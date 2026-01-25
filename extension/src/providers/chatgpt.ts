import JSZip from "jszip";

const BASE_URL = "https://chatgpt.com";

async function getSession() {
  // TODO: do caching for session. Need to be able to recover if session is expired, changed
  const getSessionRes = await fetch(`${BASE_URL}/api/auth/session`);
  const getSessionData = await getSessionRes.json();
  return getSessionData;
}

export async function generateArchive() {
  const session = await getSession();
  const accessToken = session.accessToken;

  const listConversationsRes = await fetch(
    `${BASE_URL}/backend-api/conversations`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const listConversationsData = await listConversationsRes.json();

  const zip = new JSZip();
  for (const conversation of listConversationsData.items) {
    const conversationId = conversation.id;
    const getConversationRes = await fetch(
      `${BASE_URL}/backend-api/conversation/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const getConversationData = await getConversationRes.json();
    zip.file(`${conversationId}.json`, JSON.stringify(getConversationData));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
