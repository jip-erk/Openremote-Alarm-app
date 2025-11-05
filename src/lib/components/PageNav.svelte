<script lang="ts">
  import { pages, PageIndex } from "$lib/pages";
  import { appState, openRemoteService } from "$lib/store.svelte";

  const roles = $derived(appState.user?.roles?.get("openremote"));
  const noHiddenPages = pages.filter((p) => !p.hidden);
  const allowedPages = $derived(
    noHiddenPages.filter((page) =>
      page.roles.some((role) => roles?.includes(role))
    )
  );
</script>

<nav
  class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:px-6"
  style="padding-bottom: env(safe-area-inset-bottom);"
>
  <div
    class="border-border/60 pointer-events-auto flex w-full max-w-lg items-center justify-between gap-2 rounded-3xl border bg-[var(--surface-glass)]/80 px-2 py-2 shadow-[var(--shadow-soft)] backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-2xl"
  >
    {#each allowedPages as page (page.title)}
      {#if page}
        {@const activeIndex =
          appState.pageIndex === PageIndex.ASSET
            ? PageIndex.ASSETS
            : appState.pageIndex}
        {@const isActive = page.index === activeIndex}
        <button
          class={`focus-visible:ring-ring flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition focus-visible:ring-2 focus-visible:outline-none ${
            isActive
              ? "bg-primary text-primary-foreground shadow-primary/30 shadow-lg"
              : "text-muted-foreground hover:bg-[var(--surface-elevated)]"
          }`}
          onclick={() => openRemoteService.navigateTo(page.index)}
          type="button"
        >
          <page.icon
            class={`size-5 ${isActive ? "opacity-100" : "opacity-70"}`}
          />
          <span>{page.title}</span>
        </button>
      {/if}
    {/each}
  </div>
</nav>
