<script lang="ts">
  import { pages } from "$lib/pages";
  import { appState, openRemoteService } from "$lib/store.svelte";

  const roles = $derived(appState.user?.roles?.get("openremote"));
</script>

<div class="border-t-2 p-4 flex justify-evenly">
  {#each pages.map( (p) => (p.roles.some( (r) => roles?.includes(r) ) ? p : null) ) as page}
    {#if page}
      <button
        class="flex flex-col items-center disabled:text-primary"
        onclick={() => openRemoteService.navigateTo(page.index)}
        disabled={page.index === appState.pageIndex && !appState.selectedAlarm}
      >
        <page.icon height="1.5em" />
        <span>{page.title}</span>
      </button>
    {/if}
  {/each}
</div>
