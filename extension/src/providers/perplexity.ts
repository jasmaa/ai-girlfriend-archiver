import JSZip from "jszip";

const BASE_URL = "https://www.perplexity.ai";

export async function generateArchive() {
  const zip = new JSZip();

  const listThreadsRes = await fetch(
    `${BASE_URL}/rest/thread/list_ask_threads?version=2.18&source=default`,
    {
      method: "POST",
    }
  );
  const listThreadsData = await listThreadsRes.json();

  for (const threadSummary of listThreadsData) {
    const threadSlug = threadSummary.slug;

    // TODO: handle pagination
    const getThreadRes = await fetch(`${BASE_URL}/rest/thread/${threadSlug}`);
    const getThreadData = await getThreadRes.json();

    zip.file(`${threadSlug}.json`, JSON.stringify(getThreadData.entries));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
