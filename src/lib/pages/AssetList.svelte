<script lang="ts">
  import { onMount } from "svelte";
  import { openRemoteService, appState } from "$lib/store.svelte";
  import AssetCard from "$lib/components/AssetCard.svelte";

  onMount(() => {
    openRemoteService.fetchAssets();
  });
</script>

<div class="p-4 flex flex-col gap-4">
  {#each appState.assets as asset}
    <AssetCard {asset} />
  {/each}
</div>
