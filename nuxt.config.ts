// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      script: [
        {
          type: "text/javascript",
          innerHTML: `
                <script src="https://cdn.usefathom.com/script.js" data-site="YRVLFDYM" defer></script>
          `,
        },
      ],
    },
  },
  modules: [
    "@nuxt/devtools",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/google-fonts",
    "@nuxt/content",
    "nuxt-og-image",
    "nuxt-icon",
  ],
  googleFonts: {
    families: {
      "Space+Grotesk": true,
      Radix: true,
    },
  },
  content: {
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3,
      },
    },
    highlight: {
      theme: "dracula-soft",
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
