<script setup lang="ts">
const route = useRoute();

const active_route = computed(() => route.path);
</script>
<template>
  <nav
    class="w-full py-4 flex items-center justify-center px-4 md:px-12 sticky top-0 bg-[#0f172a]/60 backdrop-blur-md z-[999] rounded-b-xl overflow-hidden"
  >
    <div class="bg-[#1c2b50] flex text-white rounded-md shadow-md p-3 gap-6">
      <nuxt-link to="/" :class="active_route === '/' ? 'nav_active' : ''">
        Home
      </nuxt-link>
      <nuxt-link
        to="/articles"
        :class="active_route.includes('/articles') ? 'nav_active' : ''"
      >
        Articles
      </nuxt-link>
      <nuxt-link
        to="/uses"
        :class="active_route === '/uses' ? 'nav_active' : ''"
      >
        Uses
      </nuxt-link>
      <a href="https://ek-webtools.netlify.app/" target="_blank">
        Tools <Icon name="ic:round-launch" class="ml-1" />
      </a>
    </div>
  </nav>
</template>

<style scoped>
.nav_active {
  @apply text-blue-400 font-bold;
}
a {
  @apply hover:text-blue-400 duration-200;
}
</style>
