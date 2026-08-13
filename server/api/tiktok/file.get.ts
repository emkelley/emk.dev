import { Readable } from "node:stream";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import {
  TikTokError,
  fetchTikTokFile,
  resolveTikTokVideo,
} from "../../utils/tiktok";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = typeof query.url === "string" ? query.url : "";
  const inline = query.inline === "1" || query.inline === "true";
  const range = getHeader(event, "range");

  try {
    const video = await resolveTikTokVideo(url);
    const upstream = await fetchTikTokFile(
      video.playUrl,
      video.cookies,
      inline ? range : undefined
    );

    if (!upstream.body) {
      throw new TikTokError("TikTok CDN returned an empty file.", 502);
    }

    setResponseStatus(event, upstream.status);
    setHeader(
      event,
      "Content-Type",
      upstream.headers.get("content-type") || "video/mp4"
    );
    setHeader(event, "Cache-Control", "no-store");
    setHeader(
      event,
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename="${video.filename}"`
    );

    const length = upstream.headers.get("content-length");
    if (length) setHeader(event, "Content-Length", length);

    const contentRange = upstream.headers.get("content-range");
    if (contentRange) setHeader(event, "Content-Range", contentRange);

    const acceptRanges = upstream.headers.get("accept-ranges");
    if (acceptRanges) setHeader(event, "Accept-Ranges", acceptRanges);

    return sendStream(
      event,
      Readable.fromWeb(upstream.body as NodeWebReadableStream<Uint8Array>)
    );
  } catch (err) {
    if (err instanceof TikTokError) {
      throw createError({
        statusCode: err.statusCode,
        message: err.message,
      });
    }
    throw createError({
      statusCode: 502,
      message: "Could not pull that file from TikTok.",
    });
  }
});
