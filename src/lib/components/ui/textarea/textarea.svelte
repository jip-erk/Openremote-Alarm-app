<script lang="ts">
  import { cn } from "$lib/utils.js";

  type TextareaProps = {
    class?: string;
    value?: string | null;
  } & Record<string, unknown>;

  let {
    class: className,
    value = $bindable<string | null>(null),
    ...rest
  }: TextareaProps = $props();
</script>

<textarea
  bind:value
  class={cn(
    "border-border/60 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary/60 focus-visible:outline-primary/40 min-h-[6rem] w-full rounded-2xl border bg-[var(--surface-glass)]/75 px-4 py-3 text-sm shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    className
  )}
  {...rest}
></textarea>
