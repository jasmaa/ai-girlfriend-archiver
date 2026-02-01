import React from "react";
import { render } from "@testing-library/react";
import * as configuration from "../../../configuration";
import App from "./App";
import { Provider } from "../../../provider";

describe("test Dashboard page", () => {
  // TODO: add more tests
  it("should render entries", async () => {
    jest
      .spyOn(configuration, "loadBulkArchiveConfig")
      .mockImplementation(async () => {
        return {
          entries: [
            {
              provider: Provider.CHATGPT,
            },
            {
              provider: Provider.GEMINI,
            },
          ],
        };
      });
    jest
      .spyOn(configuration, "saveBulkArchiveConfig")
      .mockImplementation(async (updatedConfig) => {});

    const container = render(<App />);

    await container.findByText("CHATGPT");
    await container.findByText("GEMINI");
  });
});
