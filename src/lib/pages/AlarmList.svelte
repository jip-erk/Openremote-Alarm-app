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

<div class="mx-auto flex max-w-4xl flex-col gap-6 p-6">
  <section>
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold">Your Alarms</h2>
      <span
        class="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800"
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
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold">Other Alarms</h2>
      <span
        class="rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700"
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
