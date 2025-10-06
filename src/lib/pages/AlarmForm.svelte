<script lang="ts">
  import { onMount } from "svelte";
  import { openRemoteService, appState } from "$lib/store.svelte";
  import AlarmForm from "$lib/components/AddAlarmForm.svelte";
  import ArrowBack from "@iconify-svelte/material-symbols/arrow-back";
  import Delete from "@iconify-svelte/material-symbols/delete";
  import { PageIndex } from "$lib/pages";

  onMount(() => {
    if (appState.selectedAlarm)
      openRemoteService.getAlarm(appState.selectedAlarm.id);

    openRemoteService.listAssignees();
    openRemoteService.fetchAssets();
  });
</script>

{#if appState.selectedAlarm}
  <div class="flex justify-between items-center px-4">
    <button
      onclick={() => {
        openRemoteService.navigateTo(PageIndex.ALARMS);
      }}><ArrowBack height="2em" /></button
    >
    <span class="text-xl">Update</span>
    <button
      onclick={() =>
        openRemoteService
          .removeAlarm(appState.selectedAlarm!.id!)
          .then(() => openRemoteService.navigateTo(PageIndex.ALARMS))}
      ><Delete height="2em" /></button
    >
  </div>
{/if}

{#key appState.selectedAlarm?.id}
  <AlarmForm currentAlarm={appState.selectedAlarm ?? undefined} />
{/key}
