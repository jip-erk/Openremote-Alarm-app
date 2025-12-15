<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
  } from "$lib/components/ui/card/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import AlarmCard from "$lib/components/AlarmCard.svelte";
  import AlarmGroup from "$lib/components/AlarmGroup.svelte";
  import { groupAlarms } from "$lib/alarm-grouping";
  import { PageIndex } from "$lib/pages";
  import {
    appState,
    openRemoteService,
    resolveManagerBaseUrl,
  } from "$lib/store.svelte";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import User from "@lucide/svelte/icons/user";
  import Search from "@lucide/svelte/icons/search";
  import X from "@lucide/svelte/icons/x";
  import Settings from "@lucide/svelte/icons/settings";
  import LocationCard from "$lib/components/LocationCard.svelte";
  import {
    getTypeInfoByKey,
    resolveTypeKeyFromAsset,
    resolveTypeKeyFromLink,
    type OrAssetLike,
  } from "$lib/asset-types";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { AlarmStatus } from "@openremote/model";

  dayjs.extend(relativeTime);

  onMount(() => {
    if (appState.selectedUserAssetLink) {
      openRemoteService.getAsset(appState.selectedUserAssetLink.id!);
    }
    openRemoteService.listAssignees();
  });

  const handleBack = () => {
    openRemoteService.navigateTo(PageIndex.ASSETS);
  };

  const handleOpenInManager = () => {
    const assetId = appState.selectedUserAssetLink?.id?.assetId;
    if (!assetId) return;
    const baseUrl = resolveManagerBaseUrl();
    const isConsole = appState.consoleAssetIds[assetId];
    const url = `${baseUrl}/manager/#/assets/${!!isConsole}/${assetId}`;
    window.open(url, "_blank");
  };

  const relatedAlarms = $derived(
    appState.alarms.filter((alarm) =>
      alarm.asset?.some(
        (assetLink) =>
          assetLink.id === appState.selectedUserAssetLink?.id?.assetId
      )
    )
  );

  const openCount = $derived(
    relatedAlarms.filter((alarm) => alarm.status === AlarmStatus.OPEN).length
  );
  const inProgressCount = $derived(
    relatedAlarms.filter((alarm) => alarm.status === AlarmStatus.IN_PROGRESS)
      .length
  );

  // --- Asset attributes (defensive for different shapes) ---
  function normalizeAttributes(asset: any): Array<any> {
    if (!asset) return [];
    const attrs: any = asset.attributes;
    if (!attrs) return [];
    if (Array.isArray(attrs)) return attrs;
    // Object/record map -> array with name preserved
    return Object.keys(attrs).map((name) => ({ name, ...(attrs[name] || {}) }));
  }

  const assetType = $derived(
    (appState.selectedAsset as any)?.type?.name ||
      (appState.selectedAsset as any)?.typeName ||
      (appState.selectedAsset as any)?.assetType?.name ||
      (appState.selectedAsset as any)?.type ||
      (appState.selectedAsset as any)?.assetType ||
      "Unknown"
  );

  const normalizedAttributes = $derived(
    normalizeAttributes(appState.selectedAsset as any)
  );

  const assetLocation = $derived.by(() => {
    const asset = appState.selectedAsset as any;
    if (!asset) return undefined;

    // Check for direct location field (GeoJSON Point)
    // Structure: { value: { coordinates: [lng, lat], type: 'Point' } }
    const locValue = asset.location?.value || asset.attributes?.location?.value;

    if (
      locValue?.coordinates &&
      Array.isArray(locValue.coordinates) &&
      locValue.coordinates.length === 2
    ) {
      const [lng, lat] = locValue.coordinates;
      return { lat, lng };
    }

    return undefined;
  });

  function valueToString(attr: any): string {
    // Common fields where OR might keep the actual value
    const raw =
      attr?.value?.value ??
      attr?.value ??
      attr?.data?.value ??
      attr?.state ??
      attr?.current ??
      null;
    try {
      if (raw === null || raw === undefined) return "";
      if (typeof raw === "string") return raw;
      if (typeof raw === "number" || typeof raw === "boolean")
        return String(raw);
      return JSON.stringify(raw);
    } catch {
      return String(raw);
    }
  }

  // Page state helpers
  const hasLink = $derived(!!appState.selectedUserAssetLink?.id?.assetId);
  const hasAsset = $derived(!!appState.selectedAsset);

  // Icon and color per asset type
  const typeKeyFromAsset = $derived(
    resolveTypeKeyFromAsset(appState.selectedAsset as unknown as OrAssetLike)
  );
  const typeKeyFallbackFromLink = $derived(
    resolveTypeKeyFromLink(
      appState.selectedUserAssetLink,
      !!appState.selectedUserAssetLink &&
        appState.selectedUserAssetLink.id?.assetId
        ? !!appState.consoleAssetIds[appState.selectedUserAssetLink.id.assetId]
        : false
    )
  );
  const effectiveTypeKey = $derived(
    typeKeyFromAsset !== "unknown" ? typeKeyFromAsset : typeKeyFallbackFromLink
  );
  const typeInfo = $derived(getTypeInfoByKey(effectiveTypeKey));

  // Lighter header background derived from the type color to improve readability
  const headerBg = $derived(() => {
    const base = typeInfo.colorClasses?.bg ?? "bg-primary/10";
    // Prefer a lighter fraction if present; /20 -> /10, /10 -> /5
    if (base.includes("/20")) return base.replace("/20", "/10");
    if (base.includes("/15")) return base.replace("/15", "/10");
    if (base.includes("/10")) return base.replace("/10", "/5");
    return base;
  });

  // Filter controls for linked alarms (reused from Alarms page)
  const statusFilters = [
    { label: "All", value: "all" },
    { label: "Open", value: AlarmStatus.OPEN },
    { label: "In progress", value: AlarmStatus.IN_PROGRESS },
    { label: "Acknowledged", value: AlarmStatus.ACKNOWLEDGED },
    { label: "Resolved", value: AlarmStatus.RESOLVED },
  ] as const;

  type FilterValue = (typeof statusFilters)[number]["value"];
  let alarmFilter = $state<FilterValue>("all");
  let assigneeFilter = $state<string>("all");
  let searchQuery = $state("");
  let isSearchOpen = $state(false);
  let searchInput = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (isSearchOpen && searchInput) {
      searchInput.focus();
    }
  });

  const visibleRelatedAlarms = $derived(
    (alarmFilter === "all"
      ? relatedAlarms
      : relatedAlarms.filter((a) => a.status === alarmFilter)
    )
      .filter((alarm) => {
        if (appState.showResolvedClosedAlarms) return true;
        return (
          alarm.status !== AlarmStatus.RESOLVED &&
          alarm.status !== AlarmStatus.CLOSED
        );
      })
      .filter((alarm) => {
        if (assigneeFilter === "all") return true;
        if (assigneeFilter === "unassigned") return !alarm.assigneeId;
        return alarm.assigneeId === assigneeFilter;
      })
      .filter((alarm) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          alarm.title?.toLowerCase().includes(query) ||
          alarm.content?.toLowerCase().includes(query)
        );
      })
  );
  const visibleAlarmGroups = $derived(groupAlarms(visibleRelatedAlarms));

  const selectedAssigneeLabel = $derived(
    assigneeFilter === "all"
      ? "Assignee"
      : assigneeFilter === "unassigned"
        ? "Unassigned"
        : appState.assignees.find((a) => a.value === assigneeFilter)?.label ||
          "Unknown"
  );
</script>

<div class="flex flex-col gap-6 pb-24">
  <div class="flex items-center justify-between gap-3">
    <Button variant="ghost" size="sm" class="gap-2" onclick={handleBack}>
      <ArrowLeft class="size-4" />
      Back to assets
    </Button>

    {#if appState.selectedUserAssetLink?.id?.assetId}
      <Button
        variant="outline"
        size="sm"
        class="gap-2"
        onclick={handleOpenInManager}
      >
        <ExternalLink class="size-4" />
        Open in OpenRemote
      </Button>
    {/if}
  </div>

  <header class="flex flex-col gap-2">
    <h2 class="text-foreground text-lg font-semibold tracking-tight">
      Asset details
    </h2>
    <p class="text-muted-foreground text-sm">
      View properties, attributes, and alarms linked to this asset.
    </p>
  </header>

  {#if !hasLink && !hasAsset}
    <div
      class="border-border/60 text-muted-foreground rounded-3xl border border-dashed bg-[var(--surface-glass)]/70 p-10 text-center text-sm"
    >
      No asset is selected. Return to Assets and pick an asset to view its
      details.
    </div>
  {/if}

  <Card
    class={`border-border/50 border ${headerBg} dark:bg-[var(--surface-elevated)]/50`}
  >
    <CardHeader>
      <div class="flex items-start gap-3">
        <div
          class={`flex size-11 items-center justify-center rounded-2xl ${typeInfo.colorClasses?.bg ?? "bg-primary/10"} ${typeInfo.colorClasses?.text ?? "text-primary"}`}
        >
          <typeInfo.icon class="size-5" />
        </div>
        <div class="flex flex-col">
          <h3 class="text-foreground text-xl font-semibold">
            {appState.selectedAsset?.name ??
              appState.selectedUserAssetLink?.assetName ??
              "Asset"}
          </h3>
          <p class="text-muted-foreground text-sm">
            {#if appState.selectedUserAssetLink?.createdOn}
              Linked {dayjs(appState.selectedUserAssetLink.createdOn).fromNow()}
            {:else}
              No link date available
            {/if}
          </p>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="flex flex-wrap gap-3 text-xs">
        <span
          class={`rounded-full px-3 py-1 ${typeInfo.colorClasses?.bg ?? "bg-primary/10"} ${typeInfo.colorClasses?.text ?? "text-primary"}`}
          >{openCount} open</span
        >
        <span
          class={`rounded-full px-3 py-1 ${typeInfo.colorClasses?.bg ?? "bg-primary/10"} ${typeInfo.colorClasses?.text ?? "text-primary"}`}
          >{inProgressCount} in progress</span
        >
      </div>
    </CardContent>
  </Card>

  <!-- Attributes section -->
  <section class="space-y-4">
    <header>
      <h4 class="text-foreground text-lg font-semibold tracking-tight">
        Attributes
      </h4>
      <p class="text-muted-foreground text-sm">
        Read-only snapshot of the asset attributes.
      </p>
    </header>

    <Card class="border-border/50 border bg-[var(--surface-glass)]/50">
      <CardContent class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Synthetic meta fields moved into Attributes -->
          <div class="space-y-1">
            <Label class="text-xs">Asset ID</Label>
            <Input
              readonly
              value={appState.selectedUserAssetLink?.id?.assetId ??
                appState.selectedAsset?.id ??
                "Not available"}
              class="border-border/60 bg-[var(--surface-glass)]/70"
            />
          </div>
          <div class="space-y-1">
            <Label class="text-xs">Type</Label>
            <Input
              readonly
              value={assetType || "Not available"}
              class="border-border/60 bg-[var(--surface-glass)]/70"
            />
          </div>

          {#each normalizedAttributes as attr, i (i)}
            {@const label = attr?.name ?? attr?.key ?? `Attribute ${i + 1}`}
            {@const valueStr = valueToString(attr)}
            <div class="space-y-1">
              <Label class="text-xs">{label}</Label>
              {#if valueStr && valueStr.length > 120}
                <Textarea
                  readonly
                  class="border-border/60 bg-[var(--surface-glass)]/70"
                  >{valueStr}</Textarea
                >
              {:else}
                <Input
                  readonly
                  value={valueStr || "Not provided"}
                  class="border-border/60 bg-[var(--surface-glass)]/70"
                />
              {/if}
            </div>
          {/each}
        </div>

        {#if normalizedAttributes.length === 0}
          <div class="text-muted-foreground/80 text-center text-sm">
            No additional attributes to display.
          </div>
        {/if}
      </CardContent>
    </Card>
  </section>

  <!-- ============================== -->
  <!-- ASSET LOCATION (Real or Mock)  -->
  <!-- ============================== -->
  <section class="space-y-4">
    <LocationCard
      entityId={appState.selectedUserAssetLink?.id?.assetId ??
        appState.selectedAsset?.id}
      entityType="asset"
      fixedLocation={assetLocation}
    />
  </section>

  <!-- Linked alarms section with filters -->
  <section class="space-y-5">
    <header
      class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <h4 class="text-foreground text-lg font-semibold tracking-tight">
          Linked alarms
        </h4>
        <p class="text-muted-foreground text-sm">
          Alarms associated with this asset.
        </p>
      </div>
      <div class="relative flex flex-wrap items-center gap-2">
        {#each statusFilters as option (option.value)}
          {@const isActive = alarmFilter === option.value}
          <Button
            variant={isActive ? "accent" : "ghost"}
            size="sm"
            class={`rounded-full border ${isActive ? "border-transparent" : "border-border/60 text-muted-foreground"}`}
            onclick={() => (alarmFilter = option.value)}
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
              {#each appState.assignees as assignee (assignee.value)}
                {#if assignee.value}
                  <DropdownMenu.RadioItem value={assignee.value}>
                    {assignee.label}
                  </DropdownMenu.RadioItem>
                {/if}
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
          variant={searchQuery ? "accent" : "ghost"}
          size="icon"
          class={`border-border/60 text-muted-foreground rounded-full border hover:bg-[var(--surface-elevated)] ${isSearchOpen ? "opacity-0" : ""}`}
          onclick={() => (isSearchOpen = true)}
        >
          <Search class="size-4" />
        </Button>

        {#if isSearchOpen}
          <div
            class="animate-in fade-in slide-in-from-right-4 absolute top-0 right-0 z-20 h-9 w-full duration-200 sm:w-64"
          >
            <div class="relative h-full w-full">
              <Search
                class="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
              />
              <Input
                bind:ref={searchInput}
                type="search"
                placeholder="Search alarms..."
                class="h-full bg-[var(--surface-elevated)] pr-8 pl-9 shadow-md [&::-webkit-search-cancel-button]:hidden"
                bind:value={searchQuery}
                onblur={() => {
                  isSearchOpen = false;
                }}
                onkeydown={(e: KeyboardEvent) => {
                  if (e.key === "Enter") isSearchOpen = false;
                  if (e.key === "Escape") {
                    isSearchOpen = false;
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                class="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
                onmousedown={(e: MouseEvent) => e.preventDefault()}
                onclick={() => {
                  searchQuery = "";
                }}
              >
                <X class="size-3.5" />
              </Button>
            </div>
          </div>
        {/if}
      </div>
    </header>

    {#if visibleAlarmGroups.length > 0}
      <div class="grid gap-4 md:grid-cols-2">
        {#each visibleAlarmGroups as group (group.key)}
          {#if group.count === 1}
            <AlarmCard alarm={group.items[0]} />
          {:else}
            <div class="md:col-span-2">
              <AlarmGroup {group} />
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <div
        class="border-border/60 text-muted-foreground rounded-3xl border border-dashed bg-[var(--surface-glass)]/70 p-10 text-center text-sm"
      >
        No alarms match the current filter{alarmFilter === "all"
          ? "."
          : " or are linked to this asset."}
      </div>
    {/if}
  </section>
</div>
