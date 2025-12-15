<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { PageIndex } from "$lib/pages";
  import {
    openRemoteService,
    appState,
    isConsoleAssetLink,
  } from "$lib/store.svelte";
  import {
    getTypeInfoByKey,
    resolveTypeKeyFromLink,
    resolveTypeKeyFromAsset,
    type OrAssetLike,
  } from "$lib/asset-types";
  import AssetCard from "$lib/components/AssetCard.svelte";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Search from "@lucide/svelte/icons/search";
  import X from "@lucide/svelte/icons/x";

  onMount(() => {
    openRemoteService.fetchAssets();
  });

  const handleBack = () => {
    openRemoteService.navigateTo(PageIndex.ALARMS);
  };

  let searchQuery = $state("");
  let isSearchOpen = $state(false);
  let searchInput = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (isSearchOpen && searchInput) {
      searchInput.focus();
    }
  });

  const filteredAssets = $derived(
    appState.assets.filter((link) => {
      const isConsole = isConsoleAssetLink(link);
      if (!appState.showConsoleAssets && isConsole) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const nameMatch = link.assetName?.toLowerCase().includes(query);

      const typeKey = isConsole
        ? "console"
        : link.id?.assetId && appState.assetTypeById[link.id.assetId]
          ? resolveTypeKeyFromAsset({
              typeName: appState.assetTypeById[link.id.assetId],
            } as OrAssetLike)
          : resolveTypeKeyFromLink(link, false);

      const typeInfo = getTypeInfoByKey(typeKey);
      const categoryMatch = typeInfo.label.toLowerCase().includes(query);

      return nameMatch || categoryMatch;
    })
  );
</script>

<div class="flex flex-col gap-6 pb-24">
  <div class="flex items-center justify-between gap-3">
    <Button variant="ghost" size="sm" class="gap-2" onclick={handleBack}>
      <ArrowLeft class="size-4" />
      Back to alarms
    </Button>
  </div>

  <header class="flex flex-col gap-2">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2 class="text-foreground text-lg font-semibold tracking-tight">
          Connected assets
        </h2>
        <p class="text-muted-foreground text-sm">
          Monitor assets linked to your realm and jump into their associated
          alarms.
        </p>
      </div>
      <div
        class="relative flex w-full flex-row items-center justify-between gap-3 sm:w-auto sm:justify-end"
      >
        <div class="flex items-center gap-3">
          <Checkbox
            checked={appState.showConsoleAssets}
            on:change={(e) => openRemoteService.setShowConsoleAssets(e.detail)}
          >
            <span
              class="text-muted-foreground text-sm"
              class:text-primary={appState.showConsoleAssets}
            >
              Show console assets
            </span>
          </Checkbox>
        </div>

        <div class="relative">
          <Button
            variant={searchQuery ? "accent" : "ghost"}
            size="icon"
            aria-label="Search assets"
            class={`border-border/60 text-muted-foreground rounded-full border hover:bg-[var(--surface-elevated)] ${isSearchOpen ? "opacity-0" : ""}`}
            onclick={() => (isSearchOpen = true)}
          >
            <Search class="size-4" />
          </Button>

          {#if isSearchOpen}
            <div
              class="animate-in fade-in slide-in-from-right-4 absolute top-1/2 right-0 z-20 w-[calc(100vw-4rem)] -translate-y-1/2 duration-200 sm:w-64"
            >
              <div class="relative w-full">
                <Search
                  class="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
                />
                <Input
                  bind:ref={searchInput}
                  type="search"
                  placeholder="Search assets..."
                  class="h-9 bg-[var(--surface-elevated)] pr-8 pl-9 shadow-md [&::-webkit-search-cancel-button]:hidden"
                  bind:value={searchQuery}
                  onblur={() => {
                    isSearchOpen = false;
                  }}
                  onkeydown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") isSearchOpen = false;
                    if (e.key === "Escape") {
                      isSearchOpen = false;
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
                  onmousedown={(e: MouseEvent) => e.preventDefault()}
                  onclick={() => {
                    searchQuery = "";
                  }}
                >
                  <X class="size-3.5" />
                </Button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <div class="grid gap-4 md:grid-cols-2">
    {#each filteredAssets as asset (asset.id?.assetId)}
      <AssetCard {asset} />
    {:else}
      <div
        class="rounded-3xl border border-dashed border-border/60 bg-[var(--surface-glass)]/70 p-10 text-center text-sm text-muted-foreground"
      >
        {#if searchQuery.trim()}
          No assets match your search.
        {:else}
          Assets from OpenRemote will appear here once linked to your profile.
        {/if}
      </div>
    {/each}
  </div>
</div>
