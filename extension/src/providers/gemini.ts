import JSZip from "jszip";

const BASE_URL = "https://gemini.google.com";

enum RPCId {
  LIST_CHATS = "MaZiqc",
  READ_CHAT = "hNvQHb",
}

function determineGoogleUserIndex() {
  const userIndexRe = /u\/(\d+)/;
  const parts = userIndexRe.exec(window.location.href);
  if (!parts && parts.length < 1) {
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

export async function generateArchive() {
  const accessToken = await getAccessToken();

  const userIndex = determineGoogleUserIndex();

  // TODO: abstract RPC logic and serialization into separate class
  // TODO: figure out what rest of RPC args are. Reference: https://github.com/HanaokaYuzu/Gemini-API/

  // List all chats
  // [resultsPerPage, null, [???, null, ???]]
  const listChatsReqPayload = [100, null, [0, null, 1]];
  const listChatsReqParams = new URLSearchParams()
  listChatsReqParams.append("f.req", JSON.stringify([
    [[RPCId.LIST_CHATS, JSON.stringify(listChatsReqPayload), null, "generic"]],
  ]));
  listChatsReqParams.append("at", accessToken);
  const listChatsRes = await fetch(`${BASE_URL}/u/${userIndex}/_/BardChatUi/data/batchexecute`, {
    method: "POST",
    body: listChatsReqParams,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    }
  });

  const listChatsData = await listChatsRes.text();
  const parsedListChatsData = JSON.parse(listChatsData.replace(")]}'", ""));
  const chats = JSON.parse(parsedListChatsData[0][2])[2];

  console.log(chats);

  const zip = new JSZip();
  for (const chat of chats) {
    const chatId = chat[0];

    // Read chat content
    // [chatId, ...???]
    const readChatReqPayload = [chatId, 10, null, 1, [0], [4], null, 1];
    const readChatReqParams = new URLSearchParams();
    readChatReqParams.append("f.req", JSON.stringify([
      [[RPCId.READ_CHAT, JSON.stringify(readChatReqPayload), null, "generic"]],
    ]));
    readChatReqParams.append("at", accessToken);
    const readChatRes = await fetch(`${BASE_URL}/u/${userIndex}/_/BardChatUi/data/batchexecute`, {
      method: "POST",
      body: readChatReqParams,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      }
    });

    const readChatData = await readChatRes.text();
    const parsedReadChatData = JSON.parse(readChatData.replace(")]}'", ""));
    const chatContent = JSON.parse(parsedReadChatData[0][2])[0];

    console.log(readChatData);

    zip.file(`${chatId}.json`, JSON.stringify(chatContent));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}