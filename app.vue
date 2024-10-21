<template>
  <main>
    <NuxtLayout>
      <NuxtPage />
      <Footer />
    </NuxtLayout>
  </main>
</template>
<script setup lang="ts">
useHead({
  title: "Eric Kelley - Full-Stack Software Developer",
  meta: [
    {
      name: "description",
      content:
        "From payment processing to network management, I build powerful, elegant web applications that customers love to use. Currently, I’m currently helping software development stay human at Studio Cadenza.",
    },
  ],
});
</script>

<style lang="scss">
body {
  @apply bg-slate-900;
  font-family: "Fira Code", sans-serif;
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
/* ===== Scrollbar CSS ===== */
/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #3d5285 #0b111f;
}

/* Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 8px;
}
*::-webkit-scrollbar:hover {
  width: 16px;
}

*::-webkit-scrollbar-track {
  background: #0b111f;
}

*::-webkit-scrollbar-thumb {
  background-color: #3d5285;
  border-radius: 2px;
  border: 0px ridge #d0a4a4;
}
.rainbow-text {
  @apply text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-600;
}
.rainbow-bg {
  @apply bg-gradient-to-r from-blue-500 to-pink-600;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-in-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: scale(0.99);
}
</style>
