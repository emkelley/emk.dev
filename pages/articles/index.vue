<template>
  <div>
    <main>
      <div
        v-if="blogContent"
        class="grid grid-cols-4 gap-4 w-full max-w-7xl mx-auto"
      >
        <article
          v-for="article in blogContent"
          :key="article._path"
          class="border-2 rounded-xl p-4"
        >
          <h1 class="text-xl text-teal-500 font-black">
            {{ article.title }}
          </h1>
          <p class="text-white py-4">{{ article.description }}</p>
          <nuxt-link :to="article._path" class="bg-teal-600 text-white p-2">
            Read
          </nuxt-link>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  loadBlogContent();
});

const blogContent = ref({} as any);

useHead({
  title: "Articles - Eric Kelley - Full-Stack Software Developer",
});

const loadBlogContent = async () => {
  const articles = await queryContent("articles")
    .only(["_path", "title", "description"])
    .find();

  blogContent.value = articles;
};
</script>
