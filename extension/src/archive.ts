import JSZip from "jszip";
import { CreateArchiveFilesResponse, MessageStatus } from "./messaging";
import { ArchiveFile } from "./scrapers";

export async function generateArchive(archiveFiles: ArchiveFile[]) {
  const zip = new JSZip();
  for (const archiveFile of archiveFiles) {
    zip.file(`${archiveFile.fileSlug}.json`, JSON.stringify(archiveFile.data));
  }
  const content = await zip.generateAsync({ type: "blob" });
  return content;
}

export async function generateBulkArchive(
  entries: CreateArchiveFilesResponse[]
) {
  const zip = new JSZip();
  for (const entry of entries) {
    if (entry.status === MessageStatus.SUCCESS) {
      for (const archiveFile of entry.archiveFiles) {
        zip
          .folder(entry.provider)
          .file(
            `${archiveFile.fileSlug}.json`,
            JSON.stringify(archiveFile.data)
          );
      }
    } else if (entry.status === MessageStatus.ERROR) {
      zip.folder(entry.provider).file(`error.txt`, entry.errorMessage);
    }
  }
  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
