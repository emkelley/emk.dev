// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      script: [
        {
          type: "text/javascript",
          innerHTML: `
          (function(f, a, t, h, o, m){
            a[h]=a[h]||function(){
              (a[h].q=a[h].q||[]).push(arguments)
            };
            o=f.createElement('script'),
            m=f.getElementsByTagName('script')[0];
            o.async=1; o.src=t; o.id='fathom-script';
            m.parentNode.insertBefore(o,m)
          })(document, window, '//stats.emk.dev/tracker.js', 'fathom');
          fathom('set', 'siteId', 'LWCOI');
          fathom('trackPageview');`,
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
