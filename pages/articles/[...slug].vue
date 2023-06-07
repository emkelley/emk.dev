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
    <div
      class="bg-[#0139b3] flex flex-col gap-4 items-center justify-center rounded-b-3xl mb-12 py-12"
    >
      <h1
        class="text-5xl max-w-4xl px-8 mx-auto font-bold text-white text-center"
      >
        {{ blogContent.title }}
      </h1>
      <p class="text-slate-200 text-center">
        Published:
        {{
          new Date(blogContent.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
        }}
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

    <article
      class="mx-auto max-w-7xl relative grid grid-cols-12 gap-4 items-start text-slate-300"
    >
      <div
        v-if="blogContent"
        class="col-span-12 md:col-span-3 p-5 sticky top-8 rounded-md bg-[#0b111e] text-slate-300 hidden lg:block"
      >
        <h2 class="font-bold mb-4 uppercase">Table Of Contents</h2>
        <ul class="space-y-2">
          <template v-for="(t, k) in toc" :key="`toc-item-${k}`">
            <li>
              <NuxtLink
                :class="{
                  'text-sm ml-4': t.depth == 2,
                  'text-[13px] ml-6': t.depth > 2,
                }"
                class="capitalize"
                :to="`#${t.id}`"
              >
                {{ t.title }}
              </NuxtLink>
            </li>
          </template>
        </ul>
      </div>
      <div class="px-6 col-span-12 md:col-span-9">
        <ClientOnly>
          <div class="prose">
            <ContentRenderer class="prose" :value="blogContent">
              <template #empty>
                <p class="text-lg text-white">No content found.</p>
              </template>
            </ContentRenderer>
          </div>
        </ClientOnly>
      </div>
    </article>
  </main>
</template>
