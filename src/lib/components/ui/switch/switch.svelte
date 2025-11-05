<script lang="ts">
  import { createEventDispatcher } from "svelte";

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

<label class="inline-flex items-center gap-3 select-none">
  <input
    id={id}
    type="checkbox"
    class="peer sr-only"
    checked={checked}
    disabled={disabled}
    onchange={handleChange}
  />
  <span
    class="relative inline-flex h-7 w-12 cursor-pointer rounded-full border border-border/60 bg-[var(--surface-elevated)]/70 transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-checked:border-primary/60 peer-checked:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
    aria-hidden="true"
  >
    <span
      class="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-background shadow [transition:transform_.2s_ease] peer-checked:translate-x-5 peer-checked:bg-white"
    ></span>
  </span>
  {@render children?.()}
</label>
