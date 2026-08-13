<script setup lang="ts">
import { uses } from "@/data/uses";

useSeoMeta({
  title: "Uses - Eric Kelley",
  description: "The machines, tools, and software I actually reach for.",
});
</script>

<template>
  <div class="mb-24">
    <div class="sm:px-8 mt-8 sm:mt-12">
      <div class="container mx-auto xl:px-24 lg:px-12 md:px-6 px-4">
        <header>
          <p class="font-mono text-xs tracking-[0.22em] uppercase text-cyan mb-3">Uses</p>
          <h1 class="font-sans font-semibold text-4xl sm:text-5xl text-ink pb-4 leading-tight tracking-tight">
            Software I use, gadgets I love, and other things I recommend.
          </h1>
          <p class="mt-4 text-base text-muted max-w-2xl leading-relaxed">
            The machines, tools, and software I actually reach for. Not a wishlist. A working kit.
          </p>
        </header>
        <div class="mt-16 sm:mt-20">
          <div class="space-y-20">
            <section
              v-for="section in uses"
              :key="section.id"
              :aria-labelledby="section.id"
              class="md:border-l md:border-violet/25 md:pl-6"
            >
              <div class="grid grid-cols-1 items-baseline gap-y-8 md:grid-cols-4">
                <h2 :id="section.id" class="text-2xl font-semibold text-ink">
                  {{ section.title }}
                </h2>
                <div class="md:col-span-3">
                  <ul role="list" class="space-y-16">
                    <li
                      v-for="item in section.items"
                      :key="item.title"
                      class="group relative flex flex-col items-start"
                    >
                      <h3 class="text-lg font-semibold tracking-tight text-ink">
                        {{ item.title }}
                      </h3>
                      <p class="relative z-10 mt-2 text-muted">
                        {{ item.description }}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
