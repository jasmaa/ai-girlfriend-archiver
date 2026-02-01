import React from "react";
import { render } from "@testing-library/react";
import * as configuration from "../../../configuration";
import App from "./App";
import { Provider } from "../../../provider";

describe("test Popup page", () => {
  // TODO: add more tests
  it("should render buttons", async () => {
    const container = render(<App />);

    await container.findByTestId("single-archive-btn");
    await container.findByTestId("bulk-archive-btn");
    await container.findByTestId("dashboard-btn");
  });
});
