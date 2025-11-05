<script lang="ts">
  import type { UserAssetLink } from "@openremote/model";
  import { AlarmStatus } from "@openremote/model";
  import {
    getTypeInfoByKey,
    resolveTypeKeyFromLink,
    resolveTypeKeyFromAsset,
    type OrAssetLike,
  } from "$lib/asset-types";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { PageIndex } from "$lib/pages";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import {
    appState,
    openRemoteService,
    isConsoleAssetLink,
  } from "$lib/store.svelte";

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

  const typeKey = $derived(
    isConsoleAssetLink(asset)
      ? "console"
      : asset.id?.assetId && appState.assetTypeById[asset.id.assetId]
        ? resolveTypeKeyFromAsset({
            typeName: appState.assetTypeById[asset.id.assetId],
          } as OrAssetLike)
        : resolveTypeKeyFromLink(asset, false)
  );
  const typeInfo = $derived(getTypeInfoByKey(typeKey));

  const handleNavigate = () => {
    openRemoteService.navigateToAsset(PageIndex.ASSET, asset);
  };
</script>

<div
  role="button"
  tabindex="0"
  onclick={handleNavigate}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigate();
    }
  }}
  class="group border-border/50 hover:border-border focus:ring-primary/40 relative overflow-hidden rounded-3xl border bg-[var(--surface-glass)]/80 p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 focus:ring-2 focus:outline-none"
>
  <div
    class={`pointer-events-none absolute inset-0 z-0 rounded-3xl opacity-0 transition-opacity duration-200 ${typeInfo.colorClasses?.bg ?? "bg-primary/10"} group-hover:opacity-60`}
  ></div>
  <div class="relative z-10 flex flex-col gap-4">
    <header class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <div
          class={`flex size-11 items-center justify-center rounded-2xl ${typeInfo.colorClasses?.bg ?? "bg-primary/10"} ${typeInfo.colorClasses?.text ?? "text-primary"}`}
        >
          {#if typeInfo?.icon}
            <typeInfo.icon class="size-5" />
          {/if}
        </div>
        <div class="flex flex-col">
          <span class="text-foreground text-left text-sm font-semibold">
            {asset.assetName}
          </span>
          <span class="text-muted-foreground text-xs">
            Linked {dayjs(asset.createdOn).fromNow()}
          </span>
        </div>
      </div>
      <Badge
        variant="subtle"
        class={`rounded-full ${typeInfo.colorClasses?.bg ?? "bg-primary/10"} ${typeInfo.colorClasses?.text ?? "text-primary"}`}
      >
        {relatedAlarms.length} alarms
      </Badge>
    </header>

    <div class="text-muted-foreground flex flex-wrap gap-3 text-xs">
      <span
        class={`rounded-full px-3 py-1 ${typeInfo.colorClasses?.bg ?? "bg-primary/10"} ${typeInfo.colorClasses?.text ?? "text-primary"}`}
      >
        {openCount} open
      </span>
      <span
        class={`rounded-full px-3 py-1 ${typeInfo.colorClasses?.bg ?? "bg-primary/10"} ${typeInfo.colorClasses?.text ?? "text-primary"}`}
      >
        {inProgressCount} in progress
      </span>
    </div>

    <div class="flex flex-wrap gap-2">
      {#each relatedAlarms as alarm (alarm.id)}
        <Button
          variant="outline"
          size="sm"
          class="border-border/60 text-foreground hover:border-primary/50 hover:bg-primary/10 rounded-full bg-transparent text-xs"
          onclick={(e: MouseEvent) => {
            e.stopPropagation();
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
  </div>
</div>
