import JSZip from "jszip";
import * as chatgpt from "./providers/chatgpt";
import * as copilot from "./providers/copilot";
import * as gemini from "./providers/gemini";
import * as claude from "./providers/claude";
import * as perplexity from "./providers/perplexity";
import * as grok from "./providers/grok";
import * as deepseek from "./providers/deepseek";
import { Provider } from "./provider";

export interface ArchiveFile {
  fileSlug: string;
  data: any;
}

export async function generateArchiveFiles(provider: Provider) {
  if (provider === Provider.CHATGPT) {
    return await chatgpt.generateArchiveFiles();
  } else if (provider === Provider.COPILOT) {
    return await copilot.generateArchiveFiles();
  } else if (provider === Provider.GEMINI) {
    return await gemini.generateArchiveFiles();
  } else if (provider === Provider.CLAUDE) {
    return await claude.generateArchiveFiles();
  } else if (provider === Provider.PERPLEXITY) {
    return await perplexity.generateArchiveFiles();
  } else if (provider === Provider.GROK) {
    return await grok.generateArchiveFiles();
  } else if (provider === Provider.DEEPSEEK) {
    return await deepseek.generateArchiveFiles();
  } else {
    throw new Error("provider is not supported");
  }
}

export async function generateArchive(archiveFiles: ArchiveFile[]) {
  const zip = new JSZip();
  for (const archiveFile of archiveFiles) {
    zip.file(`${archiveFile.fileSlug}.json`, JSON.stringify(archiveFile.data));
  }
  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
