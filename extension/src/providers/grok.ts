import JSZip from "jszip";
import * as z from "zod";

const BASE_URL = "https://grok.com";

const ListConversationsResponse = z.object({
  conversations: z.array(
    z.object({
      conversationId: z.string(),
      nextPageToken: z.union([z.string(), z.undefined()]),
    })
  ),
});

const ResponseNode = z.object({
  responseId: z.string(),
});

const ListResponseNodesResponse = z.object({
  responseNodes: z.array(ResponseNode),
});

export async function generateArchive() {
  const zip = new JSZip();

  // TODO: handle pagination. Get nextPageToken from response and use as pageToken.
  const listConversationsRes = await fetch(
    `${BASE_URL}/rest/app-chat/conversations?pageSize=100`
  );
  const listConversationsData = ListConversationsResponse.parse(
    await listConversationsRes.json()
  );

  for (const conversationSummary of listConversationsData.conversations) {
    const conversationId = conversationSummary.conversationId;

    const listResponseNodesRes = await fetch(
      `${BASE_URL}/rest/app-chat/conversations/${conversationId}/response-node?includeThreads=true`
    );
    const listResponseNodesData = ListResponseNodesResponse.parse(
      await listResponseNodesRes.json()
    );

    const responseIds = listResponseNodesData.responseNodes.map(
      (responseNode) => responseNode.responseId
    );

    const loadResponsesRes = await fetch(
      `${BASE_URL}/rest/app-chat/conversations/${conversationId}/load-responses`,
      {
        method: "POST",
        body: JSON.stringify({
          responseIds,
        }),
      }
    );
    const loadResponsesData = await loadResponsesRes.json();

    zip.file(`${conversationId}.json`, JSON.stringify(loadResponsesData));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
