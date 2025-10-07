<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  type ButtonVariant =
    | "default"
    | "secondary"
    | "accent"
    | "outline"
    | "ghost"
    | "link"
    | "destructive";
  type ButtonSize = "sm" | "default" | "lg" | "icon";

  const variantStyles: Record<ButtonVariant, string> = {
    default:
      "bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    outline:
      "border-border bg-transparent text-foreground hover:bg-[var(--surface-elevated)]",
    ghost: "bg-transparent text-foreground hover:bg-[var(--surface-elevated)]",
    link: "bg-transparent text-primary underline-offset-4 hover:underline",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-9 rounded-md px-3 text-xs",
    default: "h-10 rounded-lg px-4 text-sm",
    lg: "h-11 rounded-lg px-5 text-base",
    icon: "h-10 w-10 rounded-lg",
  };

  type ButtonProps = {
    class?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    children?: Snippet;
  } & Record<string, unknown>;

  let {
    class: className,
    variant = "default",
    size = "default",
    type = "button",
    disabled = false,
    children,
    ...rest
  }: ButtonProps & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  } = $props();
</script>

<button
  {type}
  data-variant={variant}
  data-size={size}
  class={cn(
    "focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center justify-center gap-2 border border-transparent font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
    variantStyles[variant],
    sizeStyles[size],
    className
  )}
  {disabled}
  {...rest}
>
  {@render children?.()}
</button>
