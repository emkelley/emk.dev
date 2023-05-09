<script setup lang="ts">
definePageMeta({
  layout: "default",
});
const projects = [
  {
    name: "0NEGUY Cinematics - SaaS",
    url: "https://oneguy.io",
    icon: "skill-icons:nuxtjs-dark",
    repo: "",
  },
  {
    name: "NeedAnything - Marketing Site",
    url: "https://needanything.com/",
    icon: "skill-icons:nuxtjs-dark",
    repo: "",
  },
  {
    name: "FanLabel - Web Challenges Site",
    url: "https://challenges.fanlabel.com",
    icon: "skill-icons:vuejs-dark",
    repo: "",
  },
  {
    name: "Samurai Zero - Marketing Site",
    url: "https://samuraizero.com",
    icon: "skill-icons:vuejs-dark",
    repo: "",
  },
  {
    name: "Neo Interactive - Marketing Site",
    url: "https://neointeractive.dev",
    icon: "skill-icons:svelte",
    repo: "",
  },
  {
    name: "Healthy Michigan Dental - Marketing Site",
    url: "https://hmidental.com",
    icon: "skill-icons:vuejs-dark",
    repo: "",
  },
  {
    name: "Midnight Synth - VS Code Theme",
    url: "https://marketplace.visualstudio.com/items?itemName=ekelley.midnight-synth",
    icon: "skill-icons:vscode-dark",
    repo: "https://github.com/emkelley/midnight-synth",
  },
  {
    name: "GI Updates - Marketing Site",
    url: "https://giupdates.tv",
    icon: "skill-icons:vuejs-dark",
    repo: "",
  },
  {
    name: "Personal Site",
    url: "https://desktop.emk.dev",
    icon: "skill-icons:nuxtjs-dark",
    repo: "",
  },
];
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
<template>
  <main class="flex flex-col justify-center align-middle">
    <div class="container mx-auto xl:px-24 lg:px-12 md:px-6 md: mt-24 px-3">
      <div class="">
        <h1 class="text-6xl text-slate-100 py-8">
          Hey there, I'm <span class="rainbow clip-text">Eric Kelley</span>
        </h1>
        <div class="mb-24 font-light">
          <p class="text-2xl text-slate-300 leading-relaxed tracking-wide">
            From payment processing to network management, I build powerful,
            elegant web applications that customers love to use. I’m currently
            helping software development stay human at
            <a
              href="https://studiocadenza.co/"
              target="_blank"
              rel="noreferrer"
            >
              Studio Cadenza.
            </a>
          </p>
          <br />
          <p class="text-2xl text-slate-300 leading-relaxed tracking-wide">
            In 2019, I co-founded
            <a
              href="https://neointeractive.dev/"
              target="_blank"
              rel="noreferrer"
            >
              Neo Interactive
            </a>
            - an independent video game studio currently developing our debut
            title,
            <a href="https://samuraizero.com/" target="_blank" rel="noreferrer"
              >Samurai Zero</a
            >; a third-person arena hack-n-slash game set in the beautiful
            science fantasy world of Edo.
          </p>
          <br />
          <p class="text-2xl text-slate-300 leading-relaxed tracking-wide">
            I am typically open to select freelance work, although I am not
            currently accepting new projects.
          </p>
        </div>
      </div>
      <div class="pb-24">
        <p
          class="text-2xl text-slate-300 leading-relaxed tracking-wide mt-24 md:text-left text-center mb-6 font-bold"
        >
          Recent Projects
        </p>
        <div class="flex flex-row flex-wrap">
          <a
            v-for="project in projects"
            :key="project.url"
            :href="project.url"
            target="_blank"
            rel="noreferrer"
            class="xl:w-1/3 md:w-1/2 w-full p-2 text-slate-50 text-lg"
          >
            <Icon :name="project.icon" class="mr-2" />
            {{ project.name }}
          </a>
        </div>
      </div>
      <div class="flex flex-row w-full justify-between">
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
    </div>
  </main>
</template>

<style lang="scss" scoped>
a {
  @apply rainbow;
}
.rainbow {
  -webkit-animation: rainbow 8s ease infinite;
  animation: rainbow 8s ease infinite;
  background-image: linear-gradient(124deg, #ff470f, #ff3860, #b86bff, #3273dc);
  background-size: 800% 800%;
  font-weight: bold;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@-webkit-keyframes rainbow {
  0% {
    background-position: 1% 80%;
  }
  50% {
    background-position: 99% 20%;
  }
  100% {
    background-position: 1% 80%;
  }
}

@keyframes rainbow {
  0% {
    background-position: 1% 80%;
  }
  50% {
    background-position: 99% 20%;
  }
  100% {
    background-position: 1% 80%;
  }
}
</style>
