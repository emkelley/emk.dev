<script setup lang="ts">
export interface TikTokMeta {
  id: string;
  author: string;
  nickname: string;
  description: string;
  duration: number;
  width: number;
  height: number;
  cover: string;
  filename: string;
  pageUrl: string;
}

const input = ref("");
const loading = ref(false);
const error = ref("");
const meta = ref<TikTokMeta | null>(null);
const sourceUrl = ref("");
const field = ref<HTMLInputElement | null>(null);

const hasVideo = computed(() => Boolean(meta.value));
const fileUrl = computed(() => {
  if (!sourceUrl.value) return "";
  return `/api/tiktok/file?url=${encodeURIComponent(sourceUrl.value)}`;
});
const previewUrl = computed(() => {
  if (!fileUrl.value) return "";
  return `${fileUrl.value}&inline=1`;
});
const durationLabel = computed(() => {
  if (!meta.value?.duration) return "";
  return formatDuration(meta.value.duration);
});
const sizeLabel = computed(() => {
  if (!meta.value) return "";
  if (meta.value.width && meta.value.height) {
    return `${meta.value.width}×${meta.value.height}`;
  }
  return "";
});

onMounted(() => {
  window.addEventListener("paste", onPaste);
});

onBeforeUnmount(() => {
  window.removeEventListener("paste", onPaste);
});

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function looksLikeTikTok(value: string) {
  return /tiktok\.com/i.test(value.trim());
}

async function onPaste(event: ClipboardEvent) {
  if (loading.value) return;
  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
    return;
  }
  const text = event.clipboardData?.getData("text/plain");
  if (text && looksLikeTikTok(text)) {
    event.preventDefault();
    input.value = text.trim();
    await lookup();
  }
}

async function lookup() {
  const url = input.value.trim();
  if (!url) {
    error.value = "Paste a TikTok link first.";
    return;
  }

  loading.value = true;
  error.value = "";
  meta.value = null;

  try {
    const result = await $fetch<TikTokMeta>("/api/tiktok/resolve", {
      method: "POST",
      body: { url },
    });
    meta.value = result;
    sourceUrl.value = url;
  } catch (err: unknown) {
    const fetchErr = err as { data?: { message?: string }; message?: string };
    error.value =
      fetchErr.data?.message || fetchErr.message || "Could not pull that video.";
  } finally {
    loading.value = false;
  }
}

function clearVideo() {
  meta.value = null;
  sourceUrl.value = "";
  error.value = "";
  input.value = "";
  field.value?.focus();
}

function downloadFile() {
  if (!fileUrl.value || !meta.value) return;
  const link = document.createElement("a");
  link.href = fileUrl.value;
  link.download = meta.value.filename;
  link.click();
}
</script>

<template>
  <div class="bench">
    <div class="stage" :class="{ 'has-file': hasVideo }">
      <form v-if="!hasVideo" class="drop" @submit.prevent="lookup">
        <label class="drop-kicker" for="tiktok-url">Paste a TikTok URL</label>
        <p class="drop-copy">www, vm, vt, or a full /@user/video link.</p>
        <input
          id="tiktok-url"
          ref="field"
          v-model="input"
          class="url"
          type="text"
          inputmode="url"
          autocomplete="off"
          spellcheck="false"
          placeholder="https://www.tiktok.com/@user/video/…"
          :disabled="loading"
        />
        <button type="submit" class="primary" :disabled="loading">
          {{ loading ? "Pulling…" : "Pull video" }}
        </button>
      </form>

      <div v-else class="preview-wrap">
        <div class="checker">
          <video
            class="preview"
            controls
            playsinline
            preload="none"
            :poster="meta?.cover || undefined"
            :src="previewUrl"
            :style="
              meta?.width && meta?.height
                ? { aspectRatio: `${meta.width} / ${meta.height}` }
                : undefined
            "
          />
        </div>
        <div class="preview-meta">
          <span>{{ durationLabel || "Ready" }}{{ sizeLabel ? ` · ${sizeLabel}` : "" }}</span>
          <span class="busy">MP4</span>
        </div>
      </div>
    </div>

    <aside class="panel">
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <section class="group">
        <div class="group-head">
          <h2>Link</h2>
          <button v-if="hasVideo" type="button" class="text-btn" @click="clearVideo">
            Replace
          </button>
        </div>
        <p v-if="meta" class="file-name">{{ meta.filename }}</p>
        <p v-else class="hint">Drop the URL in the field, or paste it anywhere on this page.</p>
      </section>

      <section class="group">
        <h2>Post</h2>
        <template v-if="meta">
          <p class="file-name">@{{ meta.author }}</p>
          <p v-if="meta.description" class="caption">{{ meta.description }}</p>
          <p v-else class="hint">No caption on this one.</p>
        </template>
        <p v-else class="hint">Author and caption show up after the lookup.</p>
      </section>

      <div class="actions">
        <button
          type="button"
          class="primary"
          :disabled="!hasVideo || loading"
          @click="downloadFile"
        >
          Download MP4
        </button>
        <p class="privacy">
          The link goes through this site so TikTok's CDN will talk to us. The file is not kept.
        </p>
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

.drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  min-height: 22rem;
  padding: 2rem 1.25rem;
}

.drop-kicker {
  font-family: "Saira Extra Condensed", sans-serif;
  font-size: clamp(2.4rem, 6vw, 3.4rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 0.9;
  color: var(--ink);
}

.drop-copy {
  color: var(--muted);
  font-size: 0.95rem;
  margin: 0 0 0.85rem;
}

.url {
  width: 100%;
  max-width: 28rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid rgba(142, 182, 232, 0.22);
  background: var(--void);
  color: var(--ink);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.82rem;
}

.url::placeholder {
  color: var(--muted);
  opacity: 0.7;
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
  background: #0a1624;
}

.preview {
  max-width: 100%;
  max-height: 28rem;
  width: auto;
  height: auto;
  object-fit: contain;
  background: #000;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border-top: 1px solid rgba(142, 182, 232, 0.16);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
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

.caption {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-top: 0.4rem;
}

.primary,
.text-btn {
  transition: color 120ms ease, background-color 120ms ease, border-color 120ms ease,
    transform 140ms var(--ease-out);
}

.primary {
  width: 100%;
  padding: 0.8rem 1rem;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--cyan);
  color: var(--deep);
}

.drop .primary {
  width: auto;
  min-width: 11rem;
  margin-top: 0.55rem;
}

.text-btn {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cyan);
}

.primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.primary:active:not(:disabled),
.text-btn:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .text-btn:hover {
    color: var(--ink);
  }

  .primary:hover:not(:disabled) {
    background: #4ee0d8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .primary,
  .text-btn {
    transition: color 120ms ease, background-color 120ms ease, border-color 120ms ease;
  }

  .primary:active:not(:disabled),
  .text-btn:active {
    transform: none;
  }
}
</style>
