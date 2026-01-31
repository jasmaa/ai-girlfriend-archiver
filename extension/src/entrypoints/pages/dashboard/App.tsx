import React, { useEffect, useState } from "react";
import { getAllProviders, Provider } from "../../../provider";
import {
  BulkArchiveConfig,
  BulkArchiveConfigEntry,
  loadBulkArchiveConfig,
  saveBulkArchiveConfig,
} from "../../../configuration";

export default function App() {
  const [entries, setEntries] = useState<BulkArchiveConfigEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newProvider, setNewProvider] = useState(Provider.CHATGPT);

  useEffect(() => {
    (async () => {
      const config = await loadBulkArchiveConfig();
      setEntries([...config.entries]);
    })();
  }, []);

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <h2>Auto Archive Configuration</h2>
      <div className="d-flex flex-column p-3">
        <div className="mb-3">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Provider</th>
                <th scope="col">Conversation Id</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr>
                  <td>
                    <select
                      className="form-select"
                      value={entry.provider}
                      disabled
                    >
                      {getAllProviders().map((provider) => (
                        <option value={provider}>{provider}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input className="form-control" value="*" disabled />
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        const updatedEntries = [...entries];
                        updatedEntries.splice(idx, 1);
                        setEntries(updatedEntries);
                      }}
                    >
                      -
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <select
                    className="form-select"
                    value={newProvider}
                    onChange={(event) => {
                      setNewProvider(event.target.value as Provider);
                    }}
                  >
                    {getAllProviders().map((provider) => (
                      <option value={provider}>{provider}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input className="form-control" value="*" disabled />
                </td>
                <td>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      const newEntry: BulkArchiveConfigEntry = {
                        provider: newProvider,
                      };
                      const updatedEntries = [...entries, newEntry];
                      setEntries(updatedEntries);
                      setNewProvider(Provider.CHATGPT);
                    }}
                  >
                    +
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mb-3">
          <button
            className="btn btn-primary"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              const updatedConfig: BulkArchiveConfig = {
                entries,
              };
              await saveBulkArchiveConfig(updatedConfig);
              await new Promise((resolve) => setTimeout(resolve, 500)); // Fake a bit of loading
              setIsSaving(false);
            }}
          >
            {isSaving && (
              <span
                className="spinner-border spinner-border-sm"
                aria-hidden="true"
              ></span>
            )}
            <span>Saving Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
