<script lang="ts">
  import { AlarmStatus } from "@openremote/model";
  import AlarmCard from "$lib/components/AlarmCard.svelte";
  import AlarmGroup from "$lib/components/AlarmGroup.svelte";
  import { groupAlarms } from "$lib/alarm-grouping";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import User from "@lucide/svelte/icons/user";
  import { appState } from "$lib/store.svelte";

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

  const userAlarms = $derived(
    appState.alarms.filter((alarm) => alarm.assigneeId === appState.user?.id)
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
    appState.alarms.filter((alarm) => alarm.assigneeId !== appState.user?.id)
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
    <header class="flex items-center justify-between gap-3">
      <div class="flex flex-col">
        <h2 class="text-foreground text-lg font-semibold tracking-tight">
          Your queue
        </h2>
        <p class="text-muted-foreground text-sm">
          Focus on alarms directly assigned to you.
        </p>
      </div>
      <Badge variant="subtle" class="bg-primary/10 text-primary">
        {userActive.length} active
      </Badge>
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
          You’re all caught up — no alarms are assigned to you right now.
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
          All alarms
        </h2>
        <p class="text-muted-foreground text-sm">
          Review and monitor alarms across your organization.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
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
            class={`inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3 text-xs rounded-full border gap-2 ${
              assigneeFilter !== "all"
                ? "bg-accent text-accent-foreground border-transparent hover:bg-accent/90"
                : "bg-transparent text-muted-foreground border-border/60 hover:bg-[var(--surface-elevated)]"
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
          No alarms match the current filter.
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
