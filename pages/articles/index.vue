<template>
  <main>
    <div
      class="bg-[#0139b3] flex flex-col gap-4 items-center justify-center rounded-b-3xl mb-12 py-12 px-4"
    >
      <h1
        class="text-5xl max-w-4xl px-8 mx-auto font-bold text-white text-center"
      >
        Articles
      </h1>
      <p
        class="text-slate-200 text-left md:text-center text-lg max-w-2xl mx-auto px-2"
      >
        Writing about my journey as a developer and other things I find
        interesting or useful as I work on projects. Released at a remarkably
        inconsistent pace. Started in mid 2023.
      </p>
      <div v-if="blogContent.tags" class="flex gap-2 items-center">
        <nuxt-link
          v-for="tag in blogContent.tags"
          class="text-white bg-blue-500 py-1 flex items-center justify-center px-4 rounded-full text-sm z-50"
          :to="`/articles/tags/${tag}`"
        >
          {{ tag }}
        </nuxt-link>
      </div>
    </div>
    <div
      v-if="blogContent"
      class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-7xl mx-auto mt-24 px-4"
    >
      <nuxt-link
        tag="article"
        v-for="article in blogContent"
        :key="article._path"
        class="border-2 border-slate-700 hover:border-blue-500 duration-500 rounded-md hover:rounded-xl p-6 py-8 cursor-pointer hover:bg-blue-500/10 group"
        :to="article._path"
      >
        <p class="text-white pb-4 text-xs opacity-70">
          Published on
          {{
            new Date(article.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          }}
        </p>
        <h1 class="text-xl text-blue-500 font-black">
          {{ article.title }}
        </h1>
        <p class="text-white py-4">{{ article.description }}</p>
        <div v-if="article.tags" class="flex gap-2 items-center">
          <p
            v-for="tag in article.tags"
            class="text-white bg-blue-500/30 group-hover:bg-blue-500 py-1 flex items-center justify-center px-4 rounded-full text-sm z-50 duration-500"
            :to="`/articles/tags/${tag}`"
          >
            {{ tag }}
          </p>
        </div>
      </nuxt-link>
    </div>
  </main>
</template>

<script setup lang="ts">
onMounted(() => {
  loadBlogContent();
});

const blogContent = ref({} as any);

useHead({
  title: "Articles - Eric Kelley - Full-Stack Software Developer",
});

const dateify = (date: string) => new Date(date).getMilliseconds();

const loadBlogContent = async () => {
  const articles = await queryContent("articles")
    .only(["_path", "title", "description", "tags", "createdAt"])
    .find();

  //sort articles by createdAt date string
  articles.sort((a, b) => dateify(b.createdAt) - dateify(a.createdAt));

  blogContent.value = articles;
};
</script>
