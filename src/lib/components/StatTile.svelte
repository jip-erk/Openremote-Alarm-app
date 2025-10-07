<script lang="ts">
  import { cn } from "$lib/utils.js";

  type IndicatorTone = "accent" | "primary" | "muted" | "success";

  type StatTileProps = {
    title: string;
    value: string;
    description?: string;
    indicatorLabel?: string;
    indicatorTone?: IndicatorTone;
    class?: string;
    icon?: any;
    indicatorIcon?: any;
  };

  const {
    title,
    value,
    description,
    indicatorLabel,
    indicatorTone = "accent",
    class: className,
    icon,
    indicatorIcon,
  }: StatTileProps = $props();

  const indicatorToneClass = $derived(() => {
    switch (indicatorTone) {
      case "primary":
        return "bg-primary";
      case "success":
        return "bg-[var(--status-resolved-ring)]";
      case "muted":
        return "bg-muted-foreground/60";
      default:
        return "bg-accent";
    }
  });
</script>

<section
  class={cn(
    "group border-border/50 hover:border-border relative overflow-hidden rounded-3xl border bg-[var(--surface-glass)]/80 p-5 shadow-[var(--shadow-soft)] transition hover:bg-[var(--surface-elevated)]/90",
    "before:pointer-events-none before:absolute before:-inset-10 before:-z-10 before:bg-[radial-gradient(circle_at_top,var(--primary)/0.16,transparent_60%)] before:opacity-0 before:transition-opacity group-hover:before:opacity-100",
    className
  )}
>
  <header class="flex items-start justify-between gap-4">
    <div class="flex flex-col gap-1">
      <span
        class="text-muted-foreground text-sm font-medium tracking-wide uppercase"
      >
        {title}
      </span>
      <span class="text-foreground text-3xl font-semibold">{value}</span>
    </div>
    {#if icon}
      <div
        class="bg-primary/10 text-primary ring-primary/20 rounded-2xl p-2 ring-1"
      >
        <icon class="size-5"></icon>
      </div>
    {/if}
  </header>
  {#if description}
    <p class="text-muted-foreground mt-3 text-sm">{description}</p>
  {/if}
  {#if indicatorLabel}
    <div class="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
      {#if indicatorIcon}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide-icon lucide lucide-link size-4"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          ></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          ></path>
        </svg>
      {:else}
        <span class={`h-2 w-2 rounded-full ${indicatorToneClass}`}></span>
      {/if}
      <span>{indicatorLabel}</span>
    </div>
  {/if}
</section>
