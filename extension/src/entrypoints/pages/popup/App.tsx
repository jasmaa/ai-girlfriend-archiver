import React, { useState } from "react";
import {
  BulkCreateArchiveFilesRequest,
  BulkCreateArchiveFilesResponse,
  CreateArchiveFilesRequest,
  CreateArchiveFilesResponse,
  Message,
  Status,
} from "../../../messaging";
import { loadBulkArchiveConfig } from "../../../configuration";
import FileSaver from "file-saver";
import { generateArchive, generateBulkArchive } from "../../../archive";

export default function App() {
  const [isGeneratingSingleArchive, setIsGeneratingSingleArchive] =
    useState(false);
  const [isGeneratingBulkArchive, setIsGeneratingBulkArchive] = useState(false);
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
          data-testid="single-archive-btn"
          type="button"
          className="btn btn-primary"
          disabled={isGeneratingSingleArchive || isGeneratingBulkArchive}
          onClick={async () => {
            setErrorMessage(undefined);
            setIsGeneratingSingleArchive(true);
            try {
              const req: CreateArchiveFilesRequest = {
                id: Message.CREATE_ARCHIVE_FILES,
              };
              console.log("Sending create archive request...");

              const res = (await chrome.runtime.sendMessage(
                req
              )) as CreateArchiveFilesResponse;

              if (res.status === Status.ERROR) {
                setErrorMessage(res.errorMessage);
                return;
              }
            } catch (e) {
              setErrorMessage(e.message);
            } finally {
              setIsGeneratingSingleArchive(false);
            }
          }}
        >
          {isGeneratingSingleArchive && (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
          )}
          <span>
            {isGeneratingSingleArchive ? "Generating..." : "Archive this site"}
          </span>
        </button>
      </div>

      <div className="mb-3">
        <button
          data-testid="bulk-archive-btn"
          type="button"
          className="btn btn-primary"
          disabled={isGeneratingSingleArchive || isGeneratingBulkArchive}
          onClick={async () => {
            setErrorMessage(undefined);
            setIsGeneratingBulkArchive(true);
            try {
              const config = await loadBulkArchiveConfig();
              const req: BulkCreateArchiveFilesRequest = {
                id: Message.BULK_CREATE_ARCHIVE_FILES,
                entries: config.entries.map((entry) => ({
                  provider: entry.provider,
                })),
              };
              console.log("Sending create bulk archive request...");

              const res = (await chrome.runtime.sendMessage(
                req
              )) as BulkCreateArchiveFilesResponse;

              if (res.status === Status.ERROR) {
                setErrorMessage(res.errorMessage);
                return;
              }
            } catch (e) {
              setErrorMessage(e.message);
            } finally {
              setIsGeneratingBulkArchive(false);
            }
          }}
        >
          {isGeneratingBulkArchive && (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
          )}
          <span>
            {isGeneratingBulkArchive ? "Generating..." : "Archive all sites"}
          </span>
        </button>
      </div>

      <div className="mb-3">
        <button
          data-testid="dashboard-btn"
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
