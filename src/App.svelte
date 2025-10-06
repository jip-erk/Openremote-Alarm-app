<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import PageNav from "$lib/components/PageNav.svelte";
  import { pages } from "$lib/pages";
  import { appState } from "$lib/store.svelte";

  const CurrentPage = $derived(pages.at(appState.pageIndex) ?? pages[0]);
</script>

{#if appState.initialized}
  <main class="flex h-full flex-col">
    <Header />
    <div class="flex-1 overflow-auto">
      <CurrentPage.component />
    </div>
    <PageNav />
  </main>
{/if}
