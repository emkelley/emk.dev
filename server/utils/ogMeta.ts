export interface OgMeta {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  domain: string;
}

export function parseOgHtml(html: string, pageUrl: string): OgMeta {
  const origin = new URL(pageUrl);
  const title =
    attr(html, "og:title") ||
    attr(html, "twitter:title") ||
    tagText(html, "title") ||
    origin.hostname;

  const description =
    attr(html, "og:description") ||
    attr(html, "twitter:description") ||
    named(html, "description") ||
    "";

  const imageRaw =
    attr(html, "og:image") ||
    attr(html, "og:image:url") ||
    attr(html, "twitter:image") ||
    attr(html, "twitter:image:src") ||
    "";

  let image = "";
  if (imageRaw) {
    try {
      image = new URL(decodeHtml(imageRaw), pageUrl).href;
    } catch {
      image = "";
    }
  }

  const siteName = attr(html, "og:site_name") || origin.hostname.replace(/^www\./, "");

  return {
    url: pageUrl,
    title: decodeHtml(title).trim(),
    description: decodeHtml(description).trim(),
    image,
    siteName: decodeHtml(siteName).trim(),
    domain: origin.hostname.replace(/^www\./, ""),
  };
}

function attr(html: string, property: string): string {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,
      "i"
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

function named(html: string, name: string): string {
  return attr(html, name);
}

function tagText(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, "i"));
  return match?.[1] || "";
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
