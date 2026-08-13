export function useFileDrop(onFile: (file: File) => void | Promise<void>) {
  const dragging = ref(false);
  const dragDepth = ref(0);

  onMounted(() => {
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("dragenter", onEnter);
    window.removeEventListener("dragover", onOver);
    window.removeEventListener("dragleave", onLeave);
    window.removeEventListener("drop", onDrop);
  });

  function onEnter(event: DragEvent) {
    if (!event.dataTransfer?.types.includes("Files")) return;
    dragDepth.value += 1;
    dragging.value = true;
  }

  function onOver(event: DragEvent) {
    if (!event.dataTransfer?.types.includes("Files")) return;
    event.preventDefault();
  }

  function onLeave() {
    dragDepth.value = Math.max(0, dragDepth.value - 1);
    if (dragDepth.value === 0) dragging.value = false;
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    dragging.value = false;
    dragDepth.value = 0;
    const file = event.dataTransfer?.files?.[0];
    if (file) void onFile(file);
  }

  return { dragging };
}

export function fileFromPaste(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;
  for (const item of items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}
