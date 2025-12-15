<script lang="ts">
  import { documentationSections } from "$lib/documentation-content";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { cn } from "$lib/utils.js";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import { openRemoteService } from "$lib/store.svelte";
  import { PageIndex } from "$lib/pages";

  let activeSectionId = $state(documentationSections[0].id);

  const activeSection = $derived(
    documentationSections.find((s) => s.id === activeSectionId) ||
      documentationSections[0]
  );

  const handleBack = () => {
    openRemoteService.navigateTo(PageIndex.ALARMS);
  };
</script>

<div class="flex h-[calc(100vh-12rem)] flex-col gap-6 pb-24">
  <div class="flex shrink-0 items-center gap-3">
    <Button variant="ghost" size="sm" class="gap-2" onclick={handleBack}>
      <ArrowLeft class="size-4" />
      Back to app
    </Button>
  </div>

  <div
    class="border-border/50 flex flex-1 flex-col gap-6 overflow-hidden rounded-3xl border bg-[var(--surface-glass)]/85 shadow-[var(--shadow-soft)] backdrop-blur-xl md:flex-row"
  >
    <!-- Left Navigation -->
    <aside
      class="border-border/50 bg-muted/30 hidden w-64 shrink-0 overflow-y-auto border-r p-4 md:block"
    >
      <nav class="flex flex-col gap-1">
        {#each documentationSections as section (section.id)}
          <button
            class={cn(
              "rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors",
              activeSectionId === section.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onclick={() => (activeSectionId = section.id)}
          >
            {section.title}
          </button>
        {/each}
      </nav>
    </aside>

    <!-- Mobile Navigation -->
    <div class="shrink-0 px-4 pt-4 md:hidden">
      <Select.Root type="single" bind:value={activeSectionId}>
        <Select.Trigger class="bg-background/50 w-full backdrop-blur-sm">
          {activeSection.title}
        </Select.Trigger>
        <Select.Content>
          {#each documentationSections as section (section.id)}
            <Select.Item value={section.id} label={section.title}>
              {section.title}
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-4 md:p-8">
      <div class="prose prose-sm dark:prose-invert mx-auto max-w-3xl">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html activeSection.content}
      </div>
    </main>
  </div>
</div>
