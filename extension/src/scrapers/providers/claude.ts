import * as z from "zod";
import { ArchiveFile } from "..";

const ListOrganizationsResponse = z.array(
  z.object({
    uuid: z.string(),
  })
);

const ListConversationsResponse = z.array(
  z.object({
    uuid: z.string(),
  })
);

const BASE_URL = "https://claude.ai";

export async function generateArchiveFiles(): Promise<ArchiveFile[]> {
  const archiveFiles = [];

  const listOrganizationsRes = await fetch(`${BASE_URL}/api/organizations`);
  const listOrganizationsData = ListOrganizationsResponse.parse(
    await listOrganizationsRes.json()
  );

  for (const organizationSummary of listOrganizationsData) {
    const organizationUUID = organizationSummary.uuid;
    // TODO: handle pagination
    const listConversationsRes = await fetch(
      `${BASE_URL}/api/organizations/${organizationUUID}/chat_conversations?limit=30&offset=0&starred=false&consistency=strong`
    );
    const listConversationsData = ListConversationsResponse.parse(
      await listConversationsRes.json()
    );

    for (const conversationSummary of listConversationsData) {
      const conversationUUID = conversationSummary.uuid;
      const getConversationRes = await fetch(
        `${BASE_URL}/api/organizations/${organizationUUID}/chat_conversations/${conversationUUID}?tree=True&rendering_mode=messages&render_all_tools=true&consistency=strong`
      );
      const getConversationData = await getConversationRes.json();
      archiveFiles.push({
        fileSlug: conversationUUID,
        data: getConversationData,
      });
    }
  }

  return archiveFiles;
}
