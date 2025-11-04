<script lang="ts">
  import { Asset, } from "@openremote/model";

  const { currentAsset } = $props<{
    currentAsset?: Asset;
  }>();

    let asset = $state<Asset>({
      id: currentAsset?.id || "",
      name: currentAsset?.name || "",
  });
</script>

<div>
  {asset.name}
</div>