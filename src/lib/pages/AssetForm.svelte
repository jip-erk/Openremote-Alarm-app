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
  import { PageIndex } from "$lib/pages";
  import { appState, openRemoteService } from "$lib/store.svelte";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
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
  });

  const handleBack = () => {
    openRemoteService.navigateTo(PageIndex.ASSETS);
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
  const visibleRelatedAlarms = $derived(
    alarmFilter === "all"
      ? relatedAlarms
      : relatedAlarms.filter((a) => a.status === alarmFilter)
  );
</script>

<div class="flex flex-col gap-6 pb-24">
  <div class="flex items-center gap-3">
    <Button variant="ghost" size="sm" class="gap-2" onclick={handleBack}>
      <ArrowLeft class="size-4" />
      Back to assets
    </Button>
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
      <CardContent class="space-y-4 pt-6">
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
      <div class="flex flex-wrap gap-2">
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
      </div>
    </header>

    {#if visibleRelatedAlarms.length > 0}
      <div class="grid gap-4 md:grid-cols-2">
        {#each visibleRelatedAlarms as alarm (alarm.id)}
          <AlarmCard {alarm} />
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
