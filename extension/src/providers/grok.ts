import * as z from "zod";
import { ArchiveFile } from "../archive";

const BASE_URL = "https://grok.com";

const ListConversationsResponse = z.object({
  conversations: z.array(
    z.object({
      conversationId: z.string(),
    })
  ),
  nextPageToken: z.union([z.string(), z.undefined()]),
});

const ResponseNode = z.object({
  responseId: z.string(),
});

const ListResponseNodesResponse = z.object({
  responseNodes: z.array(ResponseNode),
});

export async function generateArchiveFiles(): Promise<ArchiveFile[]> {
  const archiveFiles = [];

  let pageToken = undefined;
  const conversationSummaries = [];
  do {
    const url = new URL("/rest/app-chat/conversations", BASE_URL);
    url.searchParams.append("pageSize", "100");
    if (pageToken) {
      url.searchParams.append("pageToken", pageToken);
    }

    const listConversationsRes = await fetch(url.toString());
    const listConversationsData = ListConversationsResponse.parse(
      await listConversationsRes.json()
    );

    for (const conversationSummary of listConversationsData.conversations) {
      conversationSummaries.push(conversationSummary);
    }

    pageToken = listConversationsData.nextPageToken;
  } while (pageToken);

  for (const conversationSummary of conversationSummaries) {
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

    archiveFiles.push({
      fileSlug: conversationId,
      data: loadResponsesData,
    });
  }

  return archiveFiles;
}
