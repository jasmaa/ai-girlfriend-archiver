import { ArchiveFile } from "../..";
import { getSession } from "./auth";
import { GeminiClient } from "./gemini-client";

export async function generateArchiveFiles(): Promise<ArchiveFile[]> {
  const archiveFiles = [];

  const session = await getSession();
  const client = new GeminiClient(session);

  const listChatsRes = await client.listChats({
    maxResultsPerPage: 100,
  });

  for (const chatSummary of listChatsRes.results) {
    const { chatId } = chatSummary;

    const results = [];
    let nextToken = undefined;
    do {
      const readChatRes = await client.readChat({
        chatId,
        nextToken,
      });
      for (const result of readChatRes.results) {
        results.push(result);
      }
      nextToken = readChatRes.nextToken;
    } while (nextToken);

    // Reverse to put in chronological order
    results.reverse();

    archiveFiles.push({
      fileSlug: chatId,
      data: results,
    });
  }

  return archiveFiles;
}
