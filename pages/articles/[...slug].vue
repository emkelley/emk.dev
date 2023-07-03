<script setup lang="ts">
const route = useRoute();
const blogContent = ref({} as any);
const title = computed(
  () =>
    `${
      blogContent.value.title
        ? `${blogContent.value.title} - Eric Kelley - Full-Stack Software Developer`
        : "Eric Kelley - Full-Stack Software Developer"
    }`
);

useHead({
  title: title,
});

const loadBlogContent = async () => {
  const articles = await queryContent("articles")
    .where({ _path: route.path })
    .findOne();

  console.log(articles);

  blogContent.value = articles;
};

onMounted(() => {
  loadBlogContent();
});

const toc = computed(() => {
  if (!blogContent.value) return [];
  const items = blogContent.value.excerpt?.children;
  if (!items) return [];
  const toc: any[] = [];
  const tags = ["h1", "h2", "h3", "h4", "h5", "h6"];
  items.forEach((item: any) => {
    if (tags.includes(item.tag)) {
      toc.push({
        id: item.props.id,
        title: item.props.id.toString().replace(/-/g, " "),
        depth: Number(item.tag.replace(/h/g, "")),
      });
    }
  });

  return toc;
});
</script>

<template>
  <main>
    <ArticleHero
      v-if="blogContent"
      :title="blogContent.title"
      :publishDate="blogContent.createdAt"
      :tags="blogContent.tags"
    />

    <article
      class="mx-auto max-w-7xl relative grid grid-cols-12 gap-4 items-start text-slate-300"
    >
      <div
        v-if="blogContent"
        class="col-span-12 md:col-span-3 p-5 sticky top-24 rounded-md bg-[#0b111e] text-slate-400 hidden lg:block"
      >
        <h2 class="font-bold mb-4 text-lg text-slate-200">Table Of Contents</h2>
        <ul class="space-y-2">
          <template v-for="(t, k) in toc" :key="`toc-item-${k}`">
            <li>
              <NuxtLink
                :class="{
                  'text-sm ml-4': t.depth == 2,
                  'text-[13px] ml-6': t.depth > 2,
                }"
                class="capitalize font-semibold hover:text-blue-500 duration-100"
                :to="`#${t.id}`"
              >
                {{ t.title }}
              </NuxtLink>
            </li>
          </template>
        </ul>
      </div>
      <div class="px-6 col-span-12 md:col-span-9 mt-0">
        <ClientOnly>
          <div class="prose">
            <ContentRenderer class="prose" :value="blogContent">
              <template #empty>
                <p class="text-lg text-white">No content found.</p>
              </template>
            </ContentRenderer>
          </div>
          <ArticleTags
            v-if="blogContent"
            :tags="blogContent.tags"
            theme="blue"
          />
        </ClientOnly>
      </div>
    </article>
  </main>
</template>

<style scoped>
article {
  font-family: "Inter", sans-serif;
}
</style>
