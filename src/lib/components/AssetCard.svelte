<script lang="ts">
  import type { UserAssetLink } from "@openremote/model";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { appState, openRemoteService } from "$lib/store.svelte";
  import { PageIndex } from "$lib/pages";

  dayjs.extend(relativeTime);

  const { asset }: { asset: UserAssetLink } = $props();
</script>

<div class="bg-primary/20 flex w-full flex-col gap-2 rounded-lg p-2">
  <div class="flex items-center justify-between">
    <span class="font-medium">{asset.assetName}</span>
    <div class="flex gap-2">{dayjs(asset.createdOn).fromNow()}</div>
  </div>
  <div class="flex gap-2">
    {#each appState.alarms.filter( (alarm) => alarm.asset?.some((assetLink) => assetLink.id === asset.id?.assetId) ) as alarm (alarm.id)}
      <button
        onclick={() => {
          appState.selectedAlarm = alarm;
          openRemoteService.navigateTo(PageIndex.REPORT, alarm);
        }}
        class="bg-primary/30 rounded px-2 py-1 text-sm"
      >
        {alarm.title || "Untitled Alarm"}
      </button>
    {/each}
  </div>
</div>
