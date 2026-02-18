import React, { useEffect, useRef, useState } from "react";
import {
  BackgroundMessage,
  MessageStatus,
  CreateArchiveJobRequest,
  ArchiveJobType,
  CreateArchiveJobResponse,
  GetCurrentArchiveJobRequest,
  GetCurrentArchiveJobResponse,
  ArchiveJobStatus,
} from "../../../messaging";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { getCurrentTab, waitForContentScriptAvailable } from "../../../utils";

export default function App() {
  const jobStatusPollingRef = useRef(null);
  const [isValidCurrentTab, setIsValidCurrentTab] = useState(false);
  const [isGeneratingArchive, setIsGeneratingArchive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const queryAndUpdateIsGeneratingArchive = async () => {
    const req: GetCurrentArchiveJobRequest = {
      id: BackgroundMessage.GET_CURRENT_ARCHIVE_JOB,
    };
    const res = (await chrome.runtime.sendMessage(
      req
    )) as GetCurrentArchiveJobResponse;
    setIsGeneratingArchive(res.jobStatus === ArchiveJobStatus.IN_PROGRESS);
  };

  useEffect(() => {
    (async () => {
      const currentTab = await getCurrentTab();
      await waitForContentScriptAvailable(currentTab.id);
      setIsValidCurrentTab(true);
    })();
  }, []);

  useEffect(() => {
    queryAndUpdateIsGeneratingArchive();
    jobStatusPollingRef.current = setInterval(
      queryAndUpdateIsGeneratingArchive,
      3000
    );

    return () => {
      clearInterval(jobStatusPollingRef.current);
    };
  }, []);

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
          disabled={!isValidCurrentTab || isGeneratingArchive}
          onClick={async () => {
            setErrorMessage(undefined);
            setIsGeneratingArchive(true);
            try {
              const req: CreateArchiveJobRequest = {
                id: BackgroundMessage.CREATE_ARCHIVE_JOB,
                jobType: ArchiveJobType.SINGLE,
              };
              console.log("Sending create archive request...");

              const res = (await chrome.runtime.sendMessage(
                req
              )) as CreateArchiveJobResponse;

              if (res.status === MessageStatus.ERROR) {
                setErrorMessage(res.errorMessage);
                return;
              }
            } catch (e) {
              setErrorMessage(e.message);
            } finally {
              setIsGeneratingArchive(false);
            }
          }}
        >
          {isGeneratingArchive && (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
          )}
          <span>
            {isGeneratingArchive ? "Generating..." : "Archive this site"}
          </span>
        </button>
      </div>

      <div className="mb-3">
        <button
          data-testid="bulk-archive-btn"
          type="button"
          className="btn btn-primary"
          disabled={isGeneratingArchive}
          onClick={async () => {
            setErrorMessage(undefined);
            setIsGeneratingArchive(true);
            try {
              const req: CreateArchiveJobRequest = {
                id: BackgroundMessage.CREATE_ARCHIVE_JOB,
                jobType: ArchiveJobType.BULK,
              };
              console.log("Sending create bulk archive request...");

              const res = (await chrome.runtime.sendMessage(
                req
              )) as CreateArchiveJobResponse;

              if (res.status === MessageStatus.ERROR) {
                setErrorMessage(res.errorMessage);
                return;
              }
            } catch (e) {
              setErrorMessage(e.message);
            } finally {
              setIsGeneratingArchive(false);
            }
          }}
        >
          {isGeneratingArchive && (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
          )}
          <span>
            {isGeneratingArchive ? "Generating..." : "Archive all sites"}
          </span>
        </button>
      </div>

      <div className="mb-3">
        <button
          data-testid="dashboard-btn"
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            chrome.tabs.create({ url: "dashboard.html" });
            window.close();
          }}
        >
          <FontAwesomeIcon icon={faGear} />
        </button>
      </div>
    </div>
  );
}
