<script setup lang="ts">
defineProps<{
  tags: string[];
  theme: string;
}>();
</script>

<template>
  <div v-if="tags" class="flex gap-2 items-center w-full justify-center">
    <nuxt-link
      v-for="tag in tags"
      :key="tag"
      :class="theme ? theme : 'dark'"
      class="text-white bg-gradient-to-tr py-1 flex items-center justify-center px-4 rounded-md text-sm z-50 hover:cursor-pointer hover:bg-red-500"
      :to="`/articles/tags/${tag}`"
    >
      {{ tag }}
    </nuxt-link>
  </div>
</template>

<style scoped>
.dark {
  @apply from-slate-950 to-slate-800 hover:bg-slate-800;
}
.blue {
  @apply from-blue-900 to-blue-800 hover:bg-blue-800;
}
</style>
