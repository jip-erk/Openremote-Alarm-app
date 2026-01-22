<script lang="ts">
  import type { AlarmGroup } from "$lib/alarm-grouping";
  import { AlarmStatus } from "@openremote/model";
  import AlarmCard from "$lib/components/AlarmCard.svelte";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import MoreVertical from "@lucide/svelte/icons/more-vertical";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { openRemoteService } from "$lib/store.svelte";
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

  const updateGroupStatus = async (status: AlarmStatus) => {
    try {
      await Promise.all(
        group.items.map((alarm) => {
          if (alarm.id) {
            return openRemoteService.updateAlarm(alarm.id, {
              ...alarm,
              status,
            });
          }
        })
      );
      // Refresh alarms to reflect changes
      await openRemoteService.fetchAlarms();
    } catch (error) {
      console.error("Failed to update group status:", error);
    }
  };
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
            <div class="flex flex-1 items-center justify-center gap-2">
              <span class="hidden opacity-50 sm:inline-block">•</span>
              <span class="line-clamp-1 hidden w-full sm:inline-block">
                {group.description}
              </span>
            </div>
          {/if}
        </div>
      </div>
    </button>

    <div class="flex items-center gap-3 pr-2">
      <Badge variant="subtle" class="bg-primary/10 text-primary">
        {group.count}
      </Badge>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              variant="ghost"
              size="icon"
              class="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
              {...props}
            >
              <MoreVertical class="size-4" />
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-48">
          <DropdownMenu.Label>Set status for all</DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            onclick={() => updateGroupStatus(AlarmStatus.OPEN)}
          >
            Open
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onclick={() => updateGroupStatus(AlarmStatus.IN_PROGRESS)}
          >
            In Progress
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onclick={() => updateGroupStatus(AlarmStatus.ACKNOWLEDGED)}
          >
            Acknowledged
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onclick={() => updateGroupStatus(AlarmStatus.RESOLVED)}
          >
            Resolved
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onclick={() => updateGroupStatus(AlarmStatus.CLOSED)}
          >
            Closed
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
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
