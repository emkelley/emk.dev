<script setup lang="ts">
const route = useRoute();
const isHome = computed(() => route.path === "/");

const social = [
  {
    name: "GitHub",
    url: "https://github.com/emkelley",
    icon: "mdi:github",
  },
  {
    name: "Codepen",
    url: "https://codepen.com/emkelley",
    icon: "skill-icons:codepen-dark",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/ericmkelley",
    icon: "famicons:logo-linkedin",
  },
  {
    name: "Threads",
    url: "https://www.threads.net/@mr.erickelley",
    icon: "bi:threads",
  },
  {
    name: "Email",
    url: "mailto:contact@emk.dev",
    icon: "bi:envelope-fill",
  },
];
</script>

<template>
  <footer
    class="z-10 flex flex-row w-full justify-between items-center mx-auto max-w-[1400px] px-4 md:px-8 text-muted"
    :class="isHome ? 'fixed bottom-0 inset-x-0 pb-5 pt-4' : 'relative pb-6 pt-8'"
  >
    <p class="text-xs font-mono tracking-wide">
      Eric Kelley © {{ new Date().getFullYear() }}
      <span class="hidden sm:inline"> · MMXII Live the Fourth</span>
    </p>
    <div class="flex gap-4 items-center">
      <a
        v-for="item in social"
        :key="item.url"
        :href="item.url"
        target="_blank"
        rel="me"
        :aria-label="item.name"
        class="social-link text-lg"
      >
        <Icon :name="item.icon" />
      </a>
    </div>
  </footer>
</template>

<style scoped>
.social-link {
  color: var(--muted);
  transition: color 120ms ease, transform 140ms var(--ease-out);
}

.social-link:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .social-link:hover {
    color: var(--ink);
  }
}

@media (prefers-reduced-motion: reduce) {
  .social-link {
    transition: color 120ms ease;
  }

  .social-link:active {
    transform: none;
  }
}
</style>
