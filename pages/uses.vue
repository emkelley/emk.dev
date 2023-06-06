<script setup lang="ts">
const sections = [
  {
    id: "workstation",
    title: "Workstation",
    items: [
      {
        title: "Dev/Gaming Machine - 12900K, RTX 3070, 32GB RAM",
        description:
          "I've been gradually upgrading my computer over time, so it's kinda like a PC of Theseus now. As a developer, I've always got a bunch of servers running, Docker doing its thing in the background, and tons of browser tabs open. Moving from a 7700K to a 12900K was a huge step up, and the 3070 GPU is just awesome. I'm using 32GB of RAM right now, but I might bump it up to 64GB soon.",
      },
      {
        title: 'Alienware AW3418DW 34" (x2)',
        description:
          "Once you go Ultrawide, you never go back. So I got two. 3440x1440 @ 120Hz is the sweet spot for me for productivity and immersive gaming experiences. Will definitely upgrade to the new QD-OLED monitors when I can find a good excuse to do so.",
      },
      {
        title: "DROP CTRL Mechanical Keyboard",
        description:
          "I'm a bit of a keyboard hoarder, but this is my daily driver at the moment. Currently running Kaihua Box White switches (clicky) with HyperX Low-Profile PBT keycaps.",
      },
      {
        title: "Logitech G Pro X Superlight Mouse",
        description:
          "As a former Razer Deathadder user, I was skeptical to try out a Logitech mouse, but I'm glad I did. The G Pro X is a great mouse, extremely light, great battery life, and perfect tracking - albeit quite pricey.",
      },
      {
        title: "Herman Miller Aeron Chair",
        description:
          "If I’m going to slouch in the worst ergonomic position imaginable all day, I might as well do it in a nice chair. Do yourself a favor and buy one used from an office liquidator for a good deal.",
      },
    ],
  },
  {
    id: "development-tools",
    title: "Development tools",
    items: [
      {
        title: "Visual Studio Code",
        description:
          "Pretty self-explanatory. I use this for everything code-related for web projects. I also made my own theme that is pretty popular, you can check it out here!",
      },
      {
        title: "Windows Terminal",
        description:
          "Love the new terminal that Microsoft released with Windows 11. I use it for all my terminal needs because it's super easy to open terminals in different environments like Powershell, WSL, and Git Bash.",
      },
      {
        title: "GitKraken",
        description:
          "Yeah yeah yeah I know, I'm a heathen. I use a GUI for Git. I've used the command line frequently in the past, but at this point I just like to look at something pretty to visualize commit history.",
      },
    ],
  },
  {
    id: "design",
    title: "Design",
    items: [
      {
        title: "Figma",
        description:
          "I use Figma for literally everything I can for design work. If I need to do something more complex, I use Photoshop.",
      },
    ],
  },
];
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
            I get asked a lot about the things I use to build software, stay
            productive, or buy to fool myself into thinking I’m being productive
            when I’m really just procrastinating. Here’s a big list of all of my
            favorite stuff.
          </p>
        </header>
        <div class="mt-16 sm:mt-20">
          <div class="space-y-20">
            <section
              v-for="section in sections"
              :key="section.id"
              :aria-labelledby="section.id"
              class="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700"
            >
              <div
                class="grid grid-cols-1 items-baseline gap-y-8 md:grid-cols-4"
              >
                <h2
                  :id="section.id"
                  class="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
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
                        class="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100"
                      >
                        {{ item.title }}
                      </h3>
                      <p
                        class="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400"
                      >
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
