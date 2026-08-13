export interface Swatch {
  hex: string;
  rgb: [number, number, number];
  count: number;
}

type Pixel = [number, number, number];

export function extractPalette(
  imageData: ImageData,
  count = 8
): Swatch[] {
  const wanted = Math.min(8, Math.max(5, count));
  const sampled = samplePixels(imageData.data, imageData.width * imageData.height);
  if (!sampled.length) return [];

  const boxes = medianCut(sampled, wanted);
  const swatches = boxes
    .map((box) => average(box))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  return dedupe(swatches, 18).slice(0, wanted);
}

function samplePixels(data: Uint8ClampedArray, pixelCount: number): Pixel[] {
  const stride = pixelCount > 40000 ? 4 : pixelCount > 12000 ? 2 : 1;
  const pixels: Pixel[] = [];
  for (let i = 0; i < data.length; i += 4 * stride) {
    if (data[i + 3] < 140) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  return pixels;
}

function medianCut(pixels: Pixel[], count: number): Pixel[][] {
  const boxes: Pixel[][] = [pixels];
  while (boxes.length < count) {
    let widest = 0;
    let widestRange = -1;
    for (let i = 0; i < boxes.length; i++) {
      const range = channelRange(boxes[i]).range;
      if (range > widestRange) {
        widestRange = range;
        widest = i;
      }
    }
    if (widestRange <= 0) break;
    const box = boxes[widest];
    const channel = channelRange(box).channel;
    box.sort((a, b) => a[channel] - b[channel]);
    const mid = Math.max(1, Math.floor(box.length / 2));
    boxes.splice(widest, 1, box.slice(0, mid), box.slice(mid));
  }
  return boxes;
}

function channelRange(pixels: Pixel[]): { channel: 0 | 1 | 2; range: number } {
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
  for (const [r, g, b] of pixels) {
    if (r < rMin) rMin = r;
    if (r > rMax) rMax = r;
    if (g < gMin) gMin = g;
    if (g > gMax) gMax = g;
    if (b < bMin) bMin = b;
    if (b > bMax) bMax = b;
  }
  const ranges: Array<{ channel: 0 | 1 | 2; range: number }> = [
    { channel: 0, range: rMax - rMin },
    { channel: 1, range: gMax - gMin },
    { channel: 2, range: bMax - bMin },
  ];
  ranges.sort((a, b) => b.range - a.range);
  return ranges[0];
}

function average(pixels: Pixel[]): Swatch {
  if (!pixels.length) return { hex: "#000000", rgb: [0, 0, 0], count: 0 };
  let r = 0, g = 0, b = 0;
  for (const pixel of pixels) {
    r += pixel[0];
    g += pixel[1];
    b += pixel[2];
  }
  const n = pixels.length;
  const rgb: [number, number, number] = [
    Math.round(r / n),
    Math.round(g / n),
    Math.round(b / n),
  ];
  return { hex: toHex(rgb), rgb, count: n };
}

function dedupe(swatches: Swatch[], minDist: number): Swatch[] {
  const kept: Swatch[] = [];
  for (const swatch of swatches) {
    const close = kept.find((other) => distance(swatch.rgb, other.rgb) < minDist);
    if (close) {
      close.count += swatch.count;
      continue;
    }
    kept.push({ ...swatch });
  }
  return kept.sort((a, b) => b.count - a.count);
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function readableOn(hex: string, background: string): boolean {
  return contrast(hex, background) >= 4.5;
}

function contrast(a: string, b: string): number {
  const la = relativeLuminance(hexToRgb(a));
  const lb = relativeLuminance(hexToRgb(b));
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
