<template>
  <button @click="copyToClipboard">Copy</button>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { useClipboard } from "@vueuse/core";

export default defineComponent({
  setup() {
    const codeToCopy: Ref<string> = inject("codeToCopy", ref(""));

    const { copy, copied } = useClipboard();

    const copyToClipboard = () => {
      copy(codeToCopy.value);
      console.log(copied.value ? "Copied!" : "Failed to copy!");
    };

    return {
      copyToClipboard,
    };
  },
});
</script>
