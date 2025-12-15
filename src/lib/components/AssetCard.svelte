<script lang="ts">
  import type { UserAssetLink } from "@openremote/model";
  import { AlarmStatus } from "@openremote/model";
  import { groupAlarms } from "$lib/alarm-grouping";
  import { severityBadgeClass, cn } from "$lib/utils";
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
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import {
    appState,
    openRemoteService,
    isConsoleAssetLink,
  } from "$lib/store.svelte";

  dayjs.extend(relativeTime);

  const { asset }: { asset: UserAssetLink } = $props();

  const relatedAlarms = $derived(
    appState.alarms
      .filter((alarm) =>
        alarm.asset?.some((assetLink) => assetLink.id === asset.id?.assetId)
      )
      .filter((alarm) => {
        if (appState.showResolvedClosedAlarms) return true;
        return (
          alarm.status !== AlarmStatus.RESOLVED &&
          alarm.status !== AlarmStatus.CLOSED
        );
      })
  );
  const alarmGroups = $derived(groupAlarms(relatedAlarms));

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
  class="group border-border/50 hover:border-border focus:ring-primary/40 relative rounded-3xl border bg-[var(--surface-glass)]/80 p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 focus:ring-2 focus:outline-none"
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
      {#each alarmGroups as group (group.key)}
        {#if group.count === 1}
          <Button
            variant="outline"
            size="sm"
            class={cn(
              "border-border/60 text-foreground rounded-full bg-transparent text-xs",
              typeInfo.hoverClasses ??
                "hover:border-primary/50 hover:bg-primary/10"
            )}
            onclick={(e: MouseEvent) => {
              e.stopPropagation();
              appState.selectedAlarm = group.items[0];
              openRemoteService.navigateTo(PageIndex.REPORT, group.items[0]);
            }}
          >
            {group.title || "Untitled alarm"}
          </Button>
        {:else}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              {#snippet child({ props })}
                <Button
                  variant="outline"
                  size="sm"
                  class={cn(
                    "border-border/60 text-foreground flex items-center gap-2 rounded-full bg-transparent pr-1 text-xs",
                    typeInfo.hoverClasses ??
                      "hover:border-primary/50 hover:bg-primary/10"
                  )}
                  {...props}
                  onclick={(e: MouseEvent) => {
                    e.stopPropagation();
                    (props as any).onclick?.(e);
                  }}
                >
                  <span>{group.title || "Untitled alarm"}</span>
                  <Badge
                    variant="subtle"
                    class={cn(
                      "pointer-events-none flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px]",
                      typeInfo.colorClasses?.bg ?? "bg-primary/10",
                      typeInfo.colorClasses?.text ?? "text-primary"
                    )}
                  >
                    {group.count}
                  </Badge>
                </Button>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              align="start"
              class="border-border/50 flex max-h-[120px] w-64 flex-col gap-1 overflow-y-auto rounded-xl border bg-[var(--surface-glass)] p-1 shadow-xl backdrop-blur-md"
            >
              {#each group.items as alarm}
                <DropdownMenu.Item
                  class="outline-none"
                  onclick={() => {
                    appState.selectedAlarm = alarm;
                    openRemoteService.navigateTo(PageIndex.REPORT, alarm);
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    class="hover:bg-primary/10 h-auto w-full justify-start truncate px-3 py-2 text-left text-xs font-normal"
                  >
                    <div class="flex w-full flex-col gap-0.5 overflow-hidden">
                      <span class="truncate font-medium"
                        >{alarm.title || "Untitled"}</span
                      >
                      <span class="text-muted-foreground truncate text-[10px]"
                        >{dayjs(alarm.createdOn).fromNow()}</span
                      >
                    </div>
                  </Button>
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        {/if}
      {:else}
        <span class="text-sm text-muted-foreground">
          No alarms linked to this asset yet.
        </span>
      {/each}
    </div>
  </div>
</div>
