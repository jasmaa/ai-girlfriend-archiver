import * as z from "zod";
import { ArchiveFile } from "../archive";

const BASE_URL = "https://copilot.microsoft.com";

const AccessCredentials = z.object({
  body: z.object({
    access_token: z.string(),
  }),
});

const IdCredentials = z.object({
  decodedToken: z.object({
    user: z.object({
      sub: z.string(),
    }),
  }),
});

interface Session {
  accessCredentials: z.infer<typeof AccessCredentials>;
  idCredentials: z.infer<typeof IdCredentials>;
}

const ListConversationsResponse = z.object({
  results: z.array(
    z.object({
      id: z.string(),
    })
  ),
  next: z.union([z.string(), z.null()]),
});

const ListConversationHistoryResponse = z.object({
  results: z.array(z.any()),
  next: z.union([z.string(), z.null()]),
});

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
      const item = AccessCredentials.parse(
        JSON.parse(localStorage.getItem(key))
      );
      accessCredentials = item;
    } else if (key.match(/@@auth0spajs@@::(.+)::@@user@@/)) {
      const item = IdCredentials.parse(JSON.parse(localStorage.getItem(key)));
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

export async function generateArchiveFiles(): Promise<ArchiveFile[]> {
  const archiveFiles = [];

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
  const listConversationsData = ListConversationsResponse.parse(
    await listConversationsRes.json()
  );

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
    const rawListConversationHistoryData =
      await getConversationHistoryRes.json();

    // TODO: handle pagination
    const listConversationHistoryData = ListConversationHistoryResponse.parse(
      rawListConversationHistoryData
    );

    archiveFiles.push({
      fileSlug: conversationId,
      data: rawListConversationHistoryData,
    });
  }

  return archiveFiles;
}
