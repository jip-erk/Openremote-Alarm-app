<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  type BadgeVariant =
    | "default"
    | "subtle"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "muted";

  type BadgeProps = {
    class?: string;
    variant?: BadgeVariant;
    children?: Snippet;
  } & Record<string, unknown>;

  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-primary/90 text-primary-foreground",
    subtle: "bg-[var(--surface-elevated)] text-foreground",
    outline: "border border-border/60 bg-transparent text-foreground",
    success:
      "border-[var(--status-resolved-ring)] bg-[var(--status-resolved-bg)] text-[var(--status-resolved-fg)]",
    warning:
      "border-[var(--status-ack-ring)] bg-[var(--status-ack-bg)] text-[var(--status-ack-fg)]",
    danger:
      "border-[var(--status-open-ring)] bg-[var(--status-open-bg)] text-[var(--status-open-fg)]",
    muted: "bg-muted text-muted-foreground",
  };

  let {
    class: className,
    variant = "default",
    children,
    ...rest
  }: BadgeProps = $props();
</script>

<span
  class={cn(
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem] font-semibold tracking-wide uppercase",
    variantStyles[variant],
    className
  )}
  {...rest}
>
  {@render children?.()}
</span>
