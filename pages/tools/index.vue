<script setup lang="ts">
import { tools } from "@/data/tools";

useSeoMeta({
  title: "Tools - Eric Kelley",
  description: "Small utilities I built because I needed them. Start with SVG Export.",
});
</script>

<template>
  <div class="tools">
    <header class="intro">
      <p class="enter enter-1 eyebrow">Tools</p>
      <h1 class="enter enter-2 title">The ones I wish existed at 1am.</h1>
      <p class="enter enter-3 lede">
        Small utilities that run in your browser. No accounts. No upload to a server.
      </p>
    </header>

    <div class="enter enter-4 list">
      <nuxt-link
        v-for="tool in tools"
        :key="tool.slug"
        :to="`/tools/${tool.slug}`"
        class="tool-card"
      >
        <span class="tool-tag">{{ tool.tag }}</span>
        <span class="tool-name">{{ tool.name }}</span>
        <span class="tool-desc">{{ tool.description }}</span>
      </nuxt-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tools {
  width: 100%;
  max-width: 46rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 6rem;
}

@media (min-width: 768px) {
  .tools {
    padding: 2.5rem 2.5rem 7rem;
  }
}

.eyebrow {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cyan);
  margin-bottom: 0.75rem;
}

.title {
  font-family: "Saira Extra Condensed", sans-serif;
  font-weight: 800;
  font-size: clamp(2.8rem, 8vw, 4.6rem);
  line-height: 0.88;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ink);
  margin: 0 0 1rem;
}

.lede {
  font-size: 1.05rem;
  line-height: 1.55;
  color: var(--muted);
  margin: 0;
  max-width: 32rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 2.75rem;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 1.05rem 0;
  border-top: 1px solid rgba(142, 182, 232, 0.18);
  color: var(--ink);
  transition: transform 140ms var(--ease-out), border-color 180ms var(--ease-out);
}

.tool-card:last-child {
  border-bottom: 1px solid rgba(142, 182, 232, 0.18);
}

.tool-card:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .tool-card:hover {
    border-color: var(--cyan);
  }

  .tool-card:hover .tool-name {
    color: var(--cyan);
  }
}

.tool-tag {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cyan);
}

.tool-name {
  font-family: "Saira Extra Condensed", sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1;
  transition: color 180ms var(--ease-out);
}

.tool-desc {
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--muted);
  margin-top: 0.15rem;
}

.enter {
  animation: enter 220ms var(--ease-out) both;
}

.enter-1 {
  animation-delay: 0ms;
}
.enter-2 {
  animation-delay: 50ms;
}
.enter-3 {
  animation-delay: 100ms;
}
.enter-4 {
  animation-delay: 150ms;
}

@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .enter {
    animation: enter-fade 200ms var(--ease-out) both;
  }

  @keyframes enter-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .tool-card:active {
    transform: none;
  }
}
</style>
