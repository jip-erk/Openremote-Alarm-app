<script lang="ts">
  import { AlarmStatus } from "@openremote/model";
  import AlarmCard from "$lib/components/AlarmCard.svelte";
  import AlarmGroup from "$lib/components/AlarmGroup.svelte";
  import { groupAlarms } from "$lib/alarm-grouping";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Search from "@lucide/svelte/icons/search";
  import User from "@lucide/svelte/icons/user";
  import X from "@lucide/svelte/icons/x";
  import Settings from "@lucide/svelte/icons/settings";
  import { appState, openRemoteService } from "$lib/store.svelte";

  const statusFilters = [
    { label: "All", value: "all" },
    { label: "Open", value: AlarmStatus.OPEN },
    { label: "In progress", value: AlarmStatus.IN_PROGRESS },
    { label: "Acknowledged", value: AlarmStatus.ACKNOWLEDGED },
    { label: "Resolved", value: AlarmStatus.RESOLVED },
  ] as const;

  type FilterValue = (typeof statusFilters)[number]["value"];

  let filter = $state<FilterValue>("all");
  let assigneeFilter = $state<string>("all");
  let userSearchQuery = $state("");
  let isUserSearchOpen = $state(false);
  let userSearchInput = $state<HTMLInputElement | null>(null);
  let otherSearchQuery = $state("");
  let isOtherSearchOpen = $state(false);
  let otherSearchInput = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (isOtherSearchOpen && otherSearchInput) {
      otherSearchInput.focus();
    }
  });

  $effect(() => {
    if (isUserSearchOpen && userSearchInput) {
      userSearchInput.focus();
    }
  });

  const userAlarms = $derived(
    appState.alarms
      .filter((alarm) => alarm.assigneeId === appState.user?.id)
      .filter((alarm) => {
        if (appState.showResolvedClosedAlarms) return true;
        return (
          alarm.status !== AlarmStatus.RESOLVED &&
          alarm.status !== AlarmStatus.CLOSED
        );
      })
      .filter((alarm) => {
        if (!userSearchQuery.trim()) return true;
        const query = userSearchQuery.toLowerCase();
        return (
          alarm.title?.toLowerCase().includes(query) ||
          alarm.content?.toLowerCase().includes(query)
        );
      })
  );
  const userAlarmGroups = $derived(groupAlarms(userAlarms));

  const userActive = $derived(
    userAlarms.filter(
      (alarm) =>
        alarm.status === AlarmStatus.OPEN ||
        alarm.status === AlarmStatus.IN_PROGRESS
    )
  );

  const otherAlarms = $derived(
    appState.alarms
      .filter((alarm) => alarm.assigneeId !== appState.user?.id)
      .filter((alarm) => {
        if (appState.showResolvedClosedAlarms) return true;
        return (
          alarm.status !== AlarmStatus.RESOLVED &&
          alarm.status !== AlarmStatus.CLOSED
        );
      })
      .filter((alarm) => {
        if (!otherSearchQuery.trim()) return true;
        const query = otherSearchQuery.toLowerCase();
        return (
          alarm.title?.toLowerCase().includes(query) ||
          alarm.content?.toLowerCase().includes(query)
        );
      })
  );

  const visibleAlarms = $derived(
    (filter === "all"
      ? otherAlarms
      : otherAlarms.filter((alarm) => alarm.status === filter)
    ).filter((alarm) => {
      if (assigneeFilter === "all") return true;
      if (assigneeFilter === "unassigned") return !alarm.assigneeId;
      return alarm.assigneeId === assigneeFilter;
    })
  );
  const visibleAlarmGroups = $derived(groupAlarms(visibleAlarms));

  const selectedAssigneeLabel = $derived(
    assigneeFilter === "all"
      ? "Assignee"
      : assigneeFilter === "unassigned"
        ? "Unassigned"
        : appState.assignees.find((a) => a.value === assigneeFilter)?.label ||
          "Unknown"
  );
</script>

<div class="flex flex-col gap-10 pb-24">
  <section class="space-y-4">
    <header
      class="flex flex-wrap items-end justify-between gap-4 lg:grid lg:grid-cols-3"
    >
      <div class="flex flex-col lg:col-span-2">
        <h2 class="text-foreground text-lg font-semibold tracking-tight">
          Your queue
        </h2>
        <p class="text-muted-foreground text-sm">
          Focus on alarms directly assigned to you.
        </p>
      </div>
      <div class="relative flex items-center justify-end gap-3">
        <Badge
          variant="subtle"
          class="bg-primary/10 text-primary whitespace-nowrap"
        >
          {userActive.length} active
        </Badge>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button
                variant="ghost"
                size="icon"
                class="border-border/60 text-muted-foreground rounded-full border hover:bg-[var(--surface-elevated)]"
                {...props}
              >
                <Settings class="size-4" />
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.CheckboxItem
              class="pr-8 pl-2 [&>span]:right-2 [&>span]:left-auto"
              checked={appState.showResolvedClosedAlarms}
              onCheckedChange={(v) =>
                openRemoteService.setShowResolvedClosedAlarms(v)}
            >
              Show resolved/closed
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <div class="relative">
          <Button
            variant={userSearchQuery ? "accent" : "ghost"}
            size="icon"
            aria-label="Search your alarms"
            class={`border-border/60 text-muted-foreground rounded-full border hover:bg-[var(--surface-elevated)] ${isUserSearchOpen ? "opacity-0" : ""}`}
            onclick={() => (isUserSearchOpen = true)}
          >
            <Search class="size-4" />
          </Button>

          {#if isUserSearchOpen}
            <div
              class="animate-in fade-in slide-in-from-right-4 absolute top-1/2 right-0 z-20 w-[calc(100vw-4rem)] -translate-y-1/2 duration-200 sm:w-64"
            >
              <div class="relative w-full">
                <Search
                  class="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
                />
                <Input
                  bind:ref={userSearchInput}
                  type="search"
                  placeholder="Search your alarms..."
                  class="h-9 bg-[var(--surface-elevated)] pr-8 pl-9 shadow-md [&::-webkit-search-cancel-button]:hidden"
                  bind:value={userSearchQuery}
                  onblur={() => {
                    isUserSearchOpen = false;
                  }}
                  onkeydown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") isUserSearchOpen = false;
                    if (e.key === "Escape") {
                      isUserSearchOpen = false;
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
                  onmousedown={(e: MouseEvent) => e.preventDefault()}
                  onclick={() => {
                    userSearchQuery = "";
                  }}
                >
                  <X class="size-3.5" />
                </Button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      {#each userAlarmGroups as group (group.key)}
        {#if group.count === 1}
          <AlarmCard alarm={group.items[0]} />
        {:else}
          <div class="md:col-span-2">
            <AlarmGroup {group} />
          </div>
        {/if}
      {:else}
        <div
          class="rounded-3xl border border-dashed border-border/60 bg-[var(--surface-glass)]/70 p-8 text-center text-sm text-muted-foreground md:col-span-2"
        >
          {#if userSearchQuery.trim()}
            No alarms match your search.
          {:else}
            You’re all caught up. No alarms are assigned to you right now.
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <section class="space-y-5">
    <header
      class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <h2 class="text-foreground text-lg font-semibold tracking-tight">
          Other alarms
        </h2>
        <p class="text-muted-foreground text-sm">
          Review and monitor alarms across your organization.
        </p>
      </div>
      <div class="relative flex flex-wrap items-center gap-2">
        {#each statusFilters as option (option.value)}
          {@const isActive = filter === option.value}
          <Button
            variant={isActive ? "accent" : "ghost"}
            size="sm"
            class={`rounded-full border ${
              isActive
                ? "border-transparent"
                : "border-border/60 text-muted-foreground"
            }`}
            onclick={() => {
              filter = option.value;
            }}
          >
            {option.label}
          </Button>
        {/each}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            class={`focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-2 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
              assigneeFilter !== "all"
                ? "bg-accent text-accent-foreground hover:bg-accent/90 border-transparent"
                : "text-muted-foreground border-border/60 bg-transparent hover:bg-[var(--surface-elevated)]"
            }`}
          >
            <User class="size-3.5" />
            {selectedAssigneeLabel}
            <ChevronDown class="size-3.5 opacity-50" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" class="w-56">
            <DropdownMenu.Label>Filter by assignee</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.RadioGroup bind:value={assigneeFilter}>
              <DropdownMenu.RadioItem value="all">All</DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="unassigned">
                No assignee
              </DropdownMenu.RadioItem>
              <DropdownMenu.Separator />
              {#each appState.assignees.filter((a) => a.value !== null && a.value !== appState.user?.id) as assignee (assignee.value)}
                <DropdownMenu.RadioItem value={assignee.value || ""}>
                  {assignee.label}
                </DropdownMenu.RadioItem>
              {/each}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button
                variant="ghost"
                size="icon"
                class="border-border/60 text-muted-foreground rounded-full border hover:bg-[var(--surface-elevated)]"
                {...props}
              >
                <Settings class="size-4" />
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.CheckboxItem
              class="pr-8 pl-2 [&>span]:right-2 [&>span]:left-auto"
              checked={appState.showResolvedClosedAlarms}
              onCheckedChange={(v) =>
                openRemoteService.setShowResolvedClosedAlarms(v)}
            >
              Show resolved/closed
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <Button
          variant={otherSearchQuery ? "accent" : "ghost"}
          size="icon"
          aria-label="Search other alarms"
          class={`border-border/60 text-muted-foreground rounded-full border hover:bg-[var(--surface-elevated)] ${isOtherSearchOpen ? "opacity-0" : ""}`}
          onclick={() => (isOtherSearchOpen = true)}
        >
          <Search class="size-4" />
        </Button>

        {#if isOtherSearchOpen}
          <div
            class="animate-in fade-in slide-in-from-right-4 absolute top-0 right-0 z-20 h-9 w-full duration-200 sm:w-64"
          >
            <div class="relative h-full w-full">
              <Search
                class="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
              />
              <Input
                bind:ref={otherSearchInput}
                type="search"
                placeholder="Search other alarms..."
                class="h-full bg-[var(--surface-elevated)] pr-8 pl-9 shadow-md [&::-webkit-search-cancel-button]:hidden"
                bind:value={otherSearchQuery}
                onblur={() => {
                  isOtherSearchOpen = false;
                }}
                onkeydown={(e: KeyboardEvent) => {
                  if (e.key === "Enter") isOtherSearchOpen = false;
                  if (e.key === "Escape") {
                    isOtherSearchOpen = false;
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                class="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
                onmousedown={(e: MouseEvent) => e.preventDefault()}
                onclick={() => {
                  otherSearchQuery = "";
                }}
              >
                <X class="size-3.5" />
              </Button>
            </div>
          </div>
        {/if}
      </div>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      {#each visibleAlarmGroups as group (group.key)}
        {#if group.count === 1}
          <AlarmCard alarm={group.items[0]} />
        {:else}
          <div class="md:col-span-2">
            <AlarmGroup {group} />
          </div>
        {/if}
      {:else}
        <div
          class="rounded-3xl border border-dashed border-border/60 bg-[var(--surface-glass)]/70 p-10 text-center text-sm text-muted-foreground md:col-span-2"
        >
          {#if otherSearchQuery.trim()}
            No alarms match your search.
          {:else}
            No alarms match the current filter.
          {/if}
        </div>
      {/each}
    </div>

    {#if filter !== "all"}
      <div class="flex justify-end">
        <Button
          variant="link"
          class="text-sm"
          onclick={() => {
            filter = "all";
          }}
        >
          Reset filters
        </Button>
      </div>
    {/if}
  </section>
</div>
