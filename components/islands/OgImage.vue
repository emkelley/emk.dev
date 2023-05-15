<script setup lang="ts">
defineProps({
  title: String,
  subtitle: String,
  backgroundColor: String,
});
</script>

<template>
  <div
    :class="[backgroundColor]"
    class="w-full h-full flex flex-col text-white justify-center px-24 py-12"
  >
    <h1 class="text-7xl">{{ title }}</h1>
    <p class="text-4xl">{{ subtitle ? subtitle : "" }}</p>
    <div class="flex gap-2 items-center justify-start text-4xl">
      <p>Eric Kelley | emk.dev</p>
    </div>
  </div>
</template>
