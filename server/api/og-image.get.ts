import { SafeFetchError, assertPublicHttps, fetchPublic } from "../utils/safeFetch";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = typeof query.url === "string" ? query.url : "";
  if (!url) {
    throw createError({ statusCode: 400, message: "Missing image URL." });
  }

  try {
    await assertPublicHttps(url);
    const file = await fetchPublic(url, {
      timeoutMs: 10000,
      maxBytes: 8 * 1024 * 1024,
      accept: "image/*,*/*;q=0.8",
    });

    const type = file.contentType || "image/jpeg";
    if (!type.startsWith("image/")) {
      throw new SafeFetchError("That URL is not an image.", 502);
    }

    setHeader(event, "Content-Type", type);
    setHeader(event, "Cache-Control", "public, max-age=300");
    return Buffer.from(file.body);
  } catch (err) {
    if (err instanceof SafeFetchError) {
      throw createError({ statusCode: err.statusCode, message: err.message });
    }
    throw createError({ statusCode: 502, message: "Could not load that image." });
  }
});
