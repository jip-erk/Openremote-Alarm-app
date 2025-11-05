<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Check from "@lucide/svelte/icons/check";
  import X from "@lucide/svelte/icons/x";

  const { checked = false, disabled = false, id, children } = $props<{
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
    id={id}
    type="checkbox"
    class="peer sr-only"
    checked={checked}
    disabled={disabled}
    onchange={handleChange}
  />
  <span
    class="inline-flex h-5 w-5 items-center justify-center rounded-md border border-border/60 bg-[var(--surface-elevated)]/70 transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-checked:border-primary peer-checked:bg-primary disabled:opacity-60"
    aria-hidden="true"
  >
    {#if checked}
      <Check class="h-3.5 w-3.5 text-white" />
    {:else}
      <X class="h-3.5 w-3.5 text-muted-foreground" />
    {/if}
  </span>
  {@render children?.()}
</label>
