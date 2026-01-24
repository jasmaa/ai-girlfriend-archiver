import {
  CreateArchiveRequest,
  Message,
} from "../../messaging";

const createArchiveButton = document.getElementById(
  "create-archive-btn"
) as HTMLSelectElement;

createArchiveButton.addEventListener("click", async (e) => {
  createArchiveButton.disabled = true;
  createArchiveButton.textContent = "Generating..."
  try {
    const req: CreateArchiveRequest = {
      id: Message.CREATE_ARCHIVE,
    };
    console.log("Sending create archive request...");
    await chrome.runtime.sendMessage(req);
  } finally {
    createArchiveButton.disabled = false;
    createArchiveButton.textContent = "Create Archive";
  }
});