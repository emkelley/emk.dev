<template>
  <section
    class="bg-[#0139b3] flex flex-col gap-4 items-center justify-center rounded-b-3xl mb-24 py-12"
  >
    <h1
      class="text-5xl max-w-4xl px-8 mx-auto font-bold text-white text-center"
    >
      {{ props.title }}
    </h1>
    <p class="text-slate-200 text-center">Published: {{ publishDateString }}</p>
    <ArticleTags :tags="tags" />
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  publishDate: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    required: false,
  },
});

const publishDateString = computed(() => {
  if (!props.publishDate) return "";
  return new Date(props.publishDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
});
</script>

<style scoped></style>
