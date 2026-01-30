import { getWindowLocationHref } from "./dom-helpers";
import { Session } from "./models";

function determineGoogleUserIndex() {
  const userIndexRe = /u\/(\d+)/;
  const parts = userIndexRe.exec(getWindowLocationHref());
  if (!parts || parts.length < 1) {
    // Default 0th user
    return 0;
  } else {
    return parseInt(parts[1]);
  }
}

async function getAccessToken() {
  const scriptEls = document.querySelectorAll('[data-id="_gd"]');

  if (scriptEls.length < 1) {
    throw new Error("unable to find access token");
  }

  const scriptText = scriptEls[0].textContent;
  const accessTokenRe = /"SNlM0e":"(.*?)"/;
  const parts = accessTokenRe.exec(scriptText);

  if (!parts || parts.length < 1) {
    throw new Error("unable to find access token");
  }

  const accessToken = parts[1];

  return accessToken;
}

export async function getSession() {
  const accessToken = await getAccessToken();
  const userIndex = determineGoogleUserIndex();
  const session: Session = {
    accessToken,
    userIndex,
  };
  return session;
}
