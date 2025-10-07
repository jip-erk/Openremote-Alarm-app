<script lang="ts">
  import type { SentAlarm } from "@openremote/model";
  import { AlarmSeverity, AlarmStatus } from "@openremote/model";
  import Clock from "@lucide/svelte/icons/clock-4";
  import LinkIcon from "@lucide/svelte/icons/link";
  import UserRound from "@lucide/svelte/icons/user-round";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { PageIndex } from "$lib/pages";
  import {
    formatSeverityLabel,
    formatStatusLabel,
    severityBadgeClass,
    statusBadgeClass,
    cn,
  } from "$lib/utils.js";
  import { appState, openRemoteService } from "$lib/store.svelte";

  dayjs.extend(relativeTime);

  const { alarm }: { alarm: SentAlarm } = $props();

  const createdRelative = $derived(dayjs(alarm.createdOn).fromNow());
  const severityClass = $derived(
    severityBadgeClass((alarm.severity as AlarmSeverity | null) ?? null)
  );
  const statusClass = $derived(
    statusBadgeClass((alarm.status as AlarmStatus | null) ?? null)
  );
  const assetCount = $derived(alarm.asset?.length ?? 0);
  function applyEllipsis(value: string, limit: number) {
    if (value.length <= limit) return { text: value, truncated: false };
    const shortened = value.slice(0, limit).trimEnd();
    return { text: `${shortened} (…)`, truncated: true };
  }

  const assigneeLabel = $derived(
    appState.assignees.find((option) => option.value === alarm.assigneeId)
      ?.label ?? "Unassigned"
  );

  const titleSource = $derived(
    (alarm.title?.trim() && alarm.title.trim()) || "Untitled alarm"
  );
  const titleDisplay = $derived(applyEllipsis(titleSource, 80));

  const descriptionSource = $derived(alarm.content?.trim() ?? "");
  const descriptionDisplay = $derived(applyEllipsis(descriptionSource, 200));

  const surfaceAccent = $derived(() => {
    switch (alarm.severity as AlarmSeverity) {
      case AlarmSeverity.HIGH:
        return "border-[var(--severity-high-fg)]/40 shadow-[0_10px_40px_-20px_var(--severity-high-fg)]";
      case AlarmSeverity.MEDIUM:
        return "border-[var(--severity-medium-fg)]/30 shadow-[0_10px_35px_-25px_var(--severity-medium-fg)]";
      default:
        return "border-border/50 shadow-[var(--shadow-soft)]";
    }
  });

  const handleNavigate = () => {
    openRemoteService.navigateTo(PageIndex.REPORT, alarm);
  };
</script>

<button
  type="button"
  onclick={handleNavigate}
  class={cn(
    "group focus-visible:ring-ring relative flex min-h-[200px] w-full flex-col justify-between gap-4 overflow-hidden rounded-3xl border bg-[var(--surface-glass)]/85 p-5 text-left transition-all hover:-translate-y-0.5 hover:bg-[var(--surface-elevated)]/95 focus-visible:ring-2 focus-visible:outline-none",
    surfaceAccent
  )}
>
  <div class="flex flex-col gap-3 pr-4">
    <div class="flex flex-wrap items-center gap-2">
      <span
        class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${severityClass}`}
      >
        {formatSeverityLabel(alarm.severity as AlarmSeverity | null)}
      </span>
      <span
        class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${statusClass}`}
      >
        {formatStatusLabel((alarm.status as AlarmStatus | null) ?? null)}
      </span>
    </div>
    <h3
      class="text-foreground line-clamp-2 text-xl leading-tight font-semibold break-words"
      title={titleDisplay.truncated ? titleSource : undefined}
    >
      {titleDisplay.text}
    </h3>
    {#if descriptionSource}
      <p
        class="text-muted-foreground line-clamp-3 overflow-hidden text-sm break-words"
        title={descriptionDisplay.truncated ? descriptionSource : undefined}
      >
        {descriptionDisplay.text}
      </p>
    {/if}
  </div>

  <div
    class="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 pr-4 text-xs"
  >
    <span class="flex items-center gap-1">
      <Clock class="size-4" />
      {createdRelative}
    </span>
    <span class="flex items-center gap-1">
      <LinkIcon class="size-4" />
      {assetCount} asset{assetCount === 1 ? "" : "s"}
    </span>
    <span class="flex items-center gap-1">
      <UserRound class="size-4" />
      {assigneeLabel}
    </span>
  </div>

  <span
    class="bg-accent absolute top-6 right-6 size-2 rounded-full opacity-50 shadow-[0_0_12px_var(--accent)] transition group-hover:opacity-100"
  ></span>
</button>
