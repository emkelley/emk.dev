// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
  modules: [
    "@nuxt/devtools",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/google-fonts",
    "nuxt-icon",
  ],
  googleFonts: {
    display: "swap",
    families: {
      "Saira Extra Condensed": [600, 700, 800],
      "Source Sans 3": [400, 500, 600, 700],
      "IBM Plex Mono": [400, 500],
    },
  },
  runtimeConfig: {
    // Private keys are only available on the server
    spotifyClient: process.env.SPOTIFY_CLIENT,
    spotifySecret: process.env.SPOTIFY_SECRET,
    spotifyRefreshToken: process.env.SPOTIFY_REFRESH,
    spotifyAccessToken: process.env.SPOTIFY_ACCESS,

    // Public keys that are exposed to the client
    public: {},
  },
});
