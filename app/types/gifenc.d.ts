declare module "gifenc" {
  export function GIFEncoder(options?: { auto?: boolean }): {
    writeFrame: (
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: Uint8Array | number[][];
        delay?: number;
        repeat?: number;
      }
    ) => void;
    finish: () => void;
    bytes: () => Uint8Array;
  };
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: Record<string, unknown>
  ): number[][];
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][] | Uint8Array,
    format?: string
  ): Uint8Array;
}
