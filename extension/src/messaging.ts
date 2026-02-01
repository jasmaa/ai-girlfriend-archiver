import { ArchiveFile } from "./scrapers";
import { Provider } from "./provider";

export enum BackgroundMessage {
  GET_CURRENT_ARCHIVE_JOB = "background:GetCurrentArchiveJob",
  CREATE_ARCHIVE_JOB = "background:CreateArchiveJob",
}

export enum ContentMessage {
  GET_STATUS = "content:GetStatus",
  CREATE_ARCHIVE_FILES = "content:CreateArchiveFiles",
  BULK_CREATE_ARCHIVE_FILES = "content:BulkCreateArchiveFiles",
}

export enum MessageStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export interface CreateArchiveFilesRequest {
  id: ContentMessage.CREATE_ARCHIVE_FILES;
}

export interface CreateArchiveFilesResponse {
  status: MessageStatus;
  errorMessage?: string;
  provider?: Provider;
  archiveFiles?: ArchiveFile[];
}

export interface BulkCreateArchiveFilesRequest {
  id: ContentMessage.BULK_CREATE_ARCHIVE_FILES;
  entries: {
    provider: Provider;
  }[];
}

export interface BulkCreateArchiveFilesResponse {
  status: MessageStatus;
  errorMessage?: string;
  entries?: {
    status: MessageStatus;
    errorMessage?: string;
    provider: Provider;
    archiveFiles?: ArchiveFile[];
  }[];
}

export enum ArchiveJobType {
  SINGLE,
  BULK,
}

export enum ArchiveJobStatus {
  NONE = "none",
  IN_PROGRESS = "in-progress",
}

export interface CreateArchiveJobRequest {
  id: BackgroundMessage.CREATE_ARCHIVE_JOB;
  jobType: ArchiveJobType;
}

export interface CreateArchiveJobResponse {
  status: MessageStatus;
  errorMessage?: string;
}

export interface GetCurrentArchiveJobRequest {
  id: BackgroundMessage.GET_CURRENT_ARCHIVE_JOB;
}

export interface GetCurrentArchiveJobResponse {
  status: MessageStatus;
  errorMessage?: string;
  jobStatus: ArchiveJobStatus;
}
