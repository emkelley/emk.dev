<script setup lang="ts">
const route = useRoute();
const isMenuOpen = ref(false);

const isActive = (path: string) => {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

watch(
  () => route.path,
  () => {
    isMenuOpen.value = false;
  }
);
</script>

<template>
  <nav class="fixed inset-x-0 top-0 z-[100] px-4 md:px-8 py-4">
    <div class="flex items-center justify-between max-w-[1400px] mx-auto">
      <nuxt-link to="/" class="relative z-[110] logo-press" @click="closeMenu">
        <img src="/img/logo_long_white.svg" alt="Eric Kelley" class="h-7 md:h-8" />
      </nuxt-link>

      <button
        type="button"
        class="relative z-[110] sm:hidden text-ink p-1 logo-press"
        :aria-expanded="isMenuOpen"
        :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
        @click="isMenuOpen = !isMenuOpen"
      >
        <Icon :name="isMenuOpen ? 'ion:close-outline' : 'ion:menu-outline'" class="h-8 w-8" />
      </button>

      <div
        :class="[
          'fixed inset-0 z-[105] bg-deep/95 backdrop-blur-md flex flex-col items-center justify-center gap-8',
          'transition-transform duration-[280ms] ease-drawer sm:duration-0',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full',
          'sm:static sm:z-auto sm:translate-x-0 sm:bg-transparent sm:backdrop-blur-none sm:flex-row sm:items-center sm:justify-end sm:gap-7 sm:p-0',
        ]"
      >
        <nuxt-link
          to="/"
          class="nav-link"
          :class="{ 'is-active': isActive('/') && route.path === '/' }"
          @click="closeMenu"
        >
          Home
        </nuxt-link>
        <nuxt-link
          to="/uses"
          class="nav-link"
          :class="{ 'is-active': isActive('/uses') }"
          @click="closeMenu"
        >
          Uses
        </nuxt-link>
        <a
          href="https://tv.emk.dev/"
          target="_blank"
          rel="noreferrer"
          class="nav-link inline-flex items-center gap-1.5"
          @click="closeMenu"
        >
          TV
          <Icon name="ion:tv-outline" class="text-[1em]" />
        </a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color 120ms ease, transform 140ms var(--ease-out);
}

.nav-link.is-active {
  color: var(--cyan);
}

.nav-link:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .nav-link:hover {
    color: var(--ink);
  }
}

@media (max-width: 639px) {
  .nav-link {
    font-size: 1.15rem;
    color: var(--ink);
  }
}

.logo-press {
  transition: transform 140ms var(--ease-out);
}

.logo-press:active {
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .logo-press {
    transition: color 120ms ease;
  }

  .nav-link:active,
  .logo-press:active {
    transform: none;
  }
}
</style>
