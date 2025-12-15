<script lang="ts">
  import type { AlarmGroup } from "$lib/alarm-grouping";
  import AlarmCard from "$lib/components/AlarmCard.svelte";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { slide } from "svelte/transition";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";

  dayjs.extend(relativeTime);

  const { group }: { group: AlarmGroup } = $props();

  let expanded = $state(false);

  const toggle = () => {
    expanded = !expanded;
  };

  const latestTime = $derived(dayjs(group.latestTimestamp).fromNow());
</script>

<div class="flex flex-col gap-2">
  <div
    class="flex items-center justify-between rounded-3xl border bg-[var(--surface-glass)]/85 p-3 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:bg-[var(--surface-elevated)]/95"
  >
    <button class="flex flex-1 items-center gap-3 text-left" onclick={toggle}>
      <div
        class="bg-muted/50 text-muted-foreground flex size-8 items-center justify-center rounded-full"
      >
        {#if expanded}
          <ChevronDown class="size-4" />
        {:else}
          <ChevronRight class="size-4" />
        {/if}
      </div>

      <div class="flex flex-col">
        <span class="text-foreground line-clamp-1 text-sm font-medium">
          {group.title}
        </span>
        <div class="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{latestTime}</span>
          {#if group.description}
            <span class="hidden opacity-50 sm:inline-block">•</span>
            <span class="line-clamp-1 hidden max-w-[300px] sm:inline-block">
              {group.description}
            </span>
          {/if}
        </div>
      </div>
    </button>

    <div class="flex items-center gap-3 pr-2">
      <Badge variant="subtle" class="bg-primary/10 text-primary">
        {group.count}
      </Badge>
    </div>
  </div>

  {#if expanded}
    <div
      class="border-border/30 ml-4 flex flex-col gap-3 border-l-2 pl-4"
      transition:slide={{ duration: 200 }}
    >
      {#each group.items as alarm (alarm.id)}
        <AlarmCard {alarm} />
      {/each}
    </div>
  {/if}
</div>
