<script setup lang="ts">
import { encodeCanvas, parseSvgMeta, rasterizeSvg, readSvgFile } from "@/utils/svgRaster";
import { downloadBlob, wait } from "@/utils/download";
import { containOnSquare, loadRasterFile } from "@/utils/imageFile";
import { packIco } from "@/utils/ico";
import { fileFromPaste, useFileDrop } from "@/composables/useFileDrop";

const PNG_SIZES = [16, 32, 180, 512] as const;
const ICO_SIZES = [16, 32, 48] as const;

const fileInput = ref<HTMLInputElement | null>(null);
const error = ref("");
const name = ref("");
const source = ref<CanvasImageSource | null>(null);
const svgText = ref("");
const transparent = ref(true);
const background = ref("#07111c");
const previewUrls = ref<Record<number, string>>({});
const building = ref(false);

const { dragging } = useFileDrop((file) => loadFile(file));
const hasFile = computed(() => Boolean(source.value || svgText.value));
const snippet = computed(() => {
  if (!name.value) return "";
  return `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
});

onMounted(() => window.addEventListener("paste", onPaste));
onBeforeUnmount(() => {
  window.removeEventListener("paste", onPaste);
  revokePreviews();
});

watch([transparent, background, source, svgText], () => {
  void refreshPreviews();
});

function safeBackground(): string | undefined {
  if (transparent.value) return undefined;
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(background.value)
    ? background.value
    : "#07111c";
}

function revokePreviews() {
  Object.values(previewUrls.value).forEach((url) => URL.revokeObjectURL(url));
  previewUrls.value = {};
}

async function canvasAt(size: number): Promise<HTMLCanvasElement> {
  const bg = safeBackground();
  if (svgText.value) {
    return rasterizeSvg(svgText.value, size, size, bg);
  }
  if (!source.value) throw new Error("No mark loaded.");
  return containOnSquare(source.value, size, bg);
}

async function refreshPreviews() {
  if (!hasFile.value) return;
  building.value = true;
  try {
    const next: Record<number, string> = {};
    for (const size of [16, 32, 512]) {
      const canvas = await canvasAt(size);
      const blob = await encodeCanvas(canvas, "png", 100);
      next[size] = URL.createObjectURL(blob);
    }
    revokePreviews();
    previewUrls.value = next;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not draw that mark.";
  } finally {
    building.value = false;
  }
}

async function loadFile(file: File) {
  error.value = "";
  try {
    if (file.name.toLowerCase().endsWith(".svg") || file.type === "image/svg+xml") {
      const text = await readSvgFile(file);
      const meta = parseSvgMeta(text, file.name);
      svgText.value = text;
      source.value = null;
      name.value = meta.name;
    } else {
      const raster = await loadRasterFile(file);
      svgText.value = "";
      source.value = raster.image;
      name.value = raster.name;
    }
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

function onPaste(event: ClipboardEvent) {
  const file = fileFromPaste(event);
  if (file) {
    event.preventDefault();
    void loadFile(file);
  }
}

function clearFile() {
  svgText.value = "";
  source.value = null;
  name.value = "";
  error.value = "";
  revokePreviews();
}

async function pngBytes(size: number): Promise<Uint8Array> {
  const canvas = await canvasAt(size);
  const blob = await encodeCanvas(canvas, "png", 100);
  return new Uint8Array(await blob.arrayBuffer());
}

async function downloadAll() {
  if (!hasFile.value) return;
  building.value = true;
  error.value = "";
  try {
    const icoParts = [];
    for (const size of ICO_SIZES) {
      icoParts.push({ size, bytes: await pngBytes(size) });
    }
    downloadBlob(packIco(icoParts), "favicon.ico");
    await wait(180);

    const named: Record<number, string> = {
      16: "favicon-16.png",
      32: "favicon-32.png",
      180: "apple-touch-icon.png",
      512: "icon-512.png",
    };
    for (const size of PNG_SIZES) {
      const canvas = await canvasAt(size);
      const blob = await encodeCanvas(canvas, "png", 100);
      downloadBlob(blob, named[size]);
      await wait(180);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not export those files.";
  } finally {
    building.value = false;
  }
}

async function copySnippet() {
  if (!snippet.value) return;
  await navigator.clipboard.writeText(snippet.value);
}
</script>

<template>
  <div class="bench">
    <div class="stage" :class="{ 'is-dragging': dragging, 'has-file': hasFile }">
      <input
        ref="fileInput"
        type="file"
        accept=".svg,image/svg+xml,image/png,image/jpeg,.png,.jpg,.jpeg"
        class="sr-only"
        @change="onFileChange"
      />

      <button v-if="!hasFile" type="button" class="drop" @click="fileInput?.click()">
        <span class="drop-kicker">Drop a mark</span>
        <span class="drop-copy">SVG is best. PNG works. Paste works too.</span>
      </button>

      <div v-else class="preview-wrap">
        <div class="checker favicons">
          <figure v-for="size in [16, 32, 512]" :key="size" class="mark">
            <img
              v-if="previewUrls[size]"
              :src="previewUrls[size]"
              :alt="`${size} pixel preview`"
              :class="size === 512 ? 'preview' : 'pixel'"
              :style="size === 512 ? undefined : { width: `${size * 4}px`, height: `${size * 4}px` }"
            />
            <figcaption>{{ size }}px</figcaption>
          </figure>
        </div>
        <div class="preview-meta">
          <span>{{ name || "Mark" }}</span>
          <span v-if="building" class="busy">Drawing</span>
        </div>
      </div>

      <div v-if="dragging" class="drop-veil" aria-hidden="true"><span>Drop to load</span></div>
    </div>

    <aside class="panel">
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <section class="group">
        <div class="group-head">
          <h2>File</h2>
          <button v-if="hasFile" type="button" class="text-btn" @click="clearFile">Replace</button>
        </div>
        <p v-if="name" class="file-name">{{ name }}</p>
        <button v-else type="button" class="ghost-btn" @click="fileInput?.click()">Choose SVG or PNG</button>
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
        <p class="hint">Apple's 180 touch icon looks better with a color behind it.</p>
      </section>

      <section class="group">
        <h2>HTML</h2>
        <pre class="snippet">{{ snippet || "Load a mark to get the tags." }}</pre>
        <button type="button" class="ghost-btn" :disabled="!snippet" @click="copySnippet">
          Copy tags
        </button>
      </section>

      <div class="actions">
        <button type="button" class="primary" :disabled="!hasFile || building" @click="downloadAll">
          Download ICO + PNGs
        </button>
        <p class="privacy">favicon.ico, 16, 32, apple-touch 180, and 512. The files stay on this page.</p>
      </div>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/css/tool-bench.scss";

.favicons {
  gap: 1.5rem;
  flex-wrap: wrap;
}

.mark {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
}

.mark figcaption {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.pixel {
  image-rendering: pixelated;
  background: #0a1624;
}

.snippet {
  margin: 0;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(142, 182, 232, 0.18);
  background: var(--void);
  color: var(--ink);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.68rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
