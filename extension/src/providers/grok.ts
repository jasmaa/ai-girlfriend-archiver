import JSZip from "jszip";

const BASE_URL = "https://grok.com";

interface ListResponseNodesResponse {
  responseNodes: ResponseNode[];
}

interface ResponseNode {
  responseId: string;
  sender: string;
}

export async function generateArchive() {
  const zip = new JSZip();

  // TODO: handle pagination. Get nextPageToken from response and use as pageToken.
  const listConversationsRes = await fetch(
    `${BASE_URL}/rest/app-chat/conversations?pageSize=100`
  );
  const listConversationsData = await listConversationsRes.json();

  for (const conversationSummary of listConversationsData.conversations) {
    const conversationId = conversationSummary.conversationId;

    const listResponseNodesRes = await fetch(
      `${BASE_URL}/rest/app-chat/conversations/${conversationId}/response-node?includeThreads=true`
    );
    const listResponseNodesData =
      (await listResponseNodesRes.json()) as ListResponseNodesResponse;

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
