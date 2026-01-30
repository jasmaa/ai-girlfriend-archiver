import * as domHelpers from "./dom-helpers";
import { getSession } from "./auth";

describe("test Gemini getSession", () => {
  let originalBodyInnerHTML: string;

  beforeEach(() => {
    jest
      .spyOn(domHelpers, "getWindowLocationHref")
      .mockReturnValue("https://gemini.google.com/app");

    originalBodyInnerHTML = document.body.innerHTML;
    document.body.innerHTML = `<script data-id="_gd">{"SNlM0e":"superSecretAccessToken"}</script>`;
  });

  afterEach(() => {
    document.body.innerHTML = originalBodyInnerHTML;
  });

  it("should get session with default user", async () => {
    const session = await getSession();

    expect(session.accessToken).toBe("superSecretAccessToken");
    expect(session.userIndex).toBe(0);
  });

  it("should get session with numbered user", async () => {
    jest
      .spyOn(domHelpers, "getWindowLocationHref")
      .mockReturnValue("https://gemini.google.com/u/1/app");

    const session = await getSession();

    expect(session.accessToken).toBe("superSecretAccessToken");
    expect(session.userIndex).toBe(1);
  });
});
