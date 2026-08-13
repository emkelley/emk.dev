<script setup lang="ts">
import { downloadBlob, formatDuration, wait, baseName } from "@/utils/download";
import { fitWithin } from "@/utils/imageFile";
import { encodeGif } from "@/utils/gifEncode";
import { fileFromPaste, useFileDrop } from "@/composables/useFileDrop";

const MAX_BYTES = 80 * 1024 * 1024;
const GIF_FPS = 8;
const GIF_MAX_SECONDS = 6;
const GIF_MAX_EDGE = 360;

const fileInput = ref<HTMLInputElement | null>(null);
const videoEl = ref<HTMLVideoElement | null>(null);
const error = ref("");
const name = ref("");
const objectUrl = ref("");
const duration = ref(0);
const start = ref(0);
const end = ref(0);
const muted = ref(true);
const busy = ref("");
const width = ref(0);
const height = ref(0);

const { dragging } = useFileDrop((file) => loadFile(file));
const hasFile = computed(() => Boolean(objectUrl.value));
const clipLength = computed(() => Math.max(0, end.value - start.value));
const canRecord = computed(() => typeof window !== "undefined" && "MediaRecorder" in window);

onMounted(() => window.addEventListener("paste", onPaste));
onBeforeUnmount(() => {
  window.removeEventListener("paste", onPaste);
  revoke();
});

watch([start, end], () => {
  if (start.value > end.value) {
    const swap = start.value;
    start.value = end.value;
    end.value = swap;
  }
});

function revoke() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = "";
  }
}

async function loadFile(file: File) {
  error.value = "";
  if (file.size > MAX_BYTES) {
    error.value = "Keep the video under 80 MB.";
    return;
  }
  const ok =
    file.type.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)$/i.test(file.name);
  if (!ok) {
    error.value = "Drop an MP4 or WebM.";
    return;
  }

  revoke();
  objectUrl.value = URL.createObjectURL(file);
  name.value = baseName(file.name);
  start.value = 0;
  end.value = 0;
  duration.value = 0;
}

function onLoaded() {
  const video = videoEl.value;
  if (!video) return;
  duration.value = video.duration || 0;
  width.value = video.videoWidth;
  height.value = video.videoHeight;
  start.value = 0;
  end.value = video.duration || 0;
}

function onTimeUpdate() {
  const video = videoEl.value;
  if (!video || busy.value) return;
  if (video.currentTime > end.value) {
    video.currentTime = start.value;
  }
}

function seekToStart() {
  if (videoEl.value) videoEl.value.currentTime = start.value;
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
  revoke();
  name.value = "";
  duration.value = 0;
  start.value = 0;
  end.value = 0;
  error.value = "";
  busy.value = "";
}

function pickMime(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = Math.min(Math.max(0, time), Math.max(0, video.duration - 0.05));
  });
}

async function downloadClip() {
  const video = videoEl.value;
  if (!video || !canRecord.value) {
    error.value = "This browser cannot record a clip. Try the GIF instead.";
    return;
  }
  const mime = pickMime();
  if (!mime) {
    error.value = "This browser cannot record a clip. Try the GIF instead.";
    return;
  }

  busy.value = "Recording";
  error.value = "";
  try {
    await seek(video, start.value);
    const stream = (
      video as HTMLVideoElement & { captureStream?: () => MediaStream; webkitCaptureStream?: () => MediaStream }
    ).captureStream?.() ||
      (video as HTMLVideoElement & { webkitCaptureStream?: () => MediaStream }).webkitCaptureStream?.();
    if (!stream) throw new Error("This browser cannot capture the video stream.");

    if (muted.value) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    recorder.start();
    const previousMute = video.muted;
    video.muted = muted.value;
    await video.play();
    const ms = Math.max(120, clipLength.value * 1000);
    await wait(ms);
    video.pause();
    video.muted = previousMute;
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;

    const ext = mime.includes("mp4") ? "mp4" : "webm";
    downloadBlob(new Blob(chunks, { type: mime.split(";")[0] }), `${name.value}-clip.${ext}`);
    await seek(video, start.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not record that clip.";
  } finally {
    busy.value = "";
  }
}

async function downloadGif() {
  const video = videoEl.value;
  if (!video) return;
  busy.value = "Making GIF";
  error.value = "";
  try {
    const gifDuration = Math.min(clipLength.value, GIF_MAX_SECONDS);
    const size = fitWithin(video.videoWidth || 360, video.videoHeight || 640, GIF_MAX_EDGE);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not draw frames.");

    const frames = [];
    const step = 1 / GIF_FPS;
    const wasMuted = video.muted;
    video.muted = true;
    for (let t = start.value; t < start.value + gifDuration - 0.001; t += step) {
      await seek(video, t);
      ctx.drawImage(video, 0, 0, size.width, size.height);
      const pixels = ctx.getImageData(0, 0, size.width, size.height);
      frames.push({ data: pixels.data, width: size.width, height: size.height });
    }
    video.muted = wasMuted;

    const blob = await encodeGif(frames, 1000 / GIF_FPS);
    downloadBlob(blob, `${name.value}-clip.gif`);
    await seek(video, start.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not make that GIF.";
  } finally {
    busy.value = "";
  }
}
</script>

<template>
  <div class="bench">
    <div class="stage" :class="{ 'is-dragging': dragging, 'has-file': hasFile }">
      <input
        ref="fileInput"
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
        class="sr-only"
        @change="onFileChange"
      />

      <button v-if="!hasFile" type="button" class="drop" @click="fileInput?.click()">
        <span class="drop-kicker">Drop an MP4</span>
        <span class="drop-copy">The TikTok you just grabbed counts. Paste works too.</span>
      </button>

      <div v-else class="preview-wrap">
        <div class="checker dark">
          <video
            ref="videoEl"
            class="preview player"
            :src="objectUrl"
            controls
            playsinline
            preload="metadata"
            @loadedmetadata="onLoaded"
            @timeupdate="onTimeUpdate"
          />
        </div>
        <div class="preview-meta">
          <span>
            {{ formatDuration(start) }} to {{ formatDuration(end) }}
            of {{ formatDuration(duration) }}
          </span>
          <span v-if="busy" class="busy">{{ busy }}</span>
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
        <p v-if="name" class="file-name">
          {{ name }}
          <template v-if="width && height"> · {{ width }}×{{ height }}</template>
        </p>
        <button v-else type="button" class="ghost-btn" @click="fileInput?.click()">Choose video</button>
      </section>

      <section class="group">
        <div class="group-head">
          <h2>In / out</h2>
          <span class="readout">{{ formatDuration(clipLength) }}</span>
        </div>
        <label class="field-label">
          In
          <input
            v-model.number="start"
            class="slider"
            type="range"
            min="0"
            :max="duration || 0"
            step="0.05"
            :disabled="!hasFile"
            @change="seekToStart"
          />
        </label>
        <label class="field-label">
          Out
          <input
            v-model.number="end"
            class="slider"
            type="range"
            min="0"
            :max="duration || 0"
            step="0.05"
            :disabled="!hasFile"
          />
        </label>
      </section>

      <section class="group">
        <h2>Audio</h2>
        <div class="seg" role="tablist" aria-label="Audio">
          <button
            type="button"
            class="seg-btn"
            :class="{ 'is-on': muted }"
            :disabled="!hasFile"
            @click="muted = true"
          >
            Mute
          </button>
          <button
            type="button"
            class="seg-btn"
            :class="{ 'is-on': !muted }"
            :disabled="!hasFile"
            @click="muted = false"
          >
            Keep
          </button>
        </div>
      </section>

      <div class="actions">
        <button
          type="button"
          class="primary"
          :disabled="!hasFile || Boolean(busy) || clipLength < 0.2"
          @click="downloadClip"
        >
          Download clip
        </button>
        <button
          type="button"
          class="ghost-btn"
          :disabled="!hasFile || Boolean(busy) || clipLength < 0.2"
          @click="downloadGif"
        >
          Download GIF
        </button>
        <p class="privacy">
          GIF is capped at {{ GIF_MAX_SECONDS }}s from the in-point. The file never leaves this page.
        </p>
      </div>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/css/tool-bench.scss";

.dark {
  background-image: none;
  background: #000;
}

.player {
  width: 100%;
  max-height: 28rem;
  background: #000;
}

.field-label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}
</style>
