<template>
  <div
    class="flex flex-row w-full justify-between mx-auto max-w-7xl pb-6 pt-12"
  >
    <div class="flex items-center">
      <p class="text-slate-300">
        © {{ new Date().getFullYear() }} Eric Kelley | MMXII Live the Fourth
      </p>
    </div>
    <div class="flex gap-4 text-slate-300">
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
  </div>
</template>

<script setup lang="ts">
const social = [
  {
    name: "Github",
    url: "https://github.com/emkelley",
    icon: "skill-icons:github-dark",
  },
  {
    name: "Codepen",
    url: "https://codepen.com/emkelley",
    icon: "skill-icons:codepen-dark",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/ericmkelley",
    icon: "skill-icons:linkedin",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/0NEGUYY",
    icon: "skill-icons:twitter",
  },
  {
    name: "Email",
    url: "mailto:contact@emk.dev",
    icon: "ic:twotone-alternate-email",
  },
];
</script>

<style scoped></style>
