import {
  ListChatsRequest,
  ListChatsResponse,
  ReadChatRequest,
  ReadChatResponse,
  RPCId,
  Session,
} from "./models";

const BASE_URL = "https://gemini.google.com";

// TODO: figure out what rest of RPC args are. Reference: https://github.com/HanaokaYuzu/Gemini-API/
export class GeminiClient {
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
    // [chatId, ???, nextToken, ...???]
    const rawRequest = JSON.stringify([
      [
        [
          RPCId.READ_CHAT,
          JSON.stringify([
            req.chatId,
            10,
            req.nextToken ? req.nextToken : null,
            1,
            [0],
            [4],
            null,
            1,
          ]),
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
    const nextToken: string = parsedResponse[1];

    return { results, nextToken };
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
