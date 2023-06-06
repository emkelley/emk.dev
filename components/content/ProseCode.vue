<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

const { copy, copied, text } = useClipboard();
const props = withDefaults(
  defineProps<{
    code?: string;
    language?: string | null;
    filename?: string | null;
    highlights?: Array<number>;
  }>(),
  { code: "", language: null, filename: null }
);

const languageMap: Record<
  string,
  { text: string; color: string; background: string }
> = {
  vue: {
    text: "vue",
    background: "#42b883",
    color: "white",
  },
  js: {
    text: "js",
    background: "#f7df1e",
    color: "black",
  },
  ts: {
    text: "typescript",
    background: "#2f74c0",
    color: "white",
  },
  typescript: {
    text: "typescript",
    background: "#2f74c0",
    color: "white",
  },
  bash: {
    text: "bash",
    background: "#1c2b50",
    color: "white",
  },
  sh: {
    text: "bash",
    background: "#1c2b50",
    color: "white",
  },
  json: {
    text: "json",
    background: "#ea3323",
    color: "white",
  },
};

const languageText = computed(() =>
  props.language ? languageMap[props.language]?.text : null
);
const languageBackground = computed(() =>
  props.language ? languageMap[props.language]?.background : null
);
const languageColor = computed(() =>
  props.language ? languageMap[props.language]?.color : null
);
</script>

<template>
  <div class="container">
    <span v-if="filename" class="filename-text">
      {{ filename }}
    </span>
    <span
      v-if="languageText"
      class="absolute top-0 right-0 p-0.5 text-xs px-3 rounded-bl-md opacity-75 hover:opacity-100 select-none"
      :class="`bg-[${languageBackground}] text-[${languageColor}]`"
    >
      {{ languageText }}
    </span>
    <slot />
    <div class="bottom-container">
      <div class="copy-container">
        <span class="text-sm text-green-400 mr-8" v-if="copied"> Copied! </span>
        <button
          @click="copy(code)"
          class="text-sm opacity-75 hover:opacity-100"
        >
          Copy
          <Icon name="material-symbols:content-copy" class="ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  background: hsl(222, 47%, 8%);
  @apply rounded-md p-4 my-6;
}
.bottom-container {
  display: flex;
  justify-content: flex-end;
}

.copy-container {
  display: flex;
}

.copied-text {
  margin-right: 1em;
}
.filename-text {
  position: absolute;
  top: 0;
  left: 1em;
  padding: 0.25em 0.5em;
  color: white;
  font-size: 14px;
}
:slotted(pre) {
  margin-top: 0;
  margin-bottom: 0;
  display: flex;
  flex: 1 1 0%;
  overflow-x: auto;
  padding: 1rem;
  line-height: 1.625;
  counter-reset: lines;
}

:slotted(pre code) {
  width: 100%;
  display: flex;
  flex-direction: column;
}

:slotted(pre code .line) {
  display: inline-table;
  min-height: 1rem;
}

:slotted(pre code .line::before) {
  counter-increment: lines;
  content: counter(lines);
  width: 1rem;
  margin-right: 1.5rem;
  display: inline-block;
  text-align: left;
  color: rgba(115, 138, 148, 0.4);
}
</style>
