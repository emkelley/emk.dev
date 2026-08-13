<script setup lang="ts">
const route = useRoute();
const isHome = computed(() => route.path === "/");
</script>

<template>
  <div>
    <Navbar />
    <div :class="isHome ? '' : 'pt-20 md:pt-24'">
      <slot />
    </div>
    <Footer />
  </div>
</template>
