import JSZip from "jszip";

const BASE_URL = "https://gemini.google.com";

interface Session {
  accessToken: string;
  userIndex: number;
}

enum RPCId {
  LIST_CHATS = "MaZiqc",
  READ_CHAT = "hNvQHb",
}

interface ListChatsRequest {
  maxResultsPerPage: number;
}

interface ListChatsResponse {
  results: {
    chatId: string;
  }[];
}

interface ReadChatRequest {
  chatId: string;
}

interface ReadChatResponse {
  results: {
    chatId: string;
    userMessageId: string;
    userMessage: string;
    assistantMessageId: string;
    assistantMessage: string;
  }[];
}

// TODO: figure out what rest of RPC args are. Reference: https://github.com/HanaokaYuzu/Gemini-API/
class GeminiClient {
  private session: Session;

  constructor(session: Session) {
    this.session = session;
  }

  async listChats(req: ListChatsRequest): Promise<ListChatsResponse> {
    // Serialize
    // List all chats
    // [resultsPerPage, null, [???, null, ???]]
    const rawRequest = JSON.stringify([
      [
        [
          RPCId.LIST_CHATS,
          JSON.stringify([req.maxResultsPerPage, null, [0, null, 1]]),
          null,
          "generic",
        ],
      ],
    ]);

    // Execute
    const rawResponse = await this.batchExecute(rawRequest);

    // Deserialize
    const parsedTask = JSON.parse(rawResponse.replace(")]}'", ""));
    const parsedResponse = JSON.parse(parsedTask[0][2]);
    const chats = parsedResponse[2];
    const results = [];
    for (const chat of chats) {
      results.push({
        chatId: chat[0],
      });
    }

    return {
      results,
    };
  }

  async readChat(req: ReadChatRequest): Promise<ReadChatResponse> {
    // Serialize
    // Read chat content
    // [chatId, ...???]
    const rawRequest = JSON.stringify([
      [
        [
          RPCId.READ_CHAT,
          JSON.stringify([req.chatId, 10, null, 1, [0], [4], null, 1]),
          null,
          "generic",
        ],
      ],
    ]);

    // Execute
    const rawResponse = await this.batchExecute(rawRequest);

    // Deserialize
    const parsedTask = JSON.parse(rawResponse.replace(")]}'", ""));
    const parsedResponse = JSON.parse(parsedTask[0][2]);

    // TODO: figure out and map to response schema
    const results = [];
    const chat = parsedResponse[0];
    for (const message of chat) {
      results.push({
        chatId: message[0][0],
        userMessageId: message[0][1],
        userMessage: message[2][0][0],
        assistantMessageId: message[3][0][0][0],
        assistantMessage: message[3][0][0][1][0],
      });
    }

    // Reverse to put in chronological order
    results.reverse();

    return { results };
  }

  private async batchExecute(rawRequest: string) {
    const params = new URLSearchParams();
    params.append("f.req", rawRequest);
    params.append("at", this.session.accessToken);
    const res = await fetch(
      `${BASE_URL}/u/${this.session.userIndex}/_/BardChatUi/data/batchexecute`,
      {
        method: "POST",
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );

    const rawResponse = await res.text();
    return rawResponse;
  }
}

function determineGoogleUserIndex() {
  const userIndexRe = /u\/(\d+)/;
  const parts = userIndexRe.exec(window.location.href);
  if (!parts && parts.length < 1) {
    // Default 0th user
    return 0;
  } else {
    return parseInt(parts[1]);
  }
}

async function getAccessToken() {
  const scriptEls = document.querySelectorAll('[data-id="_gd"]');

  if (scriptEls.length < 1) {
    throw new Error("unable to find access token");
  }

  const scriptText = scriptEls[0].textContent;
  const accessTokenRe = /"SNlM0e":"(.*?)"/;
  const parts = accessTokenRe.exec(scriptText);

  if (!parts || parts.length < 1) {
    throw new Error("unable to find access token");
  }

  const accessToken = parts[1];

  return accessToken;
}

async function getSession() {
  const accessToken = await getAccessToken();
  const userIndex = determineGoogleUserIndex();
  const session: Session = {
    accessToken,
    userIndex,
  };
  return session;
}

export async function generateArchive() {
  const session = await getSession();
  const client = new GeminiClient(session);

  const listChatsRes = await client.listChats({
    maxResultsPerPage: 100,
  });

  const zip = new JSZip();
  for (const chatSummary of listChatsRes.results) {
    const { chatId } = chatSummary;
    const readChatRes = await client.readChat({
      chatId,
    });
    zip.file(`${chatId}.json`, JSON.stringify(readChatRes.results));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
