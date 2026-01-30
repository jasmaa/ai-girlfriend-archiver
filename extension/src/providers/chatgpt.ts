import JSZip from "jszip";
import * as z from "zod";

const Session = z.object({
  accessToken: z.string(),
});

const ListConversationsResponse = z.object({
  items: z.array(
    z.object({
      id: z.string(),
    })
  ),
});

const BASE_URL = "https://chatgpt.com";

async function getSession() {
  const getSessionRes = await fetch(`${BASE_URL}/api/auth/session`);
  const getSessionData = Session.parse(await getSessionRes.json());
  return getSessionData;
}

export async function generateArchive() {
  const session = await getSession();
  const accessToken = session.accessToken;

  const conversationSummaries = [];
  let currentOffset = 0;
  while (true) {
    const listConversationsRes = await fetch(
      `${BASE_URL}/backend-api/conversations?offset=${currentOffset}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const listConversationsData = ListConversationsResponse.parse(
      await listConversationsRes.json()
    );

    if (listConversationsData.items.length === 0) {
      break;
    }

    for (const conversationSummary of listConversationsData.items) {
      conversationSummaries.push(conversationSummary);
    }

    currentOffset += listConversationsData.items.length;
  }

  const zip = new JSZip();
  for (const conversationSummary of conversationSummaries) {
    const conversationId = conversationSummary.id;
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
