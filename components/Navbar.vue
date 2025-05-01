<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const active_route = computed(() => route.path);
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Function to close the menu
const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <nav
    class="w-full py-4 flex items-center justify-between px-4 md:px-12 sticky top-0 bg-[#0f172a]/60 backdrop-blur-md z-[999] rounded-b-xl overflow-hidden"
  >
    <nuxt-link to="/" @click="closeMenu">
      <img src="/img/logo_long_white.svg" alt="EMK Development Logo" class="h-8" />
    </nuxt-link>
    <div
      :class="[
        'fixed inset-0 bg-[#1c2b50] text-white flex flex-col items-stretch justify-center transition-transform duration-300 ease-in-out',
        isMenuOpen ? 'translate-x-0' : 'translate-x-full',
        'sm:static sm:translate-x-0 sm:bg-transparent sm:flex-row sm:items-center sm:justify-start sm:gap-6 sm:p-0',
        'p-8 space-y-6',
      ]"
    >
      <button
        class="absolute top-4 right-4 text-white sm:hidden"
        @click="toggleMenu"
        aria-label="Close menu"
      >
        <Icon name="ion:close-outline" class="h-8 w-8" />
      </button>

      <nuxt-link to="/" :class="active_route === '/' ? 'nav_active' : ''" @click="closeMenu" class="w-full text-center py-2"> Home </nuxt-link>
      <!-- <nuxt-link
        to="/projects"
        :class="active_route === '/projects' ? 'nav_active' : ''"
      >
        Projects
      </nuxt-link> -->
      <nuxt-link to="/articles" :class="active_route.includes('/articles') ? 'nav_active' : ''" @click="closeMenu" class="w-full text-center py-2">
        Articles
      </nuxt-link>
      <nuxt-link to="/uses" :class="active_route === '/uses' ? 'nav_active' : ''" @click="closeMenu" class="w-full text-center py-2"> Uses </nuxt-link>
      <a href="https://tv.emk.dev/" target="_blank" @click="closeMenu" class="w-full flex items-center justify-center text-center py-2">
        TV <Icon name="ion:tv-outline" class="ml-2 inline" />
      </a>
    </div>
  </nav>
</template>

<style scoped>
.nav_active {
  @apply text-blue-400 font-bold;
}
a, .nuxt-link-exact-active {
  @apply hover:text-blue-400 duration-200 text-xl sm:text-base py-2 sm:py-0;
}
</style>
