import {
  TikTokError,
  resolveTikTokVideo,
  toPublicMeta,
} from "../../utils/tiktok";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url?: string }>(event).catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";

  try {
    const video = await resolveTikTokVideo(url);
    return toPublicMeta(video);
  } catch (err) {
    if (err instanceof TikTokError) {
      throw createError({
        statusCode: err.statusCode,
        message: err.message,
      });
    }
    throw createError({
      statusCode: 502,
      message: "Could not reach TikTok. Try again in a bit.",
    });
  }
});
