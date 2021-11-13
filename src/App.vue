<template>
  <div class="grid place-items-center h-screen bg-gray-900">
    <div class="container mx-auto px-4">
      <h1 class="text-6xl text-white">
        Hey there, I'm <span class="rainbow clip-text">Eric Kelley</span>
      </h1>
      <br />
      <div class="mb-24">
        <p class="text-2xl text-white leading-relaxed tracking-wide">
          From payment processing to network management, I build powerful,
          elegant web applications that customers love to use. Currently, I’m
          currently helping software development stay human at
          <a href="https://dencap.com/" target="_blank" rel="noreferrer">
            DENCAP Dental.
          </a>
        </p>
        <br />
        <p class="text-2xl text-white leading-relaxed tracking-wide">
          In 2018, I co-founded
          <a
            href="https://neointeractive.dev/"
            target="_blank"
            rel="noreferrer"
          >
            Neo Interactive</a
          >, an independent video game studio currently developing our debut
          title,
          <a href="https://samuraizero.com/" target="_blank" rel="noreferrer"
            >Samurai Zero</a
          >; a third-person arena hack-n-slash game set in the beautiful science
          fantasy world of Edo.
        </p>
      </div>
      <div class="block text-gray-300">
        <a
          href="https://github.com/emkelley"
          target="_blank"
          rel="noreferrer"
          name="GitHub"
          class="transition hover:text-indigo-400"
        >
          <i class="fab mr-8 fa-xl rainbow fa-github"></i>
        </a>
        <a
          href="https://codepen.com/emkelley"
          target="_blank"
          rel="noreferrer"
          name="Codepen"
          class="transition hover:text-indigo-400"
        >
          <i class="fab mr-8 fa-xl rainbow fa-codepen"></i>
        </a>
        <a
          href="http://be.net/emkelley"
          target="_blank"
          rel="noreferrer"
          name="Behance"
          class="transition hover:text-indigo-400"
        >
          <i class="fab mr-8 fa-xl rainbow fa-behance"></i>
        </a>
        <a
          href="https://linkedin.com/in/ericmkelley"
          target="_blank"
          rel="noreferrer"
          name="LinkedIn"
          class="transition hover:text-indigo-400"
        >
          <i class="fab mr-8 fa-xl rainbow fa-linkedin"></i>
        </a>
        <a
          href="https://twitter.com/0NEGUYY"
          target="_blank"
          rel="noreferrer"
          name="Twitter"
          class="transition hover:text-indigo-400"
        >
          <i class="fab mr-8 fa-xl rainbow fa-twitter"></i>
        </a>
      </div>
      >
    </div>
  </div>
</template>

<style lang="scss">
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
