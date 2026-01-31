import React, { useState } from "react";
import {
  CreateArchiveRequest,
  CreateArchiveResponse,
  Message,
  Status,
} from "../../../messaging";

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  return (
    <div className="d-flex flex-column p-3">
      {errorMessage && (
        <div className="mb-3">
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        </div>
      )}

      <div className="mb-3">
        <button
          type="button"
          className="btn btn-primary"
          disabled={isGenerating}
          onClick={async () => {
            setIsGenerating(true);
            try {
              const req: CreateArchiveRequest = {
                id: Message.CREATE_ARCHIVE,
              };
              console.log("Sending create archive request...");

              const res = (await chrome.runtime.sendMessage(
                req
              )) as CreateArchiveResponse;

              if (res.status === Status.ERROR) {
                setErrorMessage(res.errorMessage);
              } else if (res.status === Status.SUCCESS) {
                setErrorMessage(undefined);
              }
            } finally {
              setIsGenerating(false);
            }
          }}
        >
          {isGenerating && (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
          )}
          <span>{isGenerating ? "Generating..." : "Create archive"}</span>
        </button>
      </div>

      <div className="mb-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            chrome.tabs.create({ url: "dashboard.html" });
            window.close();
          }}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
