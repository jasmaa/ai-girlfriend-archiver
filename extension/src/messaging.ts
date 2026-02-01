import { ArchiveFile } from "./scrapers";
import { Provider } from "./provider";

export enum MessageStatus {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

// Content

export enum ContentMessage {
  CREATE_ARCHIVE_FILES = "content:CreateArchiveFiles",
  GET_STATUS = "content:GetStatus",
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

export interface GetStatusRequest {
  id: ContentMessage.GET_STATUS;
}

export interface GetStatusResponse {
  status: MessageStatus;
  errorMessage?: string;
}

// Background

export enum BackgroundMessage {
  GET_CURRENT_ARCHIVE_JOB = "background:GetCurrentArchiveJob",
  CREATE_ARCHIVE_JOB = "background:CreateArchiveJob",
}

export enum ArchiveJobType {
  SINGLE = "SINGLE",
  BULK = "BULK",
}

export enum ArchiveJobStatus {
  NONE = "NONE",
  IN_PROGRESS = "IN_PROGRESS",
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
