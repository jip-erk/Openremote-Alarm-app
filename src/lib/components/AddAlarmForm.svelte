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
  import type { Alarm, Asset } from "@openremote/model";
  import { AlarmSeverity, AlarmStatus, AlarmSource } from "@openremote/model";
  import type { SentAlarm } from "@openremote/model";
  import { appState, openRemoteService } from "$lib/store.svelte";
  import * as Select from "$lib/components/ui/select/index.js";

  const { currentAlarm }: { currentAlarm?: SentAlarm } = $props();

  let alarm = $state<Alarm>({
    title: currentAlarm?.title || "",
    content: currentAlarm?.content || "",
    severity: currentAlarm?.severity || AlarmSeverity.LOW,
    status: currentAlarm?.status || AlarmStatus.OPEN,
    realm: "master",
    source: AlarmSource.MANUAL,
    assigneeId: currentAlarm?.assigneeId || undefined,
  });

  const handleSubmit = async () => {
    if (currentAlarm?.id) {
      const sentAlarm: SentAlarm = {
        ...currentAlarm,
        ...alarm,
      };

      await openRemoteService.updateAlarm(
        currentAlarm.id,
        sentAlarm,
        linkedAssets
      );
    } else {
      await openRemoteService.addAlarm(alarm, linkedAssets);
    }
    openRemoteService.navigateTo(0);
  };

  let linkedAssets = $state<string[]>(
    currentAlarm?.asset
      ?.map((a) => a.id)
      .filter((id): id is string => id !== undefined) || []
  );
</script>

<div class="p-4">
  <div class="p-2 w-full flex flex-col gap-2 rounded-md ring-primary">
    <label>
      Title
      <input
        type="text"
        bind:value={alarm.title}
        placeholder="Title"
        class="w-full bg-primary/20 rounded-md p-2 outline-none"
      />
    </label>
    <label>
      Content
      <textarea
        bind:value={alarm.content}
        placeholder="Content"
        class="w-full bg-primary/20 rounded-md p-2 outline-none mt-2 resize-none"
      ></textarea>
    </label>
    <label>
      Severity
      <Select.Root
        type="single"
        name="favoriteFruit"
        bind:value={alarm.severity}
      >
        <Select.Trigger class="w-full">
          {alarm.severity}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Severity</Select.Label>
            {#each Object.values(severities) as status (status)}
              <Select.Item value={status} label={status}>
                {status}
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </label>
    <label>
      Status
      <Select.Root type="single" name="favoriteFruit" bind:value={alarm.status}>
        <Select.Trigger class="w-full">
          {alarm.status}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Status</Select.Label>
            {#each Object.values(statuses) as status (status)}
              <Select.Item value={status} label={status}>
                {status}
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </label>
    <label>
      Assignee
      <Select.Root
        type="single"
        name="favoriteFruit"
        bind:value={alarm.assigneeId}
      >
        <Select.Trigger class="w-full">
          {alarm.assigneeId
            ? (appState.assignees.find((a) => a.value === alarm.assigneeId)
                ?.label ?? "None")
            : "None"}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Assignee</Select.Label>
            {#each appState.assignees as assignee}
              <Select.Item value={assignee.value || ""} label={assignee.label}>
                {assignee.label}
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </label>
    <label>
      Linked assets ({linkedAssets.length})
      <Select.Root
        type="multiple"
        name="favoriteFruit"
        bind:value={linkedAssets}
      >
        <Select.Trigger class="w-full">
          {appState.assets
            .filter(
              (a) => a?.id?.assetId && linkedAssets.includes(a.id?.assetId)
            )
            .map((a) => a.assetName)
            .join(", ") || "Select assets"}</Select.Trigger
        >
        <Select.Content>
          <Select.Group>
            <Select.Label>Assets</Select.Label>
            {#each appState.assets as asset}
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
    </label>
    <button class="p-2 bg-primary text-white rounded-md" onclick={handleSubmit}
      >{appState.selectedAlarm ? "Update" : "Add"}</button
    >
  </div>
</div>
