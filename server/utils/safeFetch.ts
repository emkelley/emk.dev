import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const BLOCKED_HOSTS = new Set(["localhost", "0.0.0.0", "::1"]);

export class SafeFetchError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "SafeFetchError";
    this.statusCode = statusCode;
  }
}

export async function assertPublicHttps(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SafeFetchError("That is not a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new SafeFetchError("Only http(s) links work here.");
  }
  if (url.username || url.password) {
    throw new SafeFetchError("That URL is not allowed.");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new SafeFetchError("That host is not allowed.");
  }

  const addresses = isIP(host) ? [host] : await resolveHost(host);
  if (!addresses.length || addresses.some(isPrivateAddress)) {
    throw new SafeFetchError("That host is not allowed.");
  }

  return url;
}

export async function fetchPublic(
  raw: string,
  options: { timeoutMs: number; maxBytes: number; accept: string }
): Promise<{ url: string; contentType: string; body: Uint8Array }> {
  let current = await assertPublicHttps(raw);

  for (let hop = 0; hop < 5; hop++) {
    const res = await fetch(current.href, {
      method: "GET",
      redirect: "manual",
      headers: {
        accept: options.accept,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(options.timeoutMs),
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new SafeFetchError("The page redirected nowhere.", 502);
      current = await assertPublicHttps(new URL(location, current).href);
      continue;
    }

    if (!res.ok) {
      throw new SafeFetchError("Could not fetch that URL.", 502);
    }

    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim();
    const buffer = new Uint8Array(await readLimited(res, options.maxBytes));
    return { url: current.href, contentType, body: buffer };
  }

  throw new SafeFetchError("Too many redirects.", 502);
}

async function resolveHost(host: string): Promise<string[]> {
  try {
    const records = await lookup(host, { all: true });
    return records.map((record) => record.address);
  } catch {
    throw new SafeFetchError("Could not resolve that host.", 502);
  }
}

async function readLimited(res: Response, maxBytes: number): Promise<ArrayBuffer> {
  const length = Number(res.headers.get("content-length") || 0);
  if (length > maxBytes) {
    throw new SafeFetchError("That response is too large.", 502);
  }
  if (!res.body) return new ArrayBuffer(0);

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      reader.cancel();
      throw new SafeFetchError("That response is too large.", 502);
    }
    chunks.push(value);
  }

  const out = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out.buffer;
}

function isPrivateAddress(ip: string): boolean {
  if (ip.includes(":")) {
    const normalized = ip.toLowerCase();
    if (normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (normalized.startsWith("fe80")) return true;
    if (normalized.startsWith("::ffff:")) {
      return isPrivateAddress(normalized.slice(7));
    }
    return false;
  }

  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n))) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}
