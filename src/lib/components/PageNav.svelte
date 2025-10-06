<script lang="ts">
  import { pages } from "$lib/pages";
  import { appState, openRemoteService } from "$lib/store.svelte";

  const roles = $derived(appState.user?.roles?.get("openremote"));
</script>

<div class="flex justify-evenly border-t-2 p-4">
  {#each pages.map( (p) => (p.roles.some( (r) => roles?.includes(r) ) ? p : null) ) as page (page?.title)}
    {#if page}
      <button
        class="disabled:text-primary flex flex-col items-center"
        onclick={() => openRemoteService.navigateTo(page.index)}
        disabled={page.index === appState.pageIndex && !appState.selectedAlarm}
      >
        <page.icon height="1.5em" />
        <span>{page.title}</span>
      </button>
    {/if}
  {/each}
</div>
