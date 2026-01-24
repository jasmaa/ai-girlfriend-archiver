export enum Message {
  CREATE_ARCHIVE = "create-archive"
}

export interface CreateArchiveRequest {
  id: Message.CREATE_ARCHIVE;
}

export interface CreateArchiveResponse {}