// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-08-13",
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      script: [
        {
          src: "https://plausible.emk.dev/js/script.js",
          type: "text/javascript",
          defer: true,
          "data-domain": "emk.dev",
        },
      ],
    },
  },
  css: ["~/assets/css/tailwind.css"],
  modules: ["@nuxtjs/tailwindcss", "@nuxt/fonts", "@nuxt/icon"],
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
  },
  runtimeConfig: {
    spotifyClient: process.env.SPOTIFY_CLIENT,
    spotifySecret: process.env.SPOTIFY_SECRET,
    spotifyRefreshToken: process.env.SPOTIFY_REFRESH,
    spotifyAccessToken: process.env.SPOTIFY_ACCESS,
    public: {},
  },
});
