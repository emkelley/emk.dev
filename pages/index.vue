<script setup lang="ts">
import { projects } from "@/data/projects";
import ThreeScene from '@/components/ThreeScene.vue';
useSeoMeta({
  title: "Eric Kelley - Full-Stack Software Developer",
  description:
    "From payment processing to network management, I build powerful, elegant web applications that customers love to use. Currently, I’m currently helping software development stay human at Studio Cadenza.",
});

</script>

<template>
  <div>
    
  <ThreeScene />
  <!-- Ensure main container fills the screen height -->
  <main class="flex flex-col justify-center items-center min-h-screen relative z-10 p-4">
    <!-- Increased max-width for larger screens, centered container -->
    <div class="container max-w-4xl mx-auto xl:px-12 lg:px-8 md:px-6 px-6 py-16">
      <div class="text-left">
        <!-- Adjusted heading size and bottom margin -->
        <h1 class="text-4xl sm:text-5xl md:text-7xl text-slate-100 font-bold mb-6">
          Hey there, I'm <span class="rainbow clip-text">Eric Kelley</span>
        </h1>
        <!-- Adjusted paragraph spacing and text size/weight -->
        <div class="mb-12 space-y-4 font-normal">
          <p class="text-lg md:text-xl text-slate-300 leading-relaxed tracking-wide">
            From payment processing to network management, I build powerful, elegant web
            applications that customers love to use. I'm currently helping software development stay
            human at
            <a href="https://studiocadenza.co/" class="rainbow font-semibold" target="_blank" rel="noreferrer">
              Studio Cadenza</a
            >
            and leading the development of
            <a href="https://sportscaster.com/" class="rainbow font-semibold" target="_blank" rel="noreferrer"> SportsCaster</a>.
          </p>
          <p class="text-lg md:text-xl text-slate-300 leading-relaxed tracking-wide">
            I am typically open to select freelance work, although I am not currently accepting new
            projects.
          </p>
        </div>
      </div>
      <div class="pb-16">
        <!-- Adjusted heading size/margin and alignment -->
        <h2
          class="text-3xl text-slate-200 leading-relaxed tracking-wide mt-12 mb-6 font-semibold md:text-left text-center"
        >
          What I've been up to lately:
        </h2>
        <!-- Changed to flex column layout with gap -->
        <div class="flex flex-col gap-3 items-start">
          <a
            v-for="project in projects"
            :key="project.url"
            :href="project.url"
            target="_blank"
            rel="noreferrer"
            class="p-2 text-slate-200 hover:text-slate-50 text-lg transition-colors duration-200 ease-in-out inline-flex items-center"
          >
            <Icon :name="project.icon" class="mr-3 text-xl" />
            <span class="font-medium">{{ project.name }}</span>
          </a>
        </div>
      </div>
    </div>
  </main>
</div>
</template>

<style lang="scss" scoped>
/* Removed the global 'a' style, specific links use the 'rainbow' class directly */
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
