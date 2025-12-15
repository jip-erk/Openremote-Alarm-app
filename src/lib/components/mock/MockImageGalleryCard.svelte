<!-- 
// ==============================
// MOCK ONLY - IMAGE GALLERY CARD
// ==============================
-->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    Card,
    CardContent,
    CardHeader,
  } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { mockStorage } from "$lib/services/mock-storage.service";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import ImagePlus from "@lucide/svelte/icons/image-plus";

  export let alarmId: string | undefined = undefined;

  let images: string[] = [];
  let fileInput: HTMLInputElement;

  $: storageKey = alarmId
    ? `mock:alarm:${alarmId}:gallery`
    : "mock:alarm:draft:gallery";

  function loadImages() {
    images = mockStorage.get<string[]>(storageKey) || [];
  }

  function saveImages() {
    mockStorage.set(storageKey, images);
  }

  onMount(() => {
    loadImages();
  });

  $: if (alarmId) {
    loadImages();
  }

  export function save() {
    saveImages();
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      Array.from(target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === "string") {
            images = [...images, e.target.result];
            if (!alarmId) saveImages();
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInput) fileInput.value = "";
  }

  function removeImage(index: number) {
    images = images.filter((_, i) => i !== index);
    if (!alarmId) saveImages();
  }
</script>

<Card
  class="border-border/50 flex h-full flex-col border bg-[var(--surface-glass)]/50"
>
  <CardHeader>
    <h3
      class="text-foreground flex items-center justify-between leading-none font-semibold tracking-tight"
    >
      <span class="flex items-center gap-2">
        <ImagePlus class="size-5" />
        Image Gallery
      </span>
      <span
        class="border-border rounded border px-2 py-0.5 text-xs font-normal tracking-wider uppercase opacity-70"
        >Mock Only</span
      >
    </h3>
  </CardHeader>
  <CardContent class="flex flex-1 flex-col gap-4">
    {#if images.length === 0}
      <button
        type="button"
        class="border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50 flex min-h-32 w-full flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
        onclick={() => fileInput?.click()}
      >
        <ImagePlus class="text-muted-foreground mb-2 size-8" />
        <span class="text-muted-foreground text-sm">Add Image</span>
      </button>
    {:else}
      <div class="flex flex-1 flex-col gap-4">
        <div class="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-4">
          {#each images as img, i}
            <div
              class="group border-border bg-background relative aspect-square overflow-hidden rounded-lg border"
            >
              <img
                src={img}
                alt="Gallery {i}"
                class="h-full w-full object-cover"
              />
              <button
                class="bg-destructive text-destructive-foreground absolute top-1 right-1 rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                onclick={() => removeImage(i)}
                title="Remove image"
              >
                <Trash2 class="size-3" />
              </button>
            </div>
          {/each}

          <button
            type="button"
            class="border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50 flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
            onclick={() => fileInput?.click()}
          >
            <ImagePlus class="text-muted-foreground mb-2 size-6" />
            <span class="text-muted-foreground text-xs">Add Image</span>
          </button>
        </div>
      </div>
    {/if}

    <input
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      bind:this={fileInput}
      onchange={handleFileSelect}
    />
  </CardContent>
</Card>
