<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  type CardProps = {
    class?: string;
    children?: Snippet;
  } & Record<string, unknown>;

  let { class: className, children, ...rest }: CardProps = $props();
</script>

<div
  data-slot="card"
  class={cn(
    "border-border/60 relative rounded-3xl border bg-[var(--surface-glass)]/90 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-colors",
    className
  )}
  {...rest}
>
  {@render children?.()}
</div>
