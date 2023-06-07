<template>
  <div>
    <main>
      <div
        class="bg-[#0139b3] flex flex-col gap-4 items-center justify-center rounded-b-3xl mb-12 py-24 text-white text-3xl font-bold"
      >
        Articles matching tag: {{ route.params.tag[0] }}
      </div>
      <div
        v-if="results.length >= 1"
        class="grid grid-cols-2 gap-4 w-full max-w-7xl mx-auto mt-24"
      >
        <article
          v-for="article in results"
          :key="article._path"
          class="border-2 border-slate-700 hover:border-blue-500 duration-200 rounded-md hover:rounded-xl p-6 py-8 cursor-pointer hover:bg-blue-500/10"
          @click="$router.push(article._path)"
        >
          <h1 class="text-xl text-blue-500 font-black">
            {{ article.title }}
          </h1>
          <p class="text-white py-4">{{ article.description }}</p>
          <div v-if="article.tags" class="flex gap-2 items-center">
            <p
              v-for="tag in article.tags"
              class="text-white bg-blue-500 py-1 flex items-center justify-center px-4 rounded-full text-sm z-50"
            >
              {{ tag }}
            </p>
          </div>
        </article>
      </div>
      <div v-else class="mb-96 mt-32 text-center">
        <div class="text-white text-3xl font-bold mb-12">
          No articles found.
        </div>
        <nuxt-link
          to="/articles"
          class="bg-blue-500 rounded-lg text-white px-4 py-1.5"
        >
          View all articles
        </nuxt-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  loadBlogContent();
});
const route = useRoute();
const results = ref([] as any);

useHead({
  title: "Articles - Eric Kelley - Full-Stack Software Developer",
});

const loadBlogContent = async () => {
  const articles = await queryContent("articles")
    .where({ tags: { $contains: route.params.tag[0] } })
    .only(["_path", "title", "description", "tags"])
    .find();
  console.log(articles);

  results.value = articles;
};
</script>
