<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    eyebrow: string;
    heading: string;
    lede: string;
    seoTitle: string;
    seoDescription: string;
    fallback?: string;
  }>(),
  { fallback: "Opening the bench…" }
);

useSeoMeta({
  title: props.seoTitle,
  description: props.seoDescription,
});
</script>

<template>
  <div class="page">
    <header class="intro">
      <nuxt-link to="/tools" class="back">Tools</nuxt-link>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 class="title">{{ heading }}</h1>
      <p class="lede">{{ lede }}</p>
    </header>

    <ClientOnly>
      <slot />
      <template #fallback>
        <p class="fallback">{{ fallback }}</p>
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.page {
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 6rem;
}

@media (min-width: 768px) {
  .page {
    padding: 2rem 2.5rem 7rem;
  }
}

.intro {
  margin-bottom: 2rem;
}

.back {
  display: inline-block;
  margin-bottom: 1.1rem;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color 120ms ease, transform 140ms var(--ease-out);
}

.back:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .back:hover {
    color: var(--ink);
  }
}

.eyebrow {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cyan);
  margin-bottom: 0.65rem;
}

.title {
  font-family: "Saira Extra Condensed", sans-serif;
  font-weight: 800;
  font-size: clamp(2.6rem, 7vw, 4.4rem);
  line-height: 0.88;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ink);
  margin: 0 0 0.85rem;
}

.lede {
  font-size: 1.05rem;
  line-height: 1.55;
  color: var(--muted);
  margin: 0;
  max-width: 34rem;
}

.fallback {
  margin: 0;
  padding: 4rem 0;
  color: var(--muted);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

@media (prefers-reduced-motion: reduce) {
  .back {
    transition: color 120ms ease;
  }

  .back:active {
    transform: none;
  }
}
</style>
