<script lang="ts">
  import { onMount } from "svelte";
  import AlarmForm from "$lib/components/AddAlarmForm.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { PageIndex } from "$lib/pages";
  import { appState, openRemoteService } from "$lib/store.svelte";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";

  onMount(() => {
    if (appState.selectedUserAssetLink) {
      openRemoteService.getAsset(appState.selectedUserAssetLink.id!);
    }
  });

  const handleBack = () => {
    openRemoteService.navigateTo(PageIndex.ASSETS);
  };

//   console.log(appState.selectedUserAssetLink + "userAssetLink");
//   console.log(appState.selectedAsset + "asset");
</script>

<div class="flex flex-col gap-6 pb-24">
  <div class="flex items-center gap-3">
    <Button variant="ghost" size="sm" class="gap-2" onclick={handleBack}>
      <ArrowLeft class="size-4" />
      Back to assets
    </Button>
  </div>

  <div>
    {appState.selectedAsset?.name}
  </div>

  <!-- {#key appState.selectedAlarm?.id}
    <AlarmForm
      currentAlarm={appState.selectedAlarm ?? undefined}
      onRemove={appState.selectedAlarm ? handleDelete : undefined}
    />
  {/key} -->
</div>