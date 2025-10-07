<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  type CardHeaderProps = {
    class?: string;
    children?: Snippet;
  } & Record<string, unknown>;

  let { class: className, children, ...rest }: CardHeaderProps = $props();
</script>

<div
  data-slot="card-header"
  class={cn("mb-4 flex flex-col gap-2", className)}
  {...rest}
>
  {@render children?.()}
</div>
