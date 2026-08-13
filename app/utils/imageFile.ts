import { clampDimension } from "@/utils/svgRaster";
import { baseName } from "@/utils/download";

const MAX_BYTES = 25 * 1024 * 1024;
const RASTER_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
]);

export interface LoadedImage {
  image: HTMLImageElement;
  name: string;
  width: number;
  height: number;
  bytes: number;
  type: string;
}

export async function loadRasterFile(file: File): Promise<LoadedImage> {
  if (file.size > MAX_BYTES) {
    throw new Error("Keep the image under 25 MB.");
  }

  const lower = file.name.toLowerCase();
  if (lower.endsWith(".svg") || file.type === "image/svg+xml") {
    throw new Error("SVG belongs in SVG Export.");
  }

  const okType =
    RASTER_TYPES.has(file.type) ||
    /\.(png|jpe?g|webp|gif|avif|bmp)$/i.test(file.name);
  if (!okType) {
    throw new Error("Drop a PNG, JPG, WebP, or GIF.");
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return {
      image,
      name: baseName(file.name),
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      bytes: file.size,
      type: file.type || "image/png",
    };
  } catch {
    throw new Error("Could not read that image.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function canvasFromImage(
  image: CanvasImageSource,
  width: number,
  height: number,
  background?: string
): HTMLCanvasElement {
  const w = clampDimension(width);
  const h = clampDimension(height);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create a drawing surface.");

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.clearRect(0, 0, w, h);
  }

  ctx.drawImage(image, 0, 0, w, h);
  return canvas;
}

export function fitWithin(
  width: number,
  height: number,
  longest: number
): { width: number; height: number } {
  const max = Math.max(width, height);
  if (max <= longest) {
    return { width: clampDimension(width), height: clampDimension(height) };
  }
  const scale = longest / max;
  return {
    width: clampDimension(width * scale),
    height: clampDimension(height * scale),
  };
}

export function containOnSquare(
  image: CanvasImageSource,
  size: number,
  background?: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create a drawing surface.");

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  const sourceWidth =
    "naturalWidth" in image && typeof image.naturalWidth === "number" && image.naturalWidth
      ? image.naturalWidth
      : (image as HTMLImageElement).width || size;
  const sourceHeight =
    "naturalHeight" in image && typeof image.naturalHeight === "number" && image.naturalHeight
      ? image.naturalHeight
      : (image as HTMLImageElement).height || size;

  const scale = Math.min(size / sourceWidth, size / sourceHeight);
  const w = sourceWidth * scale;
  const h = sourceHeight * scale;
  ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
}
