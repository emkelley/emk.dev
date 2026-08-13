export function packIco(pngs: Array<{ size: number; bytes: Uint8Array }>): Blob {
  const count = pngs.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = pngs.map((png) => {
    const entry = { size: png.size, bytes: png.bytes, offset };
    offset += png.bytes.length;
    return entry;
  });

  const out = new Uint8Array(offset);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, count, true);

  entries.forEach((entry, i) => {
    const at = 6 + i * 16;
    out[at] = entry.size >= 256 ? 0 : entry.size;
    out[at + 1] = entry.size >= 256 ? 0 : entry.size;
    out[at + 2] = 0;
    out[at + 3] = 0;
    view.setUint16(at + 4, 1, true);
    view.setUint16(at + 6, 32, true);
    view.setUint32(at + 8, entry.bytes.length, true);
    view.setUint32(at + 12, entry.offset, true);
    out.set(entry.bytes, entry.offset);
  });

  return new Blob([out], { type: "image/x-icon" });
}
