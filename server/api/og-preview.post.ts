import { SafeFetchError, fetchPublic } from "../utils/safeFetch";
import { parseOgHtml } from "../utils/ogMeta";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url?: string }>(event).catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) {
    throw createError({ statusCode: 400, message: "Paste a URL first." });
  }
  if (url.length > 2000) {
    throw createError({ statusCode: 400, message: "That URL is too long." });
  }

  try {
    const page = await fetchPublic(url, {
      timeoutMs: 10000,
      maxBytes: 512 * 1024,
      accept: "text/html,application/xhtml+xml",
    });
    const html = new TextDecoder("utf-8", { fatal: false }).decode(page.body);
    return parseOgHtml(html, page.url);
  } catch (err) {
    if (err instanceof SafeFetchError) {
      throw createError({ statusCode: err.statusCode, message: err.message });
    }
    throw createError({
      statusCode: 502,
      message: "Could not read that page.",
    });
  }
});
