import JSZip from "jszip";

interface Session {
  value: string;
  __version: string;
}

interface FetchPageResponse {
  data: {
    biz_data: {
      chat_sessions: {
        id: string;
      }[];
      has_more: boolean;
    };
  };
}

interface GetHistoryMessagesResponse {
  data: {
    biz_data: {
      chat_messages: any[];
    };
  };
}

const BASE_URL = "https://chat.deepseek.com";

function getSession(): Session {
  if (!localStorage.getItem("userToken")) {
    throw new Error("no session found!");
  }
  const session = JSON.parse(localStorage.getItem("userToken")) as Session;
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
  const fetchPageData = (await fetchPageRes.json()) as FetchPageResponse;

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
    const getHistoryMessagesData =
      (await getHistoryMessagesRes.json()) as GetHistoryMessagesResponse;

    zip.file(
      `${chatSessionId}.json`,
      JSON.stringify(getHistoryMessagesData.data.biz_data.chat_messages)
    );
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
