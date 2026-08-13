export type RasterFormat = "png" | "webp" | "avif";

export interface SvgMeta {
  width: number;
  height: number;
  name: string;
}

const MAX_DIMENSION = 8192;
const supportCache: Partial<Record<RasterFormat, boolean>> = { png: true };

export function clampDimension(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_DIMENSION, Math.max(1, Math.round(value)));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function mimeForFormat(format: RasterFormat): string {
  return `image/${format}`;
}

export function baseNameFromFile(fileName: string): string {
  return fileName.replace(/\.svg$/i, "") || "export";
}

function parseLength(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.endsWith("%")) return null;

  const n = parseFloat(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;

  if (trimmed.endsWith("pt")) return n * (96 / 72);
  if (trimmed.endsWith("pc")) return n * 16;
  if (trimmed.endsWith("in")) return n * 96;
  if (trimmed.endsWith("cm")) return n * (96 / 2.54);
  if (trimmed.endsWith("mm")) return n * (96 / 25.4);
  return n;
}

function parseViewBox(value: string | null): { width: number; height: number } | null {
  if (!value) return null;
  const parts = value.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4) return null;
  const width = parts[2];
  const height = parts[3];
  if (!width || !height || width <= 0 || height <= 0) return null;
  return { width, height };
}

export function parseSvgDocument(svgText: string): SVGSVGElement {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("That file is not a valid SVG.");
  }

  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== "svg") {
    throw new Error("That file is not a valid SVG.");
  }

  return svg as unknown as SVGSVGElement;
}

export function parseSvgMeta(svgText: string, fileName: string): SvgMeta {
  const svg = parseSvgDocument(svgText);
  const fromAttr = {
    width: parseLength(svg.getAttribute("width")),
    height: parseLength(svg.getAttribute("height")),
  };
  const fromBox = parseViewBox(svg.getAttribute("viewBox"));

  const width = fromAttr.width ?? fromBox?.width ?? 512;
  const height = fromAttr.height ?? fromBox?.height ?? 512;

  return {
    width: clampDimension(width),
    height: clampDimension(height),
    name: baseNameFromFile(fileName),
  };
}

export function prepareSvg(svgText: string, width: number, height: number): string {
  const svg = parseSvgDocument(svgText);

  if (!svg.getAttribute("viewBox")) {
    const attrWidth = parseLength(svg.getAttribute("width"));
    const attrHeight = parseLength(svg.getAttribute("height"));
    if (attrWidth && attrHeight) {
      svg.setAttribute("viewBox", `0 0 ${attrWidth} ${attrHeight}`);
    }
  }

  if (!svg.getAttribute("xmlns")) {
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));

  return new XMLSerializer().serializeToString(svg);
}

export async function rasterizeSvg(
  svgText: string,
  width: number,
  height: number,
  background?: string
): Promise<HTMLCanvasElement> {
  const prepared = prepareSvg(svgText, width, height);
  const blob = new Blob([prepared], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create a drawing surface.");

    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  } catch (error) {
    if (error instanceof DOMException && error.name === "SecurityError") {
      throw new Error("This SVG references outside files, so it cannot be exported here.");
    }
    throw new Error("Could not draw that SVG. Check the file and try again.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: RasterFormat,
  quality: number
): Promise<Blob> {
  const mime = mimeForFormat(format);
  const q = format === "png" ? undefined : Math.min(1, Math.max(0.01, quality / 100));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || (format !== "png" && blob.type && blob.type !== mime)) {
          reject(new Error(`This browser cannot encode ${format.toUpperCase()}.`));
          return;
        }
        resolve(blob);
      },
      mime,
      q
    );
  });
}

export async function supportsFormat(format: RasterFormat): Promise<boolean> {
  if (supportCache[format] !== undefined) return supportCache[format]!;

  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    supportCache[format] = false;
    return false;
  }
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 2, 2);

  try {
    const blob = await encodeCanvas(canvas, format, 80);
    const ok = blob.type === mimeForFormat(format) || (format === "png" && blob.size > 0);
    supportCache[format] = ok;
    return ok;
  } catch {
    supportCache[format] = false;
    return false;
  }
}

export async function readSvgFile(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Keep the SVG under 8 MB.");
  }

  const isSvg =
    file.type === "image/svg+xml" ||
    file.name.toLowerCase().endsWith(".svg") ||
    file.type === "text/plain" ||
    file.type === "";

  if (!isSvg) {
    throw new Error("Drop an SVG file.");
  }

  const text = await file.text();
  if (!/<svg[\s>]/i.test(text)) {
    throw new Error("That file does not look like an SVG.");
  }

  return text;
}
