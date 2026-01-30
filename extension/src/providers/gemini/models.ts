export interface Session {
  accessToken: string;
  userIndex: number;
}

export enum RPCId {
  LIST_CHATS = "MaZiqc",
  READ_CHAT = "hNvQHb",
}

export interface ListChatsRequest {
  maxResultsPerPage: number;
}

export interface ListChatsResponse {
  results: {
    chatId: string;
  }[];
}

export interface ReadChatRequest {
  chatId: string;
  nextToken?: string;
}

export interface ReadChatResponse {
  results: {
    chatId: string;
    userMessageId: string;
    userMessage: string;
    assistantMessageId: string;
    assistantMessage: string;
  }[];
  nextToken: string;
}
