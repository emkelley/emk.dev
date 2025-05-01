<script setup lang="ts">
import axios from "axios";

const social = [
  {
    name: "Github",
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
    class="flex flex-row w-full justify-between items-center mx-auto max-w-7xl pb-6 pt-12 px-4 text-slate-300"
  >
    <div class="flex items-center justify-center">
      <p class="text-xs">
        Eric Kelley © {{ new Date().getFullYear() }} | MMXII Live the Fourth
      </p>
    </div>
    <div class="flex gap-4 text-slate-300 items-center justify-center">
      <a
        v-for="item in social"
        :key="item.url"
        :href="item.url"
        target="_blank"
        rel="me"
        :name="item.name"
      >
        <Icon :name="item.icon" class="" />
      </a>
    </div>
  </footer>
</template>

<style scoped></style>
