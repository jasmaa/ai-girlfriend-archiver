const baseURL = "https://chatgpt.com";

let memoizedSession;

async function getSession() {
  const now = new Date();
  if (!memoizedSession || now > Date.parse(memoizedSession.expires)) {
    const getSessionRes = await fetch(`${baseURL}/api/auth/session`)
    const getSessionData = await getSessionRes.json();
    memoizedSession = getSessionData;
  }
  return memoizedSession;
}

(async () => {
  console.log("Hello from archiver!");

  const session = await getSession();
  const accessToken = session.accessToken;

  const listConversationsRes = await fetch(`${baseURL}/backend-api/conversations`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    }
  });
  const listConversationsData = await listConversationsRes.json();

  console.log(listConversationsData);

  const zip = new JSZip();
  for (const conversation of listConversationsData.items) {
    const conversationId = conversation.id;
    const getConversationRes = await fetch(`${baseURL}/backend-api/conversation/${conversationId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      }
    });
    const getConversationData = await getConversationRes.json();
    console.log(getConversationData);
    zip.file(`chatgpt-${conversationId}.json`, JSON.stringify(getConversationData));
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "example.zip");
})();