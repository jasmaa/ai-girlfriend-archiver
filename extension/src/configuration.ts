import { Provider } from "./provider";
import * as z from "zod";

const BulkArchiveConfigEntry = z.object({
  provider: z.enum(Provider),
});

export type BulkArchiveConfigEntry = z.infer<typeof BulkArchiveConfigEntry>;

const BulkArchiveConfig = z.object({
  entries: z.array(BulkArchiveConfigEntry),
});

export type BulkArchiveConfig = z.infer<typeof BulkArchiveConfig>;

const BULK_ARCHIVE_CONFIG_KEY = "bulkArchiveConfig";

export async function saveBulkArchiveConfig(updatedConfig: BulkArchiveConfig) {
  await chrome.storage.local.set({ [BULK_ARCHIVE_CONFIG_KEY]: updatedConfig });
}

export async function loadBulkArchiveConfig(): Promise<BulkArchiveConfig> {
  const res = await chrome.storage.local.get(BULK_ARCHIVE_CONFIG_KEY);

  if (BULK_ARCHIVE_CONFIG_KEY in res) {
    return BulkArchiveConfig.parse(res[BULK_ARCHIVE_CONFIG_KEY]);
  } else {
    return {
      entries: [],
    };
  }
}
