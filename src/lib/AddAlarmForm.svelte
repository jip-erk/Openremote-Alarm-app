<script lang="ts">
  import type { Alarm } from "@openremote/model";
  import { AlarmSeverity, AlarmStatus } from "@openremote/model";

  const props = $props<{ addAlarm: (alarm: Alarm) => Promise<void> }>();

  let alarm = $state<Alarm>({
    title: "",
    content: "",
    severity: AlarmSeverity.LOW,
    status: AlarmStatus.OPEN,
    alarmAssetLinks: [],
    loaded: true,
    previousAssetLinks: [],
    realm: "master",
    source: "MANUAL",
  });
</script>

<div class="p-4">
  <div class="p-2 bg-primary/20 ring-1 w-full rounded-md ring-primary">
    <input
      type="text"
      bind:value={alarm.title}
      placeholder="Title"
      class="w-full p-2 bg-transparent outline-none"
    />
    <textarea
      bind:value={alarm.content}
      placeholder="Content"
      class="w-full p-2 bg-transparent outline-none mt-2 resize-none"
    ></textarea>
    <div class="mt-2 flex gap-2">
      <select
        bind:value={alarm.severity}
        class="p-2 bg-transparent outline-none rounded-md ring-1 ring-primary"
      >
        {#each Object.values(AlarmSeverity) as severity}
          <option value={severity}>{severity}</option>
        {/each}
      </select>
      <select
        bind:value={alarm.status}
        class="p-2 bg-transparent outline-none rounded-md ring-1 ring-primary"
      >
        {#each Object.values(AlarmStatus) as status}
          <option value={status}>{status}</option>
        {/each}
      </select>
    </div>
    <button
      class="p-2 bg-primary text-white rounded-md"
      onclick={() => props.addAlarm(alarm)}>Add</button
    >
  </div>
</div>
