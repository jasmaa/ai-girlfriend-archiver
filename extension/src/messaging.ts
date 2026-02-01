import { ArchiveFile } from "./scrapers";
import { Provider } from "./provider";

export enum Message {
  CREATE_ARCHIVE_FILES = "create-archive-files",
  BULK_CREATE_ARCHIVE_FILES = "bulk-create-archive-files",
}

export enum Status {
  SUCCESS = "success",
  ERROR = "error",
}

export interface CreateArchiveFilesRequest {
  id: Message.CREATE_ARCHIVE_FILES;
}

export interface CreateArchiveFilesResponse {
  status: Status;
  errorMessage?: string;
  provider?: Provider;
  archiveFiles?: ArchiveFile[];
}

export interface BulkCreateArchiveFilesRequest {
  id: Message.BULK_CREATE_ARCHIVE_FILES;
  entries: {
    provider: Provider;
  }[];
}

export interface BulkCreateArchiveFilesResponse {
  status: Status;
  errorMessage?: string;
  entries?: {
    status: Status;
    errorMessage?: string;
    provider: Provider;
    archiveFiles?: ArchiveFile[];
  }[];
}
