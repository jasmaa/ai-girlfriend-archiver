import { Provider } from "./provider";
import * as z from "zod";

const AutoArchiveConfigEntry = z.object({
  provider: z.enum(Provider),
});

export type AutoArchiveConfigEntry = z.infer<typeof AutoArchiveConfigEntry>;

const AutoArchiveConfig = z.object({
  entries: z.array(AutoArchiveConfigEntry),
});

export type AutoArchiveConfig = z.infer<typeof AutoArchiveConfig>;

const AUTO_ARCHIVE_CONFIG_KEY = "autoArchiveConfig";

export async function saveConfig(updatedConfig: AutoArchiveConfig) {
  await chrome.storage.local.set({ [AUTO_ARCHIVE_CONFIG_KEY]: updatedConfig });
}

export async function loadConfig(): Promise<AutoArchiveConfig> {
  const res = await chrome.storage.local.get(AUTO_ARCHIVE_CONFIG_KEY);

  if (AUTO_ARCHIVE_CONFIG_KEY in res) {
    return AutoArchiveConfig.parse(res[AUTO_ARCHIVE_CONFIG_KEY]);
  } else {
    return {
      entries: [],
    };
  }
}
