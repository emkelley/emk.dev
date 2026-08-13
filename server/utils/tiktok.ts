const PAGE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";
const SHORT_UA = PAGE_UA.split(" Chrome/1")[0];
const ALT_UA = "emk-dev/tiktok (+https://emk.dev)";

const PAGE_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
]);

const CDN_HOST =
  /(^|\.)(tiktok\.com|tiktokcdn\.com|tiktokcdn-us\.com|tiktokcdn-eu\.com|tiktokcdn-in\.com|ttlivecdn\.com|muscdn\.com|byteicdn\.com|ibyteimg\.com)$/i;

const VIDEO_ID_RE = /\/video\/(\d{10,25})/;
const PHOTO_ID_RE = /\/photo\/(\d{10,25})/;

const UNIVERSAL_MARKER =
  '<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">';

export interface TikTokVideo {
  id: string;
  author: string;
  nickname: string;
  description: string;
  duration: number;
  width: number;
  height: number;
  cover: string;
  filename: string;
  pageUrl: string;
  playUrl: string;
  cookies: string;
}

export type TikTokPublicMeta = Omit<TikTokVideo, "playUrl" | "cookies">;

export class TikTokError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "TikTokError";
    this.statusCode = statusCode;
  }
}

export function toPublicMeta(video: TikTokVideo): TikTokPublicMeta {
  return {
    id: video.id,
    author: video.author,
    nickname: video.nickname,
    description: video.description,
    duration: video.duration,
    width: video.width,
    height: video.height,
    cover: video.cover,
    filename: video.filename,
    pageUrl: video.pageUrl,
  };
}

export function parseTikTokInput(raw: string): URL {
  const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
  if (!trimmed) {
    throw new TikTokError("Paste a TikTok link first.");
  }
  if (trimmed.length > 500) {
    throw new TikTokError("That link is longer than a TikTok URL should be.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new TikTokError("That is not a valid URL.");
  }

  const host = url.hostname.replace(/^www\./, "");
  if (host !== "tiktok.com" && !PAGE_HOSTS.has(url.hostname)) {
    throw new TikTokError("That is not a TikTok link.");
  }

  return url;
}

export async function resolveTikTokVideo(rawUrl: string): Promise<TikTokVideo> {
  const input = parseTikTokInput(rawUrl);
  const { postId } = await resolvePost(input);
  const { item, cookies } = await fetchVideoItem(postId);
  const playUrl = pickPlayUrl(item.video);

  if (!playUrl) {
    throw new TikTokError("TikTok did not expose a video file for that post.", 502);
  }
  if (!isAllowedCdnUrl(playUrl)) {
    throw new TikTokError("TikTok returned a file host this tool will not fetch.", 502);
  }

  const author = sanitizeFilename(String(item.author?.uniqueId || "user"));
  const id = String(item.id || postId);

  return {
    id,
    author,
    nickname: String(item.author?.nickname || author),
    description: String(item.desc || "").trim(),
    duration: Number(item.video?.duration) || 0,
    width: Number(item.video?.width) || 0,
    height: Number(item.video?.height) || 0,
    cover: pickCover(item.video),
    filename: `tiktok_${author}_${id}.mp4`,
    pageUrl: `https://www.tiktok.com/@${author}/video/${id}`,
    playUrl,
    cookies,
  };
}

export async function fetchTikTokFile(
  playUrl: string,
  cookies: string,
  range?: string
): Promise<Response> {
  if (!isAllowedCdnUrl(playUrl)) {
    throw new TikTokError("Refusing to fetch a host that is not TikTok CDN.", 400);
  }

  const headers: Record<string, string> = {
    "user-agent": PAGE_UA,
    referer: "https://www.tiktok.com/",
    accept: "*/*",
  };
  if (cookies) headers.cookie = cookies;
  if (range) headers.range = range;

  const res = await fetch(playUrl, {
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok && res.status !== 206) {
    throw new TikTokError("TikTok CDN refused the file. Try again in a bit.", 502);
  }

  return res;
}

async function resolvePost(url: URL): Promise<{ postId: string; pageUrl: string }> {
  const direct = readVideoId(url);
  if (direct) {
    return { postId: direct, pageUrl: `https://www.tiktok.com/@i/video/${direct}` };
  }

  if (PHOTO_ID_RE.test(url.pathname)) {
    throw new TikTokError("That post is a photo slideshow, not a video.");
  }

  let current = url;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(current.href, {
      method: "GET",
      redirect: "manual",
      headers: {
        "user-agent": SHORT_UA,
        accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
    });

    const location = res.headers.get("location");
    const html = res.status === 200 ? "" : await res.text().catch(() => "");
    const nextHref =
      location ||
      html.match(/<a href="(https:\/\/(?:www\.)?tiktok\.com\/[^"]+)"/i)?.[1];

    if (!nextHref) {
      const fallbackId = readVideoId(new URL(res.url || current.href));
      if (fallbackId) {
        return {
          postId: fallbackId,
          pageUrl: `https://www.tiktok.com/@i/video/${fallbackId}`,
        };
      }
      break;
    }

    const next = new URL(nextHref, current);
    const postId = readVideoId(next);
    if (postId) {
      return { postId, pageUrl: `https://www.tiktok.com/@i/video/${postId}` };
    }
    if (PHOTO_ID_RE.test(next.pathname)) {
      throw new TikTokError("That post is a photo slideshow, not a video.");
    }
    current = next;
  }

  throw new TikTokError("Could not find a video ID in that TikTok link.");
}

function readVideoId(url: URL): string | null {
  const fromPath = url.pathname.match(VIDEO_ID_RE)?.[1];
  if (fromPath) return fromPath;
  const fromQuery = url.searchParams.get("video_id") || url.searchParams.get("item_id");
  if (fromQuery && /^\d{10,25}$/.test(fromQuery)) return fromQuery;
  return null;
}

async function fetchVideoItem(postId: string) {
  const attempts = [PAGE_UA, ALT_UA];
  let lastError: TikTokError | null = null;

  for (const ua of attempts) {
    try {
      const res = await fetch(`https://www.tiktok.com/@i/video/${postId}`, {
        headers: {
          "user-agent": ua,
          accept: "text/html,application/xhtml+xml",
          referer: "https://www.tiktok.com/",
        },
        signal: AbortSignal.timeout(20000),
      });

      const html = await res.text();
      const cookies = cookieHeader(res.headers);
      return { item: parseVideoItem(html), cookies };
    } catch (err) {
      if (err instanceof TikTokError) {
        if (err.statusCode < 500) throw err;
        lastError = err;
      } else if (err instanceof Error && err.name === "TimeoutError") {
        lastError = new TikTokError("TikTok took too long to answer.", 504);
      } else {
        lastError = new TikTokError("TikTok blocked the lookup. Try again in a bit.", 502);
      }
    }
  }

  throw lastError || new TikTokError("TikTok blocked the lookup. Try again in a bit.", 502);
}

function parseVideoItem(html: string) {
  const start = html.indexOf(UNIVERSAL_MARKER);
  if (start < 0) {
    throw new TikTokError("TikTok blocked the lookup. Try again in a bit.", 502);
  }

  const json = html.slice(start + UNIVERSAL_MARKER.length).split("</script>")[0];
  let data: Record<string, any>;
  try {
    data = JSON.parse(json);
  } catch {
    throw new TikTokError("TikTok returned a page this tool could not read.", 502);
  }

  const detail = data?.__DEFAULT_SCOPE__?.["webapp.video-detail"];
  if (!detail) {
    throw new TikTokError("TikTok blocked the lookup. Try again in a bit.", 502);
  }

  if (detail.statusMsg && detail.statusCode && detail.statusCode !== 0) {
    const msg = String(detail.statusMsg).toLowerCase();
    if (msg.includes("doesn't exist") || msg.includes("deleted") || msg.includes("unavailable")) {
      throw new TikTokError("TikTok says this post is gone.");
    }
    throw new TikTokError("TikTok would not serve that post.");
  }

  const item = detail.itemInfo?.itemStruct;
  if (!item) {
    throw new TikTokError("TikTok says this post is gone.");
  }
  if (item.isContentClassified) {
    throw new TikTokError("That post is age-gated. TikTok will not give the file without a login.");
  }
  if (item.imagePost && !item.video?.playAddr) {
    throw new TikTokError("That post is a photo slideshow, not a video.");
  }
  if (!item.author) {
    throw new TikTokError("TikTok returned an empty post.");
  }

  return item;
}

function pickPlayUrl(video: any): string | null {
  if (typeof video?.playAddr === "string" && video.playAddr.startsWith("http")) {
    return video.playAddr;
  }

  const bitrates = Array.isArray(video?.bitrateInfo) ? video.bitrateInfo : [];
  for (const bitrate of bitrates) {
    const url =
      bitrate?.PlayAddr?.UrlList?.[0] || bitrate?.playAddr?.url_list?.[0];
    if (typeof url === "string" && url.startsWith("http")) return url;
  }

  if (typeof video?.downloadAddr === "string" && video.downloadAddr.startsWith("http")) {
    return video.downloadAddr;
  }

  return null;
}

function pickCover(video: any): string {
  const candidates = [video?.cover, video?.originCover, video?.dynamicCover];
  for (const value of candidates) {
    if (typeof value === "string" && value.startsWith("http") && isAllowedCdnUrl(value)) {
      return value;
    }
  }
  return "";
}

function isAllowedCdnUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return CDN_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

function cookieHeader(headers: Headers): string {
  const list =
    typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  return list
    .map((cookie) => cookie.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

function sanitizeFilename(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned.slice(0, 40) || "user";
}
