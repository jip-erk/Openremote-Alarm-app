<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import PageNav from "$lib/components/PageNav.svelte";
  import { pages } from "$lib/pages";
  import { appState } from "$lib/store.svelte";

  const CurrentPage = $derived(pages.at(appState.pageIndex) ?? pages[0]);
</script>

{#if appState.initialized}
  <main class="bg-background text-foreground relative min-h-[100dvh]">
    <div
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--gradient-start)_0%,var(--gradient-mid)_45%,transparent_70%)]"
    ></div>
    <div
      class="pointer-events-none absolute inset-x-0 top-48 -z-10 h-72 bg-[radial-gradient(ellipse_at_bottom,var(--primary)/0.18_0%,transparent_65%)]"
    ></div>

    <div
      class="mx-auto flex w-full max-w-[1200px] flex-col px-4 pt-6 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8"
    >
      <Header />
      <div class="mt-6 flex-1 overflow-x-hidden">
        <CurrentPage.component />
      </div>
      <PageNav />
    </div>
  </main>
{:else}
  <main
    class="bg-background text-foreground relative flex min-h-[100dvh] items-center justify-center"
  >
    <div
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--gradient-start)_0%,var(--gradient-mid)_45%,transparent_70%)]"
    ></div>
    <div
      class="pointer-events-none absolute inset-x-0 top-48 -z-10 h-72 bg-[radial-gradient(ellipse_at_bottom,var(--primary)/0.18_0%,transparent_65%)]"
    ></div>

    <div class="flex flex-col items-center gap-4 text-center">
      <span
        class="border-border/50 border-t-primary size-12 animate-spin rounded-full border-4"
      ></span>
      <div class="space-y-1">
        <p class="text-foreground/90 text-sm font-medium tracking-tight">
          Connecting to OpenRemote services
        </p>
        <p class="text-muted-foreground text-xs">
          One moment while we load your alarms and assets.
        </p>
      </div>
    </div>
  </main>
{/if}
