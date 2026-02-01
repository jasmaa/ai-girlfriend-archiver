import JSZip from "jszip";
import {
  BulkCreateArchiveFilesResponse,
  CreateArchiveFilesResponse,
  Status,
} from "./messaging";

export async function generateArchive(res: CreateArchiveFilesResponse) {
  const zip = new JSZip();
  for (const archiveFile of res.archiveFiles) {
    zip.file(`${archiveFile.fileSlug}.json`, JSON.stringify(archiveFile.data));
  }
  const content = await zip.generateAsync({ type: "blob" });
  return content;
}

export async function generateBulkArchive(res: BulkCreateArchiveFilesResponse) {
  const zip = new JSZip();
  for (const entry of res.entries) {
    if (entry.status === Status.SUCCESS) {
      for (const archiveFile of entry.archiveFiles) {
        zip
          .folder(entry.provider)
          .file(
            `${archiveFile.fileSlug}.json`,
            JSON.stringify(archiveFile.data)
          );
      }
    } else if (entry.status === Status.ERROR) {
      zip.folder(entry.provider).file(`error.txt`, entry.errorMessage);
    }
  }
  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
