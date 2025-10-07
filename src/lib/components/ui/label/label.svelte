<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  type LabelProps = {
    class?: string;
    children?: Snippet;
    for?: string;
  } & Record<string, unknown>;

  let { class: className, children, ...rest }: LabelProps = $props();
</script>

<label
  class={cn("text-foreground/90 text-sm font-medium", className)}
  {...rest}
>
  {@render children?.()}
</label>
