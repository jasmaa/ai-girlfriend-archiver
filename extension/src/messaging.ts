export enum Message {
  CREATE_ARCHIVE = "create-archive",
}

export enum Status {
  SUCCESS = "success",
  ERROR = "error",
}

export interface CreateArchiveRequest {
  id: Message.CREATE_ARCHIVE;
}

export interface CreateArchiveResponse {
  status: Status;
  errorMessage?: string;
}
