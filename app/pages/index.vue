<script setup lang="ts">
import { projects } from "@/data/projects";

useSeoMeta({
  title: "Eric Kelley",
  description:
    "I build products people come back to, and the tools I wish existed at 1am. Leading TopCar and SportsCaster. Helping software stay human at Studio Cadenza.",
});
</script>

<template>
  <div class="home">
    <ClientOnly>
      <ThreeScene />
    </ClientOnly>

    <main class="stage">
      <div class="intro">
        <h1 class="enter enter-1 name">Eric Kelley</h1>
        <p class="enter enter-2 thesis">
          I build products people come back to, and the tools I wish existed at 1am.
        </p>
        <p class="enter enter-3 lede">
          Leading
          <a href="https://top.car/" target="_blank" rel="noreferrer">TopCar</a>
          and
          <a href="https://sportscaster.com/" target="_blank" rel="noreferrer">SportsCaster</a>.
          Helping software stay human at
          <a href="https://studiocadenza.co/" target="_blank" rel="noreferrer">Studio&nbsp;Cadenza</a>.
        </p>
      </div>

      <div class="enter enter-4 work">
        <a
          v-for="project in projects"
          :key="project.url"
          :href="project.url"
          target="_blank"
          rel="noreferrer"
          class="work-card"
        >
          <span class="work-tag">{{ project.tag }}</span>
          <span class="work-name">{{ project.name }}</span>
          <span class="work-desc">{{ project.description }}</span>
        </a>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.home {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.stage {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.5rem;
  width: 100%;
  max-width: 72rem;
  margin-inline: auto;
  padding: 6.5rem 1rem 7rem;
}

@media (min-width: 768px) {
  .stage {
    padding-inline: 2rem;
  }
}

@media (min-width: 960px) {
  .stage {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(16rem, 0.85fr);
    align-items: start;
    gap: 4rem 5rem;
    padding-top: 7rem;
  }
}

.name {
  font-family: "Saira Extra Condensed", sans-serif;
  font-weight: 800;
  font-size: clamp(3.5rem, 11vw, 6.75rem);
  line-height: 0.84;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ink);
  margin: 0 0 1.1rem;
}

.thesis {
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  font-weight: 600;
  line-height: 1.35;
  color: var(--ink);
  margin: 0 0 0.85rem;
  max-width: 32rem;
}

.lede {
  font-size: 1.05rem;
  line-height: 1.55;
  color: var(--muted);
  margin: 0;
  max-width: 38rem;
}

.lede a {
  color: var(--ink);
  text-decoration: underline;
  text-decoration-color: var(--cyan);
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
  transition: color 120ms ease, text-decoration-color 120ms ease, transform 140ms var(--ease-out);
}

.lede a:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .lede a:hover {
    color: var(--cyan);
    text-decoration-color: var(--cyan);
  }
}

.work {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.work-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.95rem 0;
  border-top: 1px solid rgba(142, 182, 232, 0.18);
  color: var(--ink);
  transition: transform 140ms var(--ease-out), border-color 180ms var(--ease-out);
}

.work-card:last-child {
  border-bottom: 1px solid rgba(142, 182, 232, 0.18);
}

.work-card:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .work-card:hover {
    border-color: var(--cyan);
  }

  .work-card:hover .work-name {
    color: var(--cyan);
  }
}

.work-tag {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cyan);
}

.work-name {
  font-family: "Saira Extra Condensed", sans-serif;
  font-size: 1.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1;
  transition: color 180ms var(--ease-out);
}

.work-desc {
  font-size: 0.92rem;
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

  .lede a:active,
  .work-card:active {
    transform: none;
  }
}
</style>
