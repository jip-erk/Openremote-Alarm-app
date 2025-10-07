<script lang="ts">
  import MonitorSmartphone from "@lucide/svelte/icons/monitor-smartphone";
  import MoonStar from "@lucide/svelte/icons/moon-star";
  import Sun from "@lucide/svelte/icons/sun";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    appState,
    openRemoteService,
    type ThemePreference,
  } from "$lib/store.svelte";

  const themeOptions: Array<{
    value: ThemePreference;
    label: string;
    description: string;
  }> = [
    {
      value: "light",
      label: "Light",
      description: "Bright surfaces with green accent",
    },
    {
      value: "dark",
      label: "Dark",
      description: "Deep surfaces for nighttime focus",
    },
    {
      value: "system",
      label: "System",
      description: "Follow device preference automatically",
    },
  ];

  const iconMap = {
    light: Sun,
    dark: MoonStar,
    system: MonitorSmartphone,
  } satisfies Record<ThemePreference, typeof Sun>;

  const currentOption = $derived(
    themeOptions.find((option) => option.value === appState.themePreference) ??
      themeOptions[0]
  );
  const CurrentIcon = $derived(iconMap[currentOption.value]);

  const handleSelect = (value: ThemePreference) => {
    openRemoteService.setThemePreference(value);
  };
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button
      variant="ghost"
      size="icon"
      class="border-border/50 text-foreground/90 rounded-full border bg-[var(--surface-elevated)]/70 hover:bg-[var(--surface-highlight)]"
      aria-label={`Switch theme (currently ${currentOption.label})`}
    >
      <CurrentIcon class="size-5" />
      <span class="sr-only">{currentOption.label} theme</span>
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end" class="w-60">
    <DropdownMenu.Group>
      <DropdownMenu.Label>Theme</DropdownMenu.Label>
      {#each themeOptions as option (option.value)}
        <DropdownMenu.Item
          onclick={() => handleSelect(option.value)}
          class="group data-highlighted:text-foreground data-highlighted:[&_span]:text-foreground data-highlighted:[&_span.description]:text-foreground/80 data-highlighted:[&_span[data-active-badge]]:bg-primary data-highlighted:[&_span[data-active-badge]]:text-primary-foreground data-highlighted:[&_svg]:text-primary data-highlighted:bg-[var(--surface-highlight)]"
        >
          {@const Icon = iconMap[option.value]}
          <div class="flex items-center gap-3">
            <Icon class="text-muted-foreground size-4 transition-colors" />
            <div class="flex flex-col">
              <span class="text-sm font-medium">{option.label}</span>
              <span class="description text-muted-foreground text-xs">
                {option.description}
              </span>
            </div>
            {#if option.value === appState.themePreference}
              <span
                data-active-badge
                class="bg-primary/20 text-primary ml-auto rounded-full px-2 py-0.5 text-xs transition-colors"
              >
                Active
              </span>
            {/if}
          </div>
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
