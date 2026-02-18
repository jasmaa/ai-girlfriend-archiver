import React from "react";
import { chrome } from "jest-chrome";
import { render } from "@testing-library/react";
import App from "./App";
import {
  ArchiveJobStatus,
  GetCurrentArchiveJobResponse,
  MessageStatus,
} from "../../../messaging";

describe("test Popup page", () => {
  // TODO: add more tests
  it("should render buttons", async () => {
    jest.spyOn(chrome.runtime, "sendMessage").mockImplementation(async () => {
      const res: GetCurrentArchiveJobResponse = {
        status: MessageStatus.SUCCESS,
        jobStatus: ArchiveJobStatus.NONE,
      };
      return res;
    });

    jest.spyOn(chrome.tabs, "query").mockImplementation(async () => {
      return [
        {
          index: 0,
          pinned: false,
          highlighted: false,
          windowId: 0,
          active: true,
          incognito: false,
          selected: false,
          discarded: false,
          autoDiscardable: false,
          groupId: 0,
        },
      ];
    });

    const container = render(<App />);

    await container.findByTestId("single-archive-btn");
    await container.findByTestId("bulk-archive-btn");
    await container.findByTestId("dashboard-btn");
  });
});
