<script module lang="ts">
  const severities = [
    AlarmSeverity.LOW,
    AlarmSeverity.MEDIUM,
    AlarmSeverity.HIGH,
  ];

  const statuses = [
    AlarmStatus.OPEN,
    AlarmStatus.ACKNOWLEDGED,
    AlarmStatus.RESOLVED,
    AlarmStatus.CLOSED,
  ];
</script>

<script lang="ts">
  import type { Alarm } from "@openremote/model";
  import { AlarmSeverity, AlarmStatus, AlarmSource } from "@openremote/model";
  import type { SentAlarm } from "@openremote/model";
  import { appState, openRemoteService, isConsoleAssetLink } from "$lib/store.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
  } from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import {
    formatSeverityLabel,
    formatStatusLabel,
    severityBadgeClass,
    statusBadgeClass,
  } from "$lib/utils.js";

  const { currentAlarm, onRemove } = $props<{
    currentAlarm?: SentAlarm;
    onRemove?: () => void;
  }>();

  let alarm = $state<Alarm>({
    title: currentAlarm?.title || "",
    content: currentAlarm?.content || "",
    severity: currentAlarm?.severity || AlarmSeverity.LOW,
    status: currentAlarm?.status || AlarmStatus.OPEN,
    realm: "master",
    source: AlarmSource.MANUAL,
    assigneeId: currentAlarm?.assigneeId || undefined,
  });

  const initialLinkedAssets: string[] = [];
  if (currentAlarm?.asset) {
    for (const asset of currentAlarm.asset) {
      const rawId = (asset as { id?: string | { assetId?: string } }).id;
      const resolvedId =
        typeof rawId === "string"
          ? rawId
          : typeof rawId?.assetId === "string"
            ? rawId.assetId
            : undefined;
      if (resolvedId) {
        initialLinkedAssets.push(resolvedId);
      }
    }
  }

  let linkedAssets = $state<string[]>(initialLinkedAssets);

  const filteredLinks = $derived(
    appState.assets.filter((link) =>
      appState.showConsoleAssets ? true : !isConsoleAssetLink(link)
    )
  );

  const linkedAssetNames = $derived(
    filteredLinks
      .filter(
        (asset) => asset.id?.assetId && linkedAssets.includes(asset.id.assetId)
      )
      .map((asset) => asset.assetName)
  );

  const submitLabel = $derived(currentAlarm ? "Update alarm" : "Create alarm");

  const canSubmit = $derived(() => (alarm.title ?? "").trim().length > 0);

  let submitting = $state(false);

  const handleSubmit = async (event?: SubmitEvent) => {
    event?.preventDefault();
    if (!canSubmit || submitting) return;
    submitting = true;
    try {
      if (currentAlarm?.id) {
        const sentAlarm: SentAlarm = {
          ...currentAlarm,
          ...alarm,
        };

        await openRemoteService.updateAlarm(currentAlarm.id, sentAlarm);
      } else {
        await openRemoteService.addAlarm(alarm, linkedAssets);
      }
      openRemoteService.navigateTo(0);
    } finally {
      submitting = false;
    }
  };
</script>

<div class="flex flex-col gap-6">
  <Card class="border-border/50 border bg-[var(--surface-elevated)]/50">
    <CardHeader class="space-y-3">
      <div class="flex flex-wrap gap-3">
        <Badge
          variant="subtle"
          class={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${severityBadgeClass(
            alarm.severity as AlarmSeverity
          )}`}
        >
          {formatSeverityLabel(alarm.severity as AlarmSeverity)}
        </Badge>
        <Badge
          variant="subtle"
          class={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${statusBadgeClass(
            alarm.status as AlarmStatus
          )}`}
        >
          {formatStatusLabel(alarm.status as AlarmStatus)}
        </Badge>
        <Badge variant="muted" class="rounded-full">
          {linkedAssets.length} linked asset{linkedAssets.length === 1
            ? ""
            : "s"}
        </Badge>
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="text-foreground text-xl font-semibold">{submitLabel}</h3>
        <p class="text-muted-foreground text-sm">
          Provide alarm details, severity, assignee, and any linked assets.
        </p>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      {#if linkedAssetNames.length > 0}
        <div class="text-muted-foreground flex flex-wrap gap-2 text-xs">
          {#each appState.assets.filter((asset) => asset.id?.assetId && linkedAssets.includes(asset.id.assetId)) as asset (asset.id?.assetId)}
            <span class="rounded-full bg-[var(--surface-glass)] px-3 py-1">
              {asset.assetName}
            </span>
          {/each}
        </div>
      {/if}
    </CardContent>
  </Card>

  <form class="space-y-6" onsubmit={handleSubmit}>
    <div class="grid gap-5">
      <div class="space-y-2">
        <Label for="alarm-title">Title</Label>
        <Input
          id="alarm-title"
          name="title"
          placeholder="Alarm title"
          bind:value={alarm.title}
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="alarm-content">Description</Label>
        <Textarea
          id="alarm-content"
          name="content"
          placeholder="Describe the context and impact"
          bind:value={alarm.content}
          rows={5}
        ></Textarea>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <div class="space-y-2">
          <Label>Severity</Label>
          <Select.Root type="single" bind:value={alarm.severity}>
            <Select.Trigger
              class="border-border/60 w-full rounded-2xl border bg-[var(--surface-glass)]/80 px-4 py-3 text-sm"
            >
              {formatSeverityLabel(alarm.severity as AlarmSeverity)}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Severity</Select.Label>
                {#each severities as severity (severity)}
                  <Select.Item
                    value={severity}
                    label={formatSeverityLabel(severity)}
                  >
                    {formatSeverityLabel(severity)}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>

        <div class="space-y-2">
          <Label>Status</Label>
          <Select.Root type="single" bind:value={alarm.status}>
            <Select.Trigger
              class="border-border/60 w-full rounded-2xl border bg-[var(--surface-glass)]/80 px-4 py-3 text-sm"
            >
              {formatStatusLabel(alarm.status as AlarmStatus)}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Status</Select.Label>
                {#each statuses as status (status)}
                  <Select.Item value={status} label={formatStatusLabel(status)}>
                    {formatStatusLabel(status)}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <div class="space-y-2">
          <Label>Assignee</Label>
          <Select.Root type="single" bind:value={alarm.assigneeId}>
            <Select.Trigger
              class="border-border/60 w-full rounded-2xl border bg-[var(--surface-glass)]/80 px-4 py-3 text-sm"
            >
              {alarm.assigneeId
                ? (appState.assignees.find(
                    (assignee) => assignee.value === alarm.assigneeId
                  )?.label ?? "None")
                : "None"}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Assignee</Select.Label>
                {#each appState.assignees as assignee (assignee.label)}
                  <Select.Item
                    value={assignee.value || ""}
                    label={assignee.label}
                  >
                    {assignee.label}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>

        <div class="space-y-2">
          <Label>Linked assets</Label>
          <Select.Root type="multiple" bind:value={linkedAssets}>
            <Select.Trigger
              class="border-border/60 w-full rounded-2xl border bg-[var(--surface-glass)]/80 px-4 py-3 text-sm"
            >
              {linkedAssetNames.join(", ") || "Select assets"}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Assets</Select.Label>
                {#each filteredLinks as asset (asset.id?.assetId)}
                  <Select.Item
                    value={asset.id?.assetId ?? ""}
                    label={asset.assetName}
                  >
                    {asset.assetName}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </div>

    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-muted-foreground text-xs">
        Alarm will be synced immediately through OpenRemote. You can update or
        resolve it later from the report page.
      </p>
      <div class="flex items-center gap-2">
        {#if currentAlarm?.id && onRemove}
          <Button
            type="button"
            variant="outline"
            class="text-destructive border-destructive/30 hover:text-destructive hover:border-destructive gap-2"
            onclick={onRemove}
          >
            <Trash2 class="size-4" />
            Remove alarm
          </Button>
        {/if}
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  </form>
</div>
