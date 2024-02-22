<script setup lang="ts">
import { uses } from "@/data/uses";
</script>
<template>
  <div class="mb-48">
    <div class="sm:px-8 mt-16 sm:mt-32">
      <div class="container mx-auto xl:px-24 lg:px-12 md:px-6 md: mt-24 px-3">
        <header class="">
          <h1
            class="text-6xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl rainbow pb-6"
          >
            Software I use, gadgets I love, and other things I recommend.
          </h1>
          <p class="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            I get asked a lot about the things I use to build software, stay productive, or buy to
            fool myself into thinking I’m being productive when I’m really just procrastinating.
            Here’s a big list of all of my favorite stuff.
          </p>
        </header>
        <div class="mt-16 sm:mt-20">
          <div class="space-y-20">
            <section
              v-for="section in uses"
              :key="section.id"
              :aria-labelledby="section.id"
              class="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700"
            >
              <div class="grid grid-cols-1 items-baseline gap-y-8 md:grid-cols-4">
                <h2
                  :id="section.id"
                  class="text-2xl font-semibold text-zinc-800 dark:text-zinc-100"
                >
                  {{ section.title }}
                </h2>
                <div class="md:col-span-3">
                  <ul role="list" class="space-y-16">
                    <li
                      v-for="item in section.items"
                      :key="item.title"
                      class="group relative flex flex-col items-start"
                    >
                      <h3
                        class="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100"
                      >
                        {{ item.title }}
                      </h3>
                      <p class="relative z-10 mt-2 text-zinc-600 dark:text-zinc-400">
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

<style scoped></style>
