<script setup lang="ts">
defineProps({
  href: {
    type: String,
    default: "",
  },
  target: {
    type: String,
    default: undefined,
    required: false,
  },
});
</script>

<template>
  <NuxtLink
    :href="href"
    :target="target"
    class="underline underline-offset-2 hover:underline-offset-4 duration-200 cursor-pointer text-blue-400"
  >
    <slot />
  </NuxtLink>
</template>
