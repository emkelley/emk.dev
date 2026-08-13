<script setup lang="ts">
import { canvasFromImage, loadRasterFile, type LoadedImage } from "@/utils/imageFile";
import { extractPalette, readableOn, type Swatch } from "@/utils/palette";
import { fileFromPaste, useFileDrop } from "@/composables/useFileDrop";

const fileInput = ref<HTMLInputElement | null>(null);
const error = ref("");
const loaded = ref<LoadedImage | null>(null);
const previewUrl = ref("");
const swatches = ref<Swatch[]>([]);
const copied = ref("");
let copyTimer: ReturnType<typeof setTimeout> | null = null;

const { dragging } = useFileDrop((file) => loadFile(file));
const hasFile = computed(() => Boolean(loaded.value));

onMounted(() => window.addEventListener("paste", onPaste));
onBeforeUnmount(() => {
  window.removeEventListener("paste", onPaste);
  if (copyTimer) clearTimeout(copyTimer);
  revokePreview();
});

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
  }
}

async function loadFile(file: File) {
  error.value = "";
  try {
    const next = await loadRasterFile(file);
    const url = URL.createObjectURL(file);
    revokePreview();
    loaded.value = next;
    previewUrl.value = url;

    const sample = canvasFromImage(
      next.image,
      Math.min(400, next.width),
      Math.min(400, Math.round((next.height / next.width) * Math.min(400, next.width)))
    );
    const ctx = sample.getContext("2d");
    if (!ctx) throw new Error("Could not read pixels.");
    swatches.value = extractPalette(ctx.getImageData(0, 0, sample.width, sample.height), 8);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not read that image.";
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
  loaded.value = null;
  swatches.value = [];
  error.value = "";
  copied.value = "";
  revokePreview();
}

async function copyHex(hex: string) {
  await navigator.clipboard.writeText(hex);
  copied.value = hex;
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copied.value = "";
  }, 900);
}
</script>

<template>
  <div class="bench">
    <div class="stage" :class="{ 'is-dragging': dragging, 'has-file': hasFile }">
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
        class="sr-only"
        @change="onFileChange"
      />

      <button v-if="!hasFile" type="button" class="drop" @click="fileInput?.click()">
        <span class="drop-kicker">Drop a frame</span>
        <span class="drop-copy">A screenshot, a still, a mood. Paste works too.</span>
      </button>

      <div v-else class="preview-wrap">
        <div class="checker">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            :alt="loaded?.name"
            class="preview"
          />
        </div>
        <div class="preview-meta">
          <span v-if="loaded">{{ loaded.name }} · {{ loaded.width }}×{{ loaded.height }}</span>
          <span class="busy">{{ swatches.length }} colors</span>
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
        <p v-if="loaded" class="file-name">{{ loaded.name }}</p>
        <button v-else type="button" class="ghost-btn" @click="fileInput?.click()">Choose image</button>
      </section>

      <section class="group">
        <h2>Tokens</h2>
        <div v-if="swatches.length" class="swatches">
          <button
            v-for="swatch in swatches"
            :key="swatch.hex"
            type="button"
            class="token"
            :style="{ background: swatch.hex, color: readableOn('#d5deef', swatch.hex) ? '#d5deef' : '#030810' }"
            @click="copyHex(swatch.hex)"
          >
            <span>{{ copied === swatch.hex ? "Copied" : swatch.hex }}</span>
          </button>
        </div>
        <p v-else class="hint">Drop a picture. Click a chip to copy the hex.</p>
      </section>

      <p class="privacy">Runs in your browser. The file never leaves this page.</p>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/css/tool-bench.scss";

.swatches {
  display: grid;
  gap: 0.4rem;
}

.token {
  display: flex;
  align-items: center;
  min-height: 2.8rem;
  padding: 0.55rem 0.75rem;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: transform 140ms var(--ease-out);
}

.token:active {
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .token:active {
    transform: none;
  }
}
</style>
