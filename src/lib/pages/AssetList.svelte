<script lang="ts">
  import { onMount } from "svelte";
  import { openRemoteService, appState } from "$lib/store.svelte";
  import AssetCard from "$lib/components/AssetCard.svelte";

  onMount(() => {
    openRemoteService.fetchAssets();
  });
</script>

<div class="flex flex-col gap-4 p-4">
  {#each appState.assets as asset (asset.id?.assetId)}
    <AssetCard {asset} />
  {/each}
</div>
