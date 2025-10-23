<script lang="ts">
  import { AlarmStatus } from "@openremote/model";
  import AlarmCard from "$lib/components/AlarmCard.svelte";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
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

  const userAlarms = $derived(
    appState.alarms.filter((alarm) => alarm.assigneeId === appState.user?.id)
  );
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
    filter === "all"
      ? otherAlarms
      : otherAlarms.filter((alarm) => alarm.status === filter)
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
      {#each userAlarms as alarm (alarm.id)}
        <AlarmCard {alarm} />
      {:else}
        <div
          class="rounded-3xl border border-dashed border-border/60 bg-[var(--surface-glass)]/70 p-8 text-center text-sm text-muted-foreground"
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
          Other alarms
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
      </div>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      {#each visibleAlarms as alarm (alarm.id)}
        <AlarmCard {alarm} />
      {:else}
        <div
          class="rounded-3xl border border-dashed border-border/60 bg-[var(--surface-glass)]/70 p-10 text-center text-sm text-muted-foreground"
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
