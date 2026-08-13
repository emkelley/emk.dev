<script setup lang="ts">
import type { RasterFormat, SvgMeta } from "@/utils/svgRaster";

const SIZE_PRESETS = [16, 24, 32, 48, 64, 128, 256, 512, 1024, 2048];
const SCALE_PRESETS = [1, 2, 3] as const;
const FORMATS: RasterFormat[] = ["png", "webp", "avif"];

const fileInput = ref<HTMLInputElement | null>(null);
const dragging = ref(false);
const error = ref("");
const svgText = ref("");
const meta = ref<SvgMeta | null>(null);
const width = ref(512);
const height = ref(512);
const lockAspect = ref(true);
const format = ref<RasterFormat>("png");
const quality = ref(80);
const transparent = ref(true);
const background = ref("#07111c");
const supported = ref<Record<RasterFormat, boolean>>({
  png: true,
  webp: true,
  avif: true,
});
const encoding = ref(false);
const output = ref<Blob | null>(null);
const previewUrl = ref("");
const dragDepth = ref(0);

let rasterCanvas: HTMLCanvasElement | null = null;
let encodeTimer: ReturnType<typeof setTimeout> | null = null;
let encodeGen = 0;

const aspect = computed(() => {
  if (!meta.value) return 1;
  return meta.value.width / meta.value.height;
});

const qualityEnabled = computed(() => format.value !== "png");
const hasFile = computed(() => Boolean(svgText.value && meta.value));
const outputLabel = computed(() => {
  if (!output.value || !meta.value) return "";
  return `${formatBytes(output.value.size)} · ${width.value}×${height.value}`;
});
const fileName = computed(() => {
  if (!meta.value) return "export";
  return `${meta.value.name}-${width.value}x${height.value}.${format.value}`;
});
const activePreset = computed(() => {
  const longest = Math.max(width.value, height.value);
  return SIZE_PRESETS.includes(longest) ? longest : null;
});
const activeScale = computed(() => {
  if (!meta.value) return null;
  const sx = width.value / meta.value.width;
  const sy = height.value / meta.value.height;
  if (Math.abs(sx - sy) > 0.02) return null;
  const rounded = Math.round(sx);
  return SCALE_PRESETS.includes(rounded as 1 | 2 | 3) && Math.abs(sx - rounded) < 0.02
    ? rounded
    : null;
});

onMounted(async () => {
  const next = { ...supported.value };
  for (const item of FORMATS) {
    next[item] = await supportsFormat(item);
  }
  supported.value = next;
  if (!next[format.value]) {
    format.value = next.webp ? "webp" : "png";
  }

  window.addEventListener("paste", onPaste);
  window.addEventListener("dragenter", onWindowDragEnter);
  window.addEventListener("dragover", onWindowDragOver);
  window.addEventListener("dragleave", onWindowDragLeave);
  window.addEventListener("drop", onWindowDrop);
});

onBeforeUnmount(() => {
  window.removeEventListener("paste", onPaste);
  window.removeEventListener("dragenter", onWindowDragEnter);
  window.removeEventListener("dragover", onWindowDragOver);
  window.removeEventListener("dragleave", onWindowDragLeave);
  window.removeEventListener("drop", onWindowDrop);
  if (encodeTimer) clearTimeout(encodeTimer);
  revokePreview();
});

watch([width, height, transparent, background, svgText], () => {
  rasterCanvas = null;
  queueEncode(40);
});

watch([format, quality], () => {
  queueEncode(160);
});

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
  }
}

function queueEncode(delay: number) {
  if (!hasFile.value) return;
  if (encodeTimer) clearTimeout(encodeTimer);
  encodeTimer = setTimeout(() => {
    void runEncode();
  }, delay);
}

async function runEncode() {
  if (!svgText.value) return;
  const gen = ++encodeGen;
  encoding.value = true;
  error.value = "";

  try {
    if (!rasterCanvas) {
      rasterCanvas = await rasterizeSvg(
        svgText.value,
        width.value,
        height.value,
        transparent.value ? undefined : safeBackground()
      );
    }
    if (gen !== encodeGen) return;

    const blob = await encodeCanvas(rasterCanvas, format.value, quality.value);
    if (gen !== encodeGen) return;

    revokePreview();
    output.value = blob;
    previewUrl.value = URL.createObjectURL(blob);
  } catch (err) {
    if (gen !== encodeGen) return;
    output.value = null;
    revokePreview();
    error.value = err instanceof Error ? err.message : "Could not encode that image.";
  } finally {
    if (gen === encodeGen) encoding.value = false;
  }
}

async function loadFile(file: File) {
  error.value = "";
  try {
    const text = await readSvgFile(file);
    const nextMeta = parseSvgMeta(text, file.name);
    svgText.value = text;
    meta.value = nextMeta;
    width.value = nextMeta.width;
    height.value = nextMeta.height;
    rasterCanvas = null;
    output.value = null;
    revokePreview();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not read that file.";
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) void loadFile(file);
  input.value = "";
}

function onWindowDragEnter(event: DragEvent) {
  if (!event.dataTransfer?.types.includes("Files")) return;
  dragDepth.value += 1;
  dragging.value = true;
}

function onWindowDragOver(event: DragEvent) {
  if (!event.dataTransfer?.types.includes("Files")) return;
  event.preventDefault();
}

function onWindowDragLeave() {
  dragDepth.value = Math.max(0, dragDepth.value - 1);
  if (dragDepth.value === 0) dragging.value = false;
}

function onWindowDrop(event: DragEvent) {
  event.preventDefault();
  dragging.value = false;
  dragDepth.value = 0;
  const file = event.dataTransfer?.files?.[0];
  if (file) void loadFile(file);
}

function safeBackground(): string {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(background.value)
    ? background.value
    : "#07111c";
}

async function onPaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) {
        event.preventDefault();
        await loadFile(file);
        return;
      }
    }
  }

  const text = event.clipboardData?.getData("text/plain");
  if (text && /<svg[\s>]/i.test(text)) {
    event.preventDefault();
    await loadFile(new File([text], "pasted.svg", { type: "image/svg+xml" }));
  }
}

function setWidth(next: number) {
  width.value = clampDimension(next);
  if (lockAspect.value) {
    height.value = clampDimension(width.value / aspect.value);
  }
}

function setHeight(next: number) {
  height.value = clampDimension(next);
  if (lockAspect.value) {
    width.value = clampDimension(height.value * aspect.value);
  }
}

function applyPreset(size: number) {
  if (!meta.value) return;
  if (meta.value.width >= meta.value.height) {
    setWidth(size);
  } else {
    setHeight(size);
  }
}

function applyScale(scale: number) {
  if (!meta.value) return;
  width.value = clampDimension(meta.value.width * scale);
  height.value = clampDimension(meta.value.height * scale);
}

function resetSize() {
  if (!meta.value) return;
  width.value = meta.value.width;
  height.value = meta.value.height;
}

function clearFile() {
  svgText.value = "";
  meta.value = null;
  output.value = null;
  rasterCanvas = null;
  error.value = "";
  revokePreview();
}

function chooseFormat(next: RasterFormat) {
  if (!supported.value[next]) return;
  format.value = next;
}

function downloadCurrent() {
  if (!output.value) return;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(output.value);
  link.download = fileName.value;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function downloadScales() {
  if (!svgText.value || !meta.value) return;
  encoding.value = true;
  error.value = "";

  try {
    for (const scale of SCALE_PRESETS) {
      const w = clampDimension(meta.value.width * scale);
      const h = clampDimension(meta.value.height * scale);
      const canvas = await rasterizeSvg(
        svgText.value,
        w,
        h,
        transparent.value ? undefined : safeBackground()
      );
      const blob = await encodeCanvas(canvas, format.value, quality.value);
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${meta.value.name}-${w}x${h}.${format.value}`;
      link.click();
      URL.revokeObjectURL(url);
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not export those sizes.";
  } finally {
    encoding.value = false;
  }
}
</script>

<template>
  <div class="bench">
    <div
      class="stage"
      :class="{ 'is-dragging': dragging, 'has-file': hasFile }"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".svg,image/svg+xml"
        class="sr-only"
        @change="onFileChange"
      />

      <button
        v-if="!hasFile"
        type="button"
        class="drop"
        @click="fileInput?.click()"
      >
        <span class="drop-kicker">Drop an SVG</span>
        <span class="drop-copy">or click to browse. Paste works too.</span>
      </button>

      <div v-else class="preview-wrap">
        <div class="checker">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            :alt="`${meta?.name} preview`"
            class="preview"
            :style="{ aspectRatio: `${width} / ${height}` }"
          />
          <div v-else class="preview-wait">Drawing…</div>
        </div>
        <div class="preview-meta">
          <span>{{ outputLabel || "Preparing…" }}</span>
          <span v-if="encoding" class="busy">Encoding</span>
        </div>
      </div>

      <div v-if="dragging" class="drop-veil" aria-hidden="true">
        <span>Drop to load</span>
      </div>
    </div>

    <aside class="panel">
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <section class="group">
        <div class="group-head">
          <h2>File</h2>
          <button v-if="hasFile" type="button" class="text-btn" @click="clearFile">
            Replace
          </button>
        </div>
        <p v-if="meta" class="file-name">{{ meta.name }}.svg · {{ meta.width }}×{{ meta.height }}</p>
        <button v-else type="button" class="ghost-btn" @click="fileInput?.click()">
          Choose SVG
        </button>
      </section>

      <section class="group">
        <h2>Format</h2>
        <div class="seg" role="tablist" aria-label="Output format">
          <button
            v-for="item in FORMATS"
            :key="item"
            type="button"
            role="tab"
            class="seg-btn"
            :class="{ 'is-on': format === item }"
            :disabled="!supported[item]"
            :aria-selected="format === item"
            :title="supported[item] ? undefined : `This browser cannot encode ${item.toUpperCase()}`"
            @click="chooseFormat(item)"
          >
            {{ item }}
          </button>
        </div>
        <p v-if="!supported.avif || !supported.webp" class="hint">
          {{ !supported.avif ? "AVIF encoding is not available in this browser." : "" }}
          {{ !supported.webp ? "WebP encoding is not available in this browser." : "" }}
        </p>
      </section>

      <section class="group">
        <div class="group-head">
          <h2>Size</h2>
          <button type="button" class="text-btn" :disabled="!hasFile" @click="resetSize">
            Original
          </button>
        </div>

        <div class="dims">
          <label class="field">
            <span>W</span>
            <input
              :value="width"
              type="number"
              min="1"
              max="8192"
              inputmode="numeric"
              :disabled="!hasFile"
              @change="setWidth(Number(($event.target as HTMLInputElement).value))"
            />
          </label>
          <button
            type="button"
            class="lock"
            :class="{ 'is-on': lockAspect }"
            :aria-pressed="lockAspect"
            :disabled="!hasFile"
            :aria-label="lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'"
            @click="lockAspect = !lockAspect"
          >
            <Icon :name="lockAspect ? 'ion:link' : 'ion:unlink-outline'" class="text-lg" />
          </button>
          <label class="field">
            <span>H</span>
            <input
              :value="height"
              type="number"
              min="1"
              max="8192"
              inputmode="numeric"
              :disabled="!hasFile"
              @change="setHeight(Number(($event.target as HTMLInputElement).value))"
            />
          </label>
        </div>

        <div class="chips" aria-label="Scale">
          <button
            v-for="scale in SCALE_PRESETS"
            :key="`scale-${scale}`"
            type="button"
            class="chip"
            :class="{ 'is-on': activeScale === scale }"
            :disabled="!hasFile"
            @click="applyScale(scale)"
          >
            {{ scale }}×
          </button>
        </div>

        <div class="chips" aria-label="Longest edge">
          <button
            v-for="size in SIZE_PRESETS"
            :key="size"
            type="button"
            class="chip"
            :class="{ 'is-on': activePreset === size }"
            :disabled="!hasFile"
            @click="applyPreset(size)"
          >
            {{ size }}
          </button>
        </div>
      </section>

      <section class="group">
        <div class="group-head">
          <h2>Quality</h2>
          <span class="readout">{{ qualityEnabled ? `${quality}%` : "Lossless" }}</span>
        </div>
        <input
          v-model.number="quality"
          class="slider"
          type="range"
          min="1"
          max="100"
          step="1"
          :disabled="!hasFile || !qualityEnabled"
          :aria-valuetext="qualityEnabled ? `${quality} percent` : 'Lossless PNG'"
        />
        <p class="hint">
          {{
            qualityEnabled
              ? "Lower quality makes a smaller file. Watch the preview for mush."
              : "PNG stays lossless. Switch to WebP or AVIF to squeeze it."
          }}
        </p>
      </section>

      <section class="group">
        <h2>Background</h2>
        <div class="seg" role="tablist" aria-label="Background">
          <button
            type="button"
            class="seg-btn"
            :class="{ 'is-on': transparent }"
            :disabled="!hasFile"
            @click="transparent = true"
          >
            Clear
          </button>
          <button
            type="button"
            class="seg-btn"
            :class="{ 'is-on': !transparent }"
            :disabled="!hasFile"
            @click="transparent = false"
          >
            Color
          </button>
        </div>
        <label v-if="!transparent" class="swatch">
          <input v-model="background" type="color" :disabled="!hasFile" />
          <input
            v-model="background"
            type="text"
            spellcheck="false"
            maxlength="7"
            :disabled="!hasFile"
            aria-label="Background hex"
          />
        </label>
      </section>

      <div class="actions">
        <button
          type="button"
          class="primary"
          :disabled="!output || encoding"
          @click="downloadCurrent"
        >
          Download {{ format.toUpperCase() }}
        </button>
        <button
          type="button"
          class="ghost-btn"
          :disabled="!hasFile || encoding"
          @click="downloadScales"
        >
          Download 1× 2× 3×
        </button>
        <p class="privacy">Runs in your browser. The file never leaves this page.</p>
      </div>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
.bench {
  display: grid;
  gap: 1.75rem;
}

@media (min-width: 960px) {
  .bench {
    grid-template-columns: minmax(0, 1.2fr) minmax(17rem, 0.8fr);
    align-items: start;
    gap: 2.5rem;
  }
}

.stage {
  position: relative;
  min-height: 22rem;
  border: 1px solid rgba(142, 182, 232, 0.2);
  background: var(--deep);
  overflow: hidden;
}

.stage.has-file {
  min-height: 24rem;
}

.stage.is-dragging {
  border-color: var(--cyan);
}

.drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  min-height: 22rem;
  padding: 2rem;
  color: var(--ink);
  transition: transform 140ms var(--ease-out), color 120ms ease;
}

.drop:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .drop:hover .drop-kicker {
    color: var(--cyan);
  }
}

.drop-kicker {
  font-family: "Saira Extra Condensed", sans-serif;
  font-size: clamp(2.4rem, 6vw, 3.4rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 0.9;
  transition: color 180ms var(--ease-out);
}

.drop-copy {
  color: var(--muted);
  font-size: 0.95rem;
}

.drop-veil {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 8, 16, 0.72);
  color: var(--cyan);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  pointer-events: none;
}

.preview-wrap {
  display: flex;
  flex-direction: column;
  min-height: 24rem;
}

.checker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: #0a1624;
  background-image:
    linear-gradient(45deg, #132033 25%, transparent 25%),
    linear-gradient(-45deg, #132033 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #132033 75%),
    linear-gradient(-45deg, transparent 75%, #132033 75%);
  background-size: 18px 18px;
  background-position: 0 0, 0 9px, 9px -9px, -9px 0;
}

.preview {
  max-width: 100%;
  max-height: 28rem;
  width: auto;
  height: auto;
  object-fit: contain;
  image-rendering: auto;
}

.preview-wait,
.preview-meta {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border-top: 1px solid rgba(142, 182, 232, 0.16);
}

.busy {
  color: var(--cyan);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-top: 1.15rem;
  border-top: 1px solid rgba(142, 182, 232, 0.16);
}

.group:first-of-type {
  padding-top: 0;
  border-top: 0;
}

.group h2,
.group-head h2 {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.file-name {
  margin: 0;
  color: var(--ink);
  font-size: 0.95rem;
  word-break: break-word;
}

.error {
  margin: 0;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(249, 126, 114, 0.45);
  color: var(--coral);
  font-size: 0.92rem;
}

.hint,
.privacy {
  margin: 0;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.45;
}

.readout {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  color: var(--cyan);
}

.seg {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  border: 1px solid rgba(142, 182, 232, 0.22);
}

.seg-btn,
.chip,
.ghost-btn,
.primary,
.text-btn,
.lock {
  transition: color 120ms ease, background-color 120ms ease, border-color 120ms ease,
    transform 140ms var(--ease-out);
}

.seg-btn,
.chip,
.ghost-btn,
.primary,
.lock {
  font-family: "IBM Plex Mono", monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.seg-btn {
  padding: 0.55rem 0.4rem;
  font-size: 0.68rem;
  color: var(--muted);
}

.seg-btn + .seg-btn {
  border-left: 1px solid rgba(142, 182, 232, 0.22);
}

.seg-btn.is-on {
  color: var(--deep);
  background: var(--cyan);
}

.seg-btn:disabled,
.chip:disabled,
.ghost-btn:disabled,
.primary:disabled,
.lock:disabled,
.text-btn:disabled,
.slider:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dims {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field span {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.field input,
.swatch input[type="text"] {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid rgba(142, 182, 232, 0.22);
  background: var(--deep);
  color: var(--ink);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.85rem;
}

.lock {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border: 1px solid rgba(142, 182, 232, 0.22);
  color: var(--muted);
  margin-bottom: 1px;
}

.lock.is-on {
  color: var(--cyan);
  border-color: var(--cyan);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  padding: 0.28rem 0.5rem;
  border: 1px solid rgba(142, 182, 232, 0.2);
  color: var(--muted);
  font-size: 0.62rem;
}

.chip.is-on {
  color: var(--cyan);
  border-color: var(--cyan);
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 2px;
  background: rgba(142, 182, 232, 0.28);
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--cyan);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 0;
  border-radius: 50%;
  background: var(--cyan);
  cursor: pointer;
}

.swatch {
  display: grid;
  grid-template-columns: 2.6rem 1fr;
  gap: 0.5rem;
}

.swatch input[type="color"] {
  width: 100%;
  height: 2.4rem;
  padding: 0;
  border: 1px solid rgba(142, 182, 232, 0.22);
  background: transparent;
  cursor: pointer;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-top: 0.4rem;
}

.primary,
.ghost-btn {
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 0.72rem;
}

.primary {
  background: var(--cyan);
  color: var(--deep);
}

.ghost-btn {
  border: 1px solid rgba(142, 182, 232, 0.28);
  color: var(--ink);
}

.text-btn {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cyan);
}

.primary:active,
.ghost-btn:active,
.chip:active,
.seg-btn:active,
.lock:active,
.text-btn:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .chip:hover:not(:disabled),
  .ghost-btn:hover:not(:disabled),
  .lock:hover:not(:disabled),
  .text-btn:hover:not(:disabled) {
    color: var(--ink);
    border-color: var(--ink);
  }

  .text-btn:hover:not(:disabled) {
    border-color: transparent;
    color: var(--ink);
  }

  .primary:hover:not(:disabled) {
    background: #4ee0d8;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .drop,
  .seg-btn,
  .chip,
  .ghost-btn,
  .primary,
  .text-btn,
  .lock {
    transition: color 120ms ease, background-color 120ms ease, border-color 120ms ease;
  }

  .drop:active,
  .primary:active,
  .ghost-btn:active,
  .chip:active,
  .seg-btn:active,
  .lock:active,
  .text-btn:active {
    transform: none;
  }
}
</style>
