<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Check from "@lucide/svelte/icons/check";
  import X from "@lucide/svelte/icons/x";

  const {
    checked = false,
    disabled = false,
    id,
    children,
  } = $props<{
    checked?: boolean;
    disabled?: boolean;
    id?: string;
    children?: any;
  }>();

  const dispatch = createEventDispatcher<{ change: boolean }>();

  function handleChange(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    dispatch("change", value);
  }
</script>

<label class="inline-flex items-center gap-2 select-none">
  <input
    {id}
    type="checkbox"
    class="peer sr-only"
    {checked}
    {disabled}
    onchange={handleChange}
  />
  <span
    class="border-border/60 peer-focus-visible:ring-primary/40 peer-checked:border-primary peer-checked:bg-primary inline-flex h-5 w-5 items-center justify-center rounded-md border bg-[var(--surface-elevated)]/70 transition-colors peer-focus-visible:ring-2 peer-focus-visible:outline-none disabled:opacity-60"
    aria-hidden="true"
  >
    {#if checked}
      <Check class="h-3.5 w-3.5 text-white" />
    {:else}
      <X class="text-muted-foreground h-3.5 w-3.5" />
    {/if}
  </span>
  {@render children?.()}
</label>
