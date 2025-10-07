<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { PageIndex } from "$lib/pages";
  import { openRemoteService, appState } from "$lib/store.svelte";
  import AssetCard from "$lib/components/AssetCard.svelte";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";

  onMount(() => {
    openRemoteService.fetchAssets();
  });

  const handleBack = () => {
    openRemoteService.navigateTo(PageIndex.ALARMS);
  };
</script>

<div class="flex flex-col gap-6 pb-24">
  <div class="flex items-center justify-between gap-3">
    <Button variant="ghost" size="sm" class="gap-2" onclick={handleBack}>
      <ArrowLeft class="size-4" />
      Back to alarms
    </Button>
  </div>

  <header class="flex flex-col gap-2">
    <h2 class="text-foreground text-lg font-semibold tracking-tight">
      Connected assets
    </h2>
    <p class="text-muted-foreground text-sm">
      Monitor assets linked to your realm and jump into their associated alarms.
    </p>
  </header>

  <div class="grid gap-4 md:grid-cols-2">
    {#each appState.assets as asset (asset.id?.assetId)}
      <AssetCard {asset} />
    {:else}
      <div
        class="rounded-3xl border border-dashed border-border/60 bg-[var(--surface-glass)]/70 p-10 text-center text-sm text-muted-foreground"
      >
        Assets from OpenRemote will appear here once linked to your profile.
      </div>
    {/each}
  </div>
</div>
