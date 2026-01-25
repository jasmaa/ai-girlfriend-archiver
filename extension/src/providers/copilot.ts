import JSZip from "jszip";

const BASE_URL = "https://copilot.microsoft.com";

interface Session {
  accessCredentials: any;
  idCredentials: any;
}

interface ListConversationsResponse {
  results: {
    id: string;
  }[];
  next: string | null;
}

interface ListConversationHistoryResponse {
  results: any[];
  next: string | null;
}

enum IdentityType {
  GOOGLE = "google",
}

async function getCopilotSession() {
  if (!localStorage.getItem("hasBeenAuthenticated")) {
    throw new Error("no session found!");
  }

  let idCredentials;
  let accessCredentials;
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (
      key.match(/@@auth0spajs@@::(.+)::https:\/\/copilot\.microsoft\.com::(.+)/)
    ) {
      const item = JSON.parse(localStorage.getItem(key));
      accessCredentials = item;
    } else if (key.match(/@@auth0spajs@@::(.+)::@@user@@/)) {
      const item = JSON.parse(localStorage.getItem(key));
      idCredentials = item;
    }
  }

  const session: Session = {
    idCredentials,
    accessCredentials,
  };

  return session;
}

// TODO: figure this out for rest of id types
function determineIdentityType(session: Session) {
  const sub = session.idCredentials.decodedToken.user.sub;
  if (sub.includes("google")) {
    return IdentityType.GOOGLE;
  } else {
    throw new Error("unknown identity type");
  }
}

export async function generateArchive() {
  const session = await getCopilotSession();
  const accessToken = session.accessCredentials.body.access_token;
  const identityType = determineIdentityType(session);

  // TODO: handle pagination
  const listConversationsRes = await fetch(
    `${BASE_URL}/c/api/conversations?types=chat,character,xbox,group`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-useridentitytype": identityType,
      },
    }
  );
  const listConversationsData: ListConversationsResponse =
    await listConversationsRes.json();

  const zip = new JSZip();
  for (const conversation of listConversationsData.results) {
    // TODO: handle pagination
    const conversationId = conversation.id;
    const getConversationHistoryRes = await fetch(
      `${BASE_URL}/c/api/conversations/${conversationId}/history`,
      {
        headers: {
          authorization: `Bearer ${accessToken}`,
          "x-useridentitytype": identityType,
        },
      }
    );
    const listConversationHistoryData: ListConversationHistoryResponse =
      await getConversationHistoryRes.json();
    zip.file(
      `${conversationId}.json`,
      JSON.stringify(listConversationHistoryData.results)
    );
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
