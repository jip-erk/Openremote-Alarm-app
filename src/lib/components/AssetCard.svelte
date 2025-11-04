<script lang="ts">
  import type { UserAssetLink } from "@openremote/model";
  import { AlarmStatus } from "@openremote/model";
  import Box from "@lucide/svelte/icons/box";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { PageIndex } from "$lib/pages";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { appState, openRemoteService } from "$lib/store.svelte";

  dayjs.extend(relativeTime);

  const { asset }: { asset: UserAssetLink } = $props();

  const relatedAlarms = $derived(
    appState.alarms.filter((alarm) =>
      alarm.asset?.some((assetLink) => assetLink.id === asset.id?.assetId)
    )
  );
  const openCount = $derived(
    relatedAlarms.filter((alarm) => alarm.status === AlarmStatus.OPEN).length
  );
  const inProgressCount = $derived(
    relatedAlarms.filter((alarm) => alarm.status === AlarmStatus.IN_PROGRESS)
      .length
  );

  const handleNavigate = () => {
    openRemoteService.navigateToAsset(PageIndex.ASSET, asset);

  };
</script>

<button type="button" onclick={handleNavigate}
  class="group border-border/50 hover:border-border flex flex-col gap-4 rounded-3xl border bg-[var(--surface-glass)]/80 p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-elevated)]/90"
>
  <header class="flex items-start justify-between gap-3">
    <div class="flex items-center gap-3">
      <div
        class="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl"
      >
        <Box class="size-5" />
      </div>
      <div class="flex flex-col">
        <span class="text-foreground text-sm font-semibold">
          {asset.assetName}
        </span>
        <span class="text-muted-foreground text-xs">
          Linked {dayjs(asset.createdOn).fromNow()}
        </span>
      </div>
    </div>
    <Badge variant="subtle" class="bg-primary/10 text-primary rounded-full">
      {relatedAlarms.length} alerts
    </Badge>
  </header>

  <div class="text-muted-foreground flex flex-wrap gap-3 text-xs">
    <span class="rounded-full bg-[var(--surface-elevated)] px-3 py-1">
      {openCount} open
    </span>
    <span class="rounded-full bg-[var(--surface-elevated)] px-3 py-1">
      {inProgressCount} in progress
    </span>
  </div>

  <div class="flex flex-wrap gap-2">
    {#each relatedAlarms as alarm (alarm.id)}
      <Button
        variant="outline"
        size="sm"
        class="border-border/60 text-foreground hover:border-primary/50 hover:bg-primary/10 rounded-full bg-transparent text-xs"
        onclick={() => {
          appState.selectedAlarm = alarm;
          openRemoteService.navigateTo(PageIndex.REPORT, alarm);
        }}
      >
        {alarm.title || "Untitled alarm"}
      </Button>
    {:else}
      <span class="text-sm text-muted-foreground">
        No alarms linked to this asset yet.
      </span>
    {/each}
  </div>
</button>
