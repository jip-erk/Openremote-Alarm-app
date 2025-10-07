<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  type CardContentProps = {
    class?: string;
    children?: Snippet;
  } & Record<string, unknown>;

  let { class: className, children, ...rest }: CardContentProps = $props();
</script>

<div
  data-slot="card-content"
  class={cn("text-muted-foreground flex flex-col gap-4 text-sm", className)}
  {...rest}
>
  {@render children?.()}
</div>
