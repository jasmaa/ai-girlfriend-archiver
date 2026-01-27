import JSZip from "jszip";
import * as z from "zod";

const BASE_URL = "https://www.perplexity.ai";

const ListThreadsResponse = z.array(
  z.object({
    slug: z.string(),
  })
);

const GetThreadResponse = z.object({
  entries: z.array(z.any()),
  has_next_page: z.boolean(),
  next_cursor: z.null(),
});

export async function generateArchive() {
  const zip = new JSZip();

  // TODO: handle pagination
  const listThreadsRes = await fetch(
    `${BASE_URL}/rest/thread/list_ask_threads?version=2.18&source=default`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        limit: 100,
        offset: 0,
      }),
    }
  );
  const listThreadsData = ListThreadsResponse.parse(
    await listThreadsRes.json()
  );

  for (const threadSummary of listThreadsData) {
    const threadSlug = threadSummary.slug;

    // TODO: handle pagination
    const getThreadRes = await fetch(`${BASE_URL}/rest/thread/${threadSlug}`);
    const rawGetThreadData = await getThreadRes.json();

    // TODO: handle pagination
    const getThreadData = GetThreadResponse.parse(rawGetThreadData);

    zip.file(`${threadSlug}.json`, JSON.stringify(rawGetThreadData));
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
