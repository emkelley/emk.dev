// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    "@nuxtjs/google-fonts",
    "@nuxt/content",
  ],
  googleFonts: {
    families: {
      "Space+Grotesk": true,
    },
  },
});
