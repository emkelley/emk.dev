<script setup lang="ts">
import { fileFromPaste, useFileDrop } from "@/composables/useFileDrop";

export interface OgMeta {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  domain: string;
}

const input = ref("");
const field = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const error = ref("");
const meta = ref<OgMeta | null>(null);
const localImage = ref("");
const title = ref("");
const description = ref("");
const siteName = ref("");
const domain = ref("");

const { dragging } = useFileDrop((file) => loadImage(file));
const hasCard = computed(() => Boolean(meta.value || localImage.value || title.value));
const imageSrc = computed(() => {
  if (localImage.value) return localImage.value;
  if (!meta.value?.image) return "";
  return `/api/og-image?url=${encodeURIComponent(meta.value.image)}`;
});

onMounted(() => window.addEventListener("paste", onPaste));
onBeforeUnmount(() => {
  window.removeEventListener("paste", onPaste);
  revokeLocal();
});

function revokeLocal() {
  if (localImage.value) {
    URL.revokeObjectURL(localImage.value);
    localImage.value = "";
  }
}

function applyMeta(next: OgMeta) {
  meta.value = next;
  title.value = next.title;
  description.value = next.description;
  siteName.value = next.siteName;
  domain.value = next.domain;
}

async function lookup() {
  const url = input.value.trim();
  if (!url) {
    error.value = "Paste a URL first.";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    const result = await $fetch<OgMeta>("/api/og-preview", {
      method: "POST",
      body: { url },
    });
    revokeLocal();
    applyMeta(result);
  } catch (err: unknown) {
    const fetchErr = err as { data?: { message?: string }; message?: string };
    error.value = fetchErr.data?.message || fetchErr.message || "Could not read that page.";
  } finally {
    loading.value = false;
  }
}

function loadImage(file: File) {
  if (!file.type.startsWith("image/")) {
    error.value = "Drop a PNG or JPG to use as the card image.";
    return;
  }
  error.value = "";
  revokeLocal();
  localImage.value = URL.createObjectURL(file);
  if (!title.value) title.value = file.name.replace(/\.[^.]+$/, "");
  if (!domain.value) domain.value = "emk.dev";
  if (!siteName.value) siteName.value = "emk.dev";
}

function onPaste(event: ClipboardEvent) {
  const file = fileFromPaste(event);
  if (file) {
    event.preventDefault();
    loadImage(file);
    return;
  }
  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
  const text = event.clipboardData?.getData("text/plain")?.trim();
  if (text && /^https?:\/\//i.test(text)) {
    event.preventDefault();
    input.value = text;
    void lookup();
  }
}

function clearCard() {
  meta.value = null;
  title.value = "";
  description.value = "";
  siteName.value = "";
  domain.value = "";
  input.value = "";
  error.value = "";
  revokeLocal();
  field.value?.focus();
}
</script>

<template>
  <div class="bench og">
    <div class="stage cards-stage" :class="{ 'is-dragging': dragging, 'has-file': hasCard }">
      <div v-if="!hasCard" class="drop-form">
        <form class="drop" @submit.prevent="lookup">
          <label class="drop-kicker" for="og-url">Paste a URL</label>
          <p class="drop-copy">Or drop an image and type the copy yourself.</p>
          <input
            id="og-url"
            ref="field"
            v-model="input"
            class="url"
            type="text"
            inputmode="url"
            autocomplete="off"
            spellcheck="false"
            placeholder="https://emk.dev"
            :disabled="loading"
          />
          <button type="submit" class="primary" :disabled="loading">
            {{ loading ? "Reading…" : "Preview cards" }}
          </button>
        </form>
      </div>

      <div v-else class="card-stack">
        <article class="plat discord">
          <p class="plat-label">Discord</p>
          <div class="discord-card">
            <p class="discord-site">{{ siteName || domain || "site" }}</p>
            <p class="discord-title">{{ title || "Title" }}</p>
            <p v-if="description" class="discord-desc">{{ description }}</p>
            <img v-if="imageSrc" :src="imageSrc" alt="" class="discord-img" />
          </div>
        </article>

        <article class="plat imessage">
          <p class="plat-label">iMessage</p>
          <div class="imsg-card">
            <img v-if="imageSrc" :src="imageSrc" alt="" class="imsg-img" />
            <div class="imsg-copy">
              <p class="imsg-title">{{ title || "Title" }}</p>
              <p class="imsg-site">{{ domain || "site" }}</p>
            </div>
          </div>
        </article>

        <article class="plat x">
          <p class="plat-label">X</p>
          <div class="x-card">
            <img v-if="imageSrc" :src="imageSrc" alt="" class="x-img" />
            <div class="x-copy">
              <p class="x-title">{{ title || "Title" }}</p>
              <p class="x-desc">{{ description || domain }}</p>
              <p class="x-site">{{ domain || "site" }}</p>
            </div>
          </div>
        </article>
      </div>

      <div v-if="dragging" class="drop-veil" aria-hidden="true"><span>Drop an image</span></div>
    </div>

    <aside class="panel">
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <section class="group">
        <div class="group-head">
          <h2>Source</h2>
          <button v-if="hasCard" type="button" class="text-btn" @click="clearCard">Replace</button>
        </div>
        <form v-if="!hasCard" class="stack" @submit.prevent="lookup">
          <button type="submit" class="ghost-btn" :disabled="loading">Fetch URL</button>
        </form>
        <p v-else class="file-name">{{ meta?.url || "Custom image" }}</p>
      </section>

      <section class="group">
        <h2>Title</h2>
        <input v-model="title" class="url" type="text" maxlength="120" :disabled="!hasCard" />
      </section>

      <section class="group">
        <h2>Description</h2>
        <textarea
          v-model="description"
          class="url area"
          rows="3"
          maxlength="200"
          :disabled="!hasCard"
        />
      </section>

      <section class="group">
        <h2>Site</h2>
        <input v-model="domain" class="url" type="text" maxlength="80" :disabled="!hasCard" />
      </section>

      <p class="privacy">
        Fetching a URL goes through this site so we can read the tags. Dropped images stay in the browser.
      </p>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/css/tool-bench.scss";

.cards-stage {
  min-height: 24rem;
}

.drop-form .drop {
  min-height: 22rem;
}

.card-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
}

.plat-label {
  margin: 0 0 0.4rem;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.discord-card {
  padding: 0.85rem 1rem 0;
  border-left: 4px solid #1e1f22;
  background: #2b2d31;
  border-radius: 4px;
}

.discord-site {
  margin: 0 0 0.2rem;
  color: #00a8fc;
  font-size: 0.72rem;
  font-weight: 600;
}

.discord-title {
  margin: 0 0 0.25rem;
  color: #00a8fc;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
}

.discord-desc {
  margin: 0 0 0.75rem;
  color: #dbdee1;
  font-size: 0.88rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.discord-img {
  display: block;
  width: calc(100% + 2rem);
  margin-left: -1rem;
  max-height: 12rem;
  object-fit: cover;
  border-radius: 0 0 4px 4px;
}

.imsg-card {
  overflow: hidden;
  border-radius: 1.1rem;
  background: #1c1c1e;
}

.imsg-img {
  display: block;
  width: 100%;
  height: 9rem;
  object-fit: cover;
}

.imsg-copy {
  padding: 0.7rem 0.85rem 0.85rem;
}

.imsg-title {
  margin: 0;
  color: #f2f2f7;
  font-size: 0.92rem;
  font-weight: 600;
}

.imsg-site {
  margin: 0.15rem 0 0;
  color: #8e8e93;
  font-size: 0.78rem;
}

.x-card {
  overflow: hidden;
  border: 1px solid #2f3336;
  border-radius: 1rem;
  background: #000;
}

.x-img {
  display: block;
  width: 100%;
  height: 10rem;
  object-fit: cover;
}

.x-copy {
  padding: 0.7rem 0.85rem 0.85rem;
}

.x-title {
  margin: 0;
  color: #e7e9ea;
  font-size: 0.95rem;
  font-weight: 700;
}

.x-desc,
.x-site {
  margin: 0.2rem 0 0;
  color: #71767b;
  font-size: 0.82rem;
  line-height: 1.35;
}

.x-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.area {
  max-width: none;
  resize: vertical;
  min-height: 4.5rem;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.panel .url {
  max-width: none;
}
</style>
