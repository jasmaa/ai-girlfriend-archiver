import JSZip from "jszip";

export interface ArchiveFile {
  fileSlug: string;
  data: any;
}

export async function generateArchive(archiveFiles: ArchiveFile[]) {
  const zip = new JSZip();
  for (const archiveFile of archiveFiles) {
    zip.file(`${archiveFile.fileSlug}.json`, JSON.stringify(archiveFile.data));
  }
  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
