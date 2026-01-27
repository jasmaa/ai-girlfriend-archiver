import JSZip from "jszip";
import * as z from "zod";

const Session = z.object({
  value: z.string(),
});

const FetchPageResponse = z.object({
  data: z.object({
    biz_data: z.object({
      chat_sessions: z.array(
        z.object({
          id: z.string(),
        })
      ),
      has_more: z.boolean(),
    }),
  }),
});

const BASE_URL = "https://chat.deepseek.com";

function getSession() {
  if (!localStorage.getItem("userToken")) {
    throw new Error("no session found!");
  }
  const session = Session.parse(JSON.parse(localStorage.getItem("userToken")));
  return session;
}

export async function generateArchive() {
  const zip = new JSZip();

  const session = getSession();
  const accessToken = session.value;

  // TODO: handle pagination
  const fetchPageRes = await fetch(
    `${BASE_URL}/api/v0/chat_session/fetch_page`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const fetchPageData = FetchPageResponse.parse(await fetchPageRes.json());

  const chatSessions = fetchPageData.data.biz_data.chat_sessions;
  for (const chatSessionSummary of chatSessions) {
    const chatSessionId = chatSessionSummary.id;

    const getHistoryMessagesRes = await fetch(
      `${BASE_URL}/api/v0/chat/history_messages?chat_session_id=${chatSessionId}`,
      {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const getHistoryMessagesData = await getHistoryMessagesRes.json();

    zip.file(`${chatSessionId}.json`, JSON.stringify(getHistoryMessagesData));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
