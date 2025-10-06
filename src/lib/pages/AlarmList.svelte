<script lang="ts">
  import AlarmCard from "$lib/components/AlarmCard.svelte";
  import { appState } from "$lib/store.svelte";

  const userAlarms = $derived(
    appState.alarms.filter((a) => a.assigneeId === appState.user?.id)
  );
  const otherAlarms = $derived(
    appState.alarms.filter((a) => a.assigneeId !== appState.user?.id)
  );
</script>

<div class="p-6 flex flex-col gap-6 max-w-4xl mx-auto">
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Your Alarms</h2>
      <span
        class="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded"
      >
        {userAlarms.length}
      </span>
    </div>

    <div class="flex flex-col gap-3">
      {#each userAlarms as alarm (alarm.id)}
        <AlarmCard {alarm} />
      {:else}
        <p class="text-gray-500 text-center py-4">No alarms assigned to you</p>
      {/each}
    </div>
  </section>

  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Other Alarms</h2>
      <span
        class="bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded"
      >
        {otherAlarms.length}
      </span>
    </div>

    <div class="flex flex-col gap-3">
      {#each otherAlarms as alarm (alarm.id)}
        <AlarmCard {alarm} />
      {:else}
        <p class="text-gray-500 text-center py-4">No other alarms available</p>
      {/each}
    </div>
  </section>
</div>
