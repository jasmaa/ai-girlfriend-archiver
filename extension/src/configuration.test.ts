import { chrome } from "jest-chrome";
import { Provider } from "./provider";
import {
  BulkArchiveConfig,
  loadBulkArchiveConfig,
  saveBulkArchiveConfig,
} from "./configuration";

describe("test saveBulkArchiveConfig", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("saves config", async () => {
    const setLocalStorageSpy = jest.spyOn(chrome.storage.local, "set");

    const config: BulkArchiveConfig = {
      entries: [
        {
          provider: Provider.CHATGPT,
        },
        {
          provider: Provider.GEMINI,
        },
      ],
    };

    await saveBulkArchiveConfig(config);

    expect(setLocalStorageSpy).toHaveBeenCalledWith({
      bulkArchiveConfig: config,
    });
  });
});

describe("test loadBulkArchiveConfig", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("loads config from storage if available", async () => {
    jest.spyOn(chrome.storage.local, "get").mockImplementation(async () => {
      return {
        bulkArchiveConfig: {
          entries: [
            {
              provider: Provider.CHATGPT,
            },
            {
              provider: Provider.GEMINI,
            },
          ],
        },
      };
    });

    const config = await loadBulkArchiveConfig();

    const expectedConfig: BulkArchiveConfig = {
      entries: [
        {
          provider: Provider.CHATGPT,
        },
        {
          provider: Provider.GEMINI,
        },
      ],
    };

    expect(config).toStrictEqual(expectedConfig);
  });

  it("loads default config if not available", async () => {
    jest.spyOn(chrome.storage.local, "get").mockImplementation(async () => {
      return {};
    });

    const config = await loadBulkArchiveConfig();

    const expectedConfig: BulkArchiveConfig = {
      entries: [],
    };

    expect(config).toStrictEqual(expectedConfig);
  });
});
