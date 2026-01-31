import {
  CreateArchiveRequest,
  CreateArchiveResponse,
  Message,
  Status,
} from "../../../messaging";

const createArchiveButton = document.getElementById(
  "create-archive-btn"
) as HTMLButtonElement;

const dashboardButton = document.getElementById(
  "dashboard-btn"
) as HTMLButtonElement;

const errorAlertContainer = document.getElementById(
  "error-alert-container"
) as HTMLDivElement;

const errorAlert = document.getElementById("error-alert") as HTMLSelectElement;

window.addEventListener("load", (event) => {
  errorAlertContainer.hidden = true;
});

createArchiveButton.addEventListener("click", async (e) => {
  createArchiveButton.disabled = true;
  createArchiveButton.textContent = "Generating...";
  try {
    const req: CreateArchiveRequest = {
      id: Message.CREATE_ARCHIVE,
    };
    console.log("Sending create archive request...");

    const res = (await chrome.runtime.sendMessage(
      req
    )) as CreateArchiveResponse;

    if (res.status === Status.ERROR) {
      errorAlertContainer.hidden = false;
      errorAlert.textContent = res.errorMessage;
    } else if (res.status === Status.SUCCESS) {
      errorAlertContainer.hidden = true;
    }
  } finally {
    createArchiveButton.disabled = false;
    createArchiveButton.textContent = "Create Archive";
  }
});

dashboardButton.addEventListener("click", () => {
  chrome.tabs.create({ url: "dashboard.html" });
  window.close();
});
