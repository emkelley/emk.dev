<template>
  <h2
    :id="id"
    @mouseover="isHovering = true"
    @mouseleave="isHovering = false"
    class="flex items-center text-blue-400"
  >
    <a v-if="id && generate" :href="`#${id}`">
      <slot />
    </a>
    <slot v-else />
    <transition>
      <span v-if="isHovering" class="ml-3 text-xl opacity-50">#</span>
    </transition>
  </h2>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from "#imports";
defineProps<{ id?: string }>();

const isHovering = ref(false);
const heading = 2;
const { anchorLinks } = useRuntimeConfig().public.content;
const generate =
  anchorLinks?.depth >= heading && !anchorLinks?.exclude.includes(heading);
</script>

<style lang="scss" scoped>
h2 {
  @apply text-4xl font-bold mb-4 mt-20;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
