<script setup lang="ts">
import { projects } from "@/data/projects";
useSeoMeta({
  title: "Eric Kelley - Full-Stack Software Developer",
  description:
    "From payment processing to network management, I build powerful, elegant web applications that customers love to use. Currently, I’m currently helping software development stay human at Studio Cadenza.",
});

defineOgImageStatic({
  component: "OgImage",
  backgroundColor: "bg-gradient-to-br from-blue-950 to-blue-800",
});
</script>

<template>
  <main class="flex flex-col justify-center align-middle">
    <div class="container mx-auto xl:px-24 lg:px-12 md:px-6 md:mt-24 px-3">
      <div class="">
        <h1 class="text-4xl md:text-6xl text-slate-100 py-8 text-center md:text-left">
          Hey there, I'm <span class="rainbow clip-text">Eric Kelley</span>
        </h1>
        <div class="mb-24 font-light">
          <p class="text-xl md:text-2xl text-slate-300 leading-relaxed tracking-wide">
            From payment processing to network management, I build powerful, elegant web
            applications that customers love to use. I’m currently helping software development stay
            human at
            <a href="https://studiocadenza.co/" class="px-0" target="_blank" rel="noreferrer">
              Studio Cadenza</a
            >
            and leading the development of
            <a href="https://sportscaster.com/" target="_blank" rel="noreferrer"> SportsCaster</a>.
          </p>
          <br />
          <p class="text-2xl text-slate-300 leading-relaxed tracking-wide">
            I am typically open to select freelance work, although I am not currently accepting new
            projects.
          </p>
        </div>
      </div>
      <div class="pb-24">
        <p
          class="text-2xl text-slate-300 leading-relaxed tracking-wide mt-24 md:text-left text-center mb-6 font-bold"
        >
          What I've been up to:
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
