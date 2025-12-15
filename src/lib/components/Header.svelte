<script lang="ts">
  import DayTime from "@lucide/svelte/icons/sunrise";
  import Activity from "@lucide/svelte/icons/activity";
  import BellRing from "@lucide/svelte/icons/bell-ring";
  import UserCheck from "@lucide/svelte/icons/user-check";
  import Layers3 from "@lucide/svelte/icons/layers-3";
  import LinkIcon from "@lucide/svelte/icons/link";
  import BookOpen from "@lucide/svelte/icons/book-open";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import StatTile from "$lib/components/StatTile.svelte";
  import { PageIndex } from "$lib/pages";
  import { openRemoteService, appState } from "$lib/store.svelte";
  import { AlarmStatus } from "@openremote/model";
  import logo from "../../assets/logo.png";

  const userName = $derived(appState.user?.username ?? "Operator");
  const initials = $derived(
    userName
      .split(" ")
      .filter(Boolean)
      .map((word) => word.at(0)?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "OR"
  );

  const now = new Date();
  const hour = now.getHours();
  const greeting = (() => {
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  const assignedAlarms = $derived(
    appState.alarms.filter((alarm) => alarm.assigneeId === appState.user?.id)
  );
  const openAlarms = $derived(
    appState.alarms.filter(
      (alarm) =>
        alarm.status !== AlarmStatus.RESOLVED &&
        alarm.status !== AlarmStatus.CLOSED
    )
  );
  const resolvedPercentage = $derived(
    (() => {
      const resolved = appState.alarms.filter((alarm) =>
        [AlarmStatus.RESOLVED, AlarmStatus.CLOSED].includes(
          alarm.status as AlarmStatus
        )
      ).length;
      if (appState.alarms.length === 0) return 0;
      return Math.round((resolved / appState.alarms.length) * 100);
    })()
  );

  const formattedDate = `${now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  })}`;

  const isAlarmsView = $derived(appState.pageIndex === PageIndex.ALARMS);

  // Determine if there are any custom colors applied
  const isDefaultAppearance = $derived(
    Object.keys(appState.appearance.colors || {}).length === 0 &&
      Object.keys(appState.appearance.darkColors || {}).length === 0
  );
  const isDarkTheme = $derived(appState.theme === "dark");
  // Compute the final hero background image, preserving exact default when primary is default
  const defaultPrimaryLight = "oklch(0.69 0.15 136)";
  const defaultPrimaryDark = "oklch(0.7 0.12 139)";
  let heroBg = $state("");

  function makeAdaptive(light: boolean) {
    if (light) {
      const start =
        "color-mix(in oklab, var(--primary) 18%, var(--background) 82%)";
      const mid =
        "color-mix(in oklab, var(--primary) 28%, var(--background) 72%)";
      const end = "color-mix(in oklab, var(--primary) 34%, transparent)";
      return `linear-gradient(135deg, ${start}, ${mid}, ${end})`;
    } else {
      const start =
        "color-mix(in oklab, var(--primary) 26%, var(--background) 74%)";
      const mid =
        "color-mix(in oklab, var(--primary) 20%, var(--background) 80%)";
      const end = "color-mix(in oklab, var(--primary) 28%, transparent)";
      return `linear-gradient(135deg, ${start}, ${mid}, ${end})`;
    }
  }

  $effect(() => {
    if (typeof document === "undefined") return;
    // Track appearance changes explicitly so we recompute when user applies new colors
    const _dep = isDarkTheme
      ? appState.appearance.darkColors
      : appState.appearance.colors;
    const root = document.documentElement;
    const primary = getComputedStyle(root).getPropertyValue("--primary").trim();
    const isDefault = isDarkTheme
      ? primary === defaultPrimaryDark
      : primary === defaultPrimaryLight;
    if (isDefault) {
      heroBg = isDarkTheme
        ? "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))"
        : "linear-gradient(90deg, var(--surface-highlight), rgba(34,197,94,0.12))";
    } else {
      // Use left(darker) -> right(lighter)
      if (!isDarkTheme) {
        const start =
          "color-mix(in oklab, var(--primary) 34%, var(--background) 66%)";
        const mid =
          "color-mix(in oklab, var(--primary) 22%, var(--background) 78%)";
        const end = "color-mix(in oklab, var(--primary) 8%, transparent)";
        heroBg = `linear-gradient(90deg, ${start}, ${mid}, ${end})`;
      } else {
        const start =
          "color-mix(in oklab, var(--primary) 28%, var(--background) 72%)";
        const mid =
          "color-mix(in oklab, var(--primary) 18%, var(--background) 82%)";
        const end = "color-mix(in oklab, var(--primary) 8%, transparent)";
        heroBg = `linear-gradient(90deg, ${start}, ${mid}, ${end})`;
      }
    }
  });
</script>

<header class="flex flex-col gap-6">
  <div class="flex items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <div
        class="border-primary/40 text-primary dark:border-primary/30 flex size-12 items-center justify-center rounded-2xl border bg-[var(--surface-elevated)]/90 shadow-sm ring-1 ring-white/40 ring-inset dark:bg-[var(--surface-elevated)]/70 dark:shadow-[var(--shadow-soft)] dark:ring-white/10"
      >
        {#if appState.appearance.logoMobileUrl}
          <img
            src={appState.appearance.logoMobileUrl}
            alt="OpenRemote"
            class="h-8 w-auto sm:hidden"
          />
        {/if}
        <img
          src={appState.appearance.logoUrl || logo}
          alt="OpenRemote"
          class={appState.appearance.logoMobileUrl
            ? "hidden h-8 w-auto sm:block"
            : "h-8 w-auto"}
        />
      </div>
      <div class="flex flex-col">
        <span class="text-muted-foreground text-xs tracking-[0.3em] uppercase"
          >Control Center</span
        >
        <span class="text-foreground text-xl font-semibold">
          {greeting}, {userName.split(" ")[0] ?? userName}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        class="border-border/50 text-foreground/90 rounded-full border bg-[var(--surface-elevated)]/70 hover:bg-[var(--surface-highlight)]"
        onclick={() => openRemoteService.navigateTo(PageIndex.DOCUMENTATION)}
        title="Documentation"
      >
        <BookOpen class="size-5" />
      </Button>
      <ThemeToggle />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Avatar.Root
            class="border-border/60 text-foreground hover:ring-primary/40 dark:text-foreground size-12 rounded-2xl border bg-[var(--surface-elevated)]/90 shadow-sm ring-1 ring-white/40 transition ring-inset hover:-translate-y-[1px] hover:shadow-md dark:border-white/10 dark:ring-white/15"
          >
            <Avatar.Fallback
              class="text-foreground rounded-[1.25rem] bg-transparent text-lg font-semibold tracking-wide"
            >
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-48">
          <DropdownMenu.Group>
            <DropdownMenu.Label>{userName}</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onclick={() => openRemoteService.navigateTo(PageIndex.APPEARANCE)}
            >
              Appearance
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onclick={() => openRemoteService.logout()}>
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>

  {#if isAlarmsView}
    <section
      class="border-border/40 text-foreground relative overflow-hidden rounded-4xl border px-6 py-7 shadow-[var(--shadow-soft)] transition-colors"
      style={`background-image: ${heroBg};`}
    >
      <div class="absolute inset-0 -z-10 opacity-20">
        <div
          class="bg-primary/40 absolute top-0 -right-10 size-40 rounded-full blur-3xl"
        ></div>
        <div
          class="bg-accent/50 absolute bottom-0 left-10 size-32 rounded-full blur-3xl"
        ></div>
      </div>
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex flex-col gap-3">
          <div class="text-foreground/80 flex items-center gap-2 text-sm">
            <DayTime class="text-primary size-4" />
            <span>{formattedDate}</span>
          </div>
          <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
            Stay ahead of every alarm.
          </h1>
          <p class="text-foreground/80 max-w-xl text-sm">
            Review, acknowledge, and resolve OpenRemote alarms in real-time with
            a workspace optimized for mobile and mission control alike.
          </p>
        </div>
        <div
          class="flex h-full min-w-[220px] flex-col justify-between gap-4 rounded-3xl border border-white/30 bg-white/15 p-4 text-sm text-black shadow-[var(--shadow-soft)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs tracking-wider text-black/80 uppercase dark:text-white/80"
              >Progress</span
            >
            <Activity class="size-4 text-black opacity-90 dark:text-white" />
          </div>
          <div class="text-3xl font-semibold drop-shadow-sm">
            {resolvedPercentage}%
          </div>
          <p class="text-xs text-black/70 dark:text-white/80">
            Resolved alarms across the organization. Keep momentum steady.
          </p>
          <Badge
            variant="subtle"
            class="bg-primary/20 text-primary self-start font-medium dark:bg-white/20 dark:text-white"
          >
            {openAlarms.length} active now
          </Badge>
        </div>
      </div>
    </section>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatTile
        title="Assigned to you"
        value={`${assignedAlarms.length}`}
        description="Alarms awaiting your intervention"
        icon={UserCheck}
      />
      <StatTile
        title="Open alarms"
        value={`${openAlarms.length}`}
        description="Monitor and acknowledge promptly"
        icon={BellRing}
      />
      <StatTile
        title="Connected assets"
        value={`${appState.assets.length}`}
        description="Assets linked from your realm"
        class="lg:col-span-1"
        indicatorLabel="Synced via OpenRemote"
        indicatorTone="accent"
        indicatorIcon={LinkIcon}
        icon={Layers3}
      />
    </div>
  {/if}
</header>
