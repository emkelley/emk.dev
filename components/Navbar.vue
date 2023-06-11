<script setup lang="ts">
const route = useRoute();

const active_route = computed(() => route.path);
</script>
<template>
  <nav
    class="w-full py-4 flex items-center justify-between px-12 sticky top-0 bg-[#0f172a]/60 backdrop-blur-md z-[999] rounded-b-xl overflow-hidden"
  >
    <nuxt-link to="/">
      <img src="/img/logo_long_white.svg" alt="" class="h-8" />
    </nuxt-link>
    <div class="bg-[#1c2b50] text-white rounded-md shadow-md p-3 flex gap-6">
      <nuxt-link to="/" :class="active_route === '/' ? 'nav_active' : ''">
        Home
      </nuxt-link>
      <!-- <nuxt-link
        to="/projects"
        :class="active_route === '/projects' ? 'nav_active' : ''"
      >
        Projects
      </nuxt-link> -->
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
        Web Tools <Icon name="ic:round-launch" class="ml-2" />
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
