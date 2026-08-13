export async function encodeGif(
  frames: Array<{ data: Uint8ClampedArray; width: number; height: number }>,
  delayMs: number
): Promise<Blob> {
  if (!frames.length) throw new Error("No frames to encode.");

  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const gif = GIFEncoder();
  const first = frames[0];
  const firstRgba =
    first.data instanceof Uint8Array ? first.data : new Uint8Array(first.data);
  const palette = quantize(firstRgba, 256);

  frames.forEach((frame, i) => {
    const rgba =
      frame.data instanceof Uint8Array ? frame.data : new Uint8Array(frame.data);
    const index = applyPalette(rgba, palette);
    gif.writeFrame(index, frame.width, frame.height, {
      palette,
      delay: Math.max(20, delayMs),
      repeat: i === 0 ? 0 : undefined,
    });
  });

  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}
