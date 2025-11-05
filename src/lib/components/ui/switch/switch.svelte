<script lang="ts">
  import { createEventDispatcher } from "svelte";

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

<label class="inline-flex items-center gap-3 select-none">
  <input
    {id}
    type="checkbox"
    class="peer sr-only"
    {checked}
    {disabled}
    onchange={handleChange}
  />
  <span
    class="border-border/60 peer-focus-visible:ring-primary/40 peer-checked:border-primary/60 peer-checked:bg-primary relative inline-flex h-7 w-12 cursor-pointer rounded-full border bg-[var(--surface-elevated)]/70 transition-colors peer-focus-visible:ring-2 peer-focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    aria-hidden="true"
  >
    <span
      class="bg-background absolute top-0.5 left-0.5 h-6 w-6 rounded-full shadow [transition:transform_.2s_ease] peer-checked:translate-x-5 peer-checked:bg-white"
    ></span>
  </span>
  {@render children?.()}
</label>
