<script setup lang="ts">
import type { RasterFormat } from "@/utils/svgRaster";
import { encodeCanvas, formatBytes, supportsFormat } from "@/utils/svgRaster";
import { downloadBlob } from "@/utils/download";
import { canvasFromImage, fitWithin, loadRasterFile, type LoadedImage } from "@/utils/imageFile";
import { fileFromPaste, useFileDrop } from "@/composables/useFileDrop";

const SIZE_PRESETS = [800, 1280, 1920, 2048];
const FORMATS: RasterFormat[] = ["webp", "avif", "png"];

const fileInput = ref<HTMLInputElement | null>(null);
const error = ref("");
const loaded = ref<LoadedImage | null>(null);
const longest = ref(0);
const format = ref<RasterFormat>("webp");
const quality = ref(80);
const encoding = ref(false);
const output = ref<Blob | null>(null);
const previewUrl = ref("");
const supported = ref<Record<RasterFormat, boolean>>({
  png: true,
  webp: true,
  avif: true,
});

let encodeTimer: ReturnType<typeof setTimeout> | null = null;
let encodeGen = 0;

const { dragging } = useFileDrop((file) => loadFile(file));

const hasFile = computed(() => Boolean(loaded.value));
const qualityEnabled = computed(() => format.value !== "png");
const outputSize = computed(() => {
  if (!loaded.value) return { width: 0, height: 0 };
  if (!longest.value) {
    return { width: loaded.value.width, height: loaded.value.height };
  }
  return fitWithin(loaded.value.width, loaded.value.height, longest.value);
});
const outputLabel = computed(() => {
  if (!output.value || !loaded.value) return "";
  const { width, height } = outputSize.value;
  return `${formatBytes(loaded.value.bytes)} → ${formatBytes(output.value.size)} · ${width}×${height}`;
});
const fileName = computed(() => {
  if (!loaded.value) return "image";
  const { width, height } = outputSize.value;
  return `${loaded.value.name}-${width}x${height}.${format.value}`;
});

onMounted(async () => {
  const next = { ...supported.value };
  for (const item of FORMATS) next[item] = await supportsFormat(item);
  supported.value = next;
  if (!next[format.value]) format.value = next.webp ? "webp" : "png";
  window.addEventListener("paste", onPaste);
});

onBeforeUnmount(() => {
  window.removeEventListener("paste", onPaste);
  if (encodeTimer) clearTimeout(encodeTimer);
  revokePreview();
});

watch([longest, format, quality, loaded], () => queueEncode(120));

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
  if (!loaded.value) return;
  const gen = ++encodeGen;
  encoding.value = true;
  error.value = "";

  try {
    const { width, height } = outputSize.value;
    const canvas = canvasFromImage(loaded.value.image, width, height);
    const blob = await encodeCanvas(canvas, format.value, quality.value);
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
    const next = await loadRasterFile(file);
    loaded.value = next;
    longest.value = 0;
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

function onPaste(event: ClipboardEvent) {
  const file = fileFromPaste(event);
  if (file) {
    event.preventDefault();
    void loadFile(file);
  }
}

function clearFile() {
  encodeGen += 1;
  loaded.value = null;
  output.value = null;
  error.value = "";
  longest.value = 0;
  revokePreview();
}

function downloadCurrent() {
  if (!output.value) return;
  downloadBlob(output.value, fileName.value);
}
</script>

<template>
  <div class="bench">
    <div class="stage" :class="{ 'is-dragging': dragging, 'has-file': hasFile }">
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif,.png,.jpg,.jpeg,.webp,.gif"
        class="sr-only"
        @change="onFileChange"
      />

      <button v-if="!hasFile" type="button" class="drop" @click="fileInput?.click()">
        <span class="drop-kicker">Drop a raster</span>
        <span class="drop-copy">PNG, JPG, or WebP. Paste works too.</span>
      </button>

      <div v-else class="preview-wrap">
        <div class="checker">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            :alt="`${loaded?.name} preview`"
            class="preview"
            :style="{ aspectRatio: `${outputSize.width} / ${outputSize.height}` }"
          />
          <div v-else class="preview-meta" style="border: 0">Encoding…</div>
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
          <button v-if="hasFile" type="button" class="text-btn" @click="clearFile">Replace</button>
        </div>
        <p v-if="loaded" class="file-name">
          {{ loaded.name }} · {{ loaded.width }}×{{ loaded.height }} · {{ formatBytes(loaded.bytes) }}
        </p>
        <button v-else type="button" class="ghost-btn" @click="fileInput?.click()">Choose image</button>
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
            @click="format = item"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <section class="group">
        <div class="group-head">
          <h2>Longest edge</h2>
          <button type="button" class="text-btn" :disabled="!hasFile" @click="longest = 0">
            Original
          </button>
        </div>
        <div class="chips" aria-label="Longest edge">
          <button
            v-for="size in SIZE_PRESETS"
            :key="size"
            type="button"
            class="chip"
            :class="{ 'is-on': longest === size }"
            :disabled="!hasFile"
            @click="longest = size"
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
        />
        <p class="hint">
          {{
            qualityEnabled
              ? "Lower quality makes a smaller file. Watch the preview for mush."
              : "PNG stays lossless. Switch to WebP or AVIF to squeeze it."
          }}
        </p>
      </section>

      <div class="actions">
        <button type="button" class="primary" :disabled="!output || encoding" @click="downloadCurrent">
          Download {{ format.toUpperCase() }}
        </button>
        <p class="privacy">Runs in your browser. The file never leaves this page.</p>
      </div>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/css/tool-bench.scss";
</style>
