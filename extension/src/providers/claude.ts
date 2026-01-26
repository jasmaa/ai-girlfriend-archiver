import JSZip from "jszip";

const BASE_URL = "https://claude.ai";

export async function generateArchive() {
  const zip = new JSZip();

  const listOrganizationsRes = await fetch(`${BASE_URL}/api/organizations`);
  const listOrganizationsData = await listOrganizationsRes.json();

  for (const organizationSummary of listOrganizationsData) {
    const organizationUUID = organizationSummary.uuid;
    const listConversationsRes = await fetch(
      `${BASE_URL}/api/organizations/${organizationUUID}/chat_conversations?limit=30&offset=0&starred=false&consistency=strong`
    );
    const listConversationsData = await listConversationsRes.json();

    for (const conversationSummary of listConversationsData) {
      const conversationUUID = conversationSummary.uuid;
      const getConversationRes = await fetch(
        `${BASE_URL}/api/organizations/${organizationUUID}/chat_conversations/${conversationUUID}?tree=True&rendering_mode=messages&render_all_tools=true&consistency=strong`
      );
      const getConversationData = await getConversationRes.json();

      zip.file(`${conversationUUID}.json`, JSON.stringify(getConversationData));
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
