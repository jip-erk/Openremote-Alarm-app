<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import {
    Card,
    CardContent,
    CardHeader,
  } from "$lib/components/ui/card/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { appState, openRemoteService } from "$lib/store.svelte";
  import { PageIndex, pages } from "$lib/pages";
  import Camera from "@lucide/svelte/icons/camera";
  import ImagePlus from "@lucide/svelte/icons/image-plus";

  type Colors = Record<string, string>;

  let title = $state(appState.appearance.title ?? document.title);
  let logoUrl = $state(appState.appearance.logoUrl ?? "");
  let logoMobileUrl = $state(appState.appearance.logoMobileUrl ?? "");
  let faviconUrl = $state(appState.appearance.faviconUrl ?? "");
  let faviconName = $state("");
  let logoName = $state("");
  let logoMobileName = $state("");

  const colorKeys = [
    "primary",
    "primary-foreground",
    "background",
    "foreground",
    "border",
    "input",
    "ring",
    "muted",
    "muted-foreground",
    "accent",
    "destructive",
    "surface-elevated",
    // Add commonly used surfaces to avoid dark blue-ish tint in dark mode
    "surface-glass",
    "surface-highlight",
    "popover",
    "popover-foreground",
  ];
  // support light and dark theme editing
  let colorMode = $state<"light" | "dark">("light");
  let colorsLight = $state<Colors>(
    Object.fromEntries(colorKeys.map((k) => [k, ""])) as Colors
  );
  let colorsDark = $state<Colors>(
    Object.fromEntries(colorKeys.map((k) => [k, ""])) as Colors
  );
  let colorHexLight = $state<Record<string, string>>(
    Object.fromEntries(colorKeys.map((k) => [k, "#000000"])) as Record<
      string,
      string
    >
  );
  let colorHexDark = $state<Record<string, string>>(
    Object.fromEntries(colorKeys.map((k) => [k, "#000000"])) as Record<
      string,
      string
    >
  );

  // Read CSS variables for a given theme by temporarily toggling root .dark
  function readTheme(theme: "light" | "dark") {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    if (theme === "light" && wasDark) root.classList.remove("dark");
    if (theme === "dark" && !wasDark) root.classList.add("dark");
    const map: Colors = {} as Colors;
    for (const key of colorKeys) {
      const cssVar = `--${key}`;
      const val = getComputedStyle(root).getPropertyValue(cssVar).trim();
      if (val) map[key] = val;
    }
    // restore original theme class
    const isDarkNow = root.classList.contains("dark");
    if (isDarkNow !== wasDark) {
      root.classList.toggle("dark", wasDark);
    }
    return map;
  }

  // Seed local editor state from CSS defaults merged with saved appearance
  function seedFromState() {
    const lightFromCss = readTheme("light");
    const darkFromCss = readTheme("dark");
    const savedLight = appState.appearance.colors || {};
    const savedDark = appState.appearance.darkColors || {};
    colorsLight = { ...lightFromCss, ...savedLight } as Colors;
    colorsDark = { ...darkFromCss, ...savedDark } as Colors;
    for (const key of colorKeys) {
      const hxL = toHex(colorsLight[key]);
      if (hxL) colorHexLight[key] = hxL;
      const hxD = toHex(colorsDark[key]);
      if (hxD) colorHexDark[key] = hxD;
    }
  }

  onMount(() => {
    // load current colors from state
    seedFromState();
  });

  // When persisted appearance changes (e.g., load from storage or after Apply), refresh editor state.
  // Guard against loops by only reseeding when the saved snapshot actually changes.
  let lastSeedSig = $state("");
  function appearanceSignature() {
    try {
      return JSON.stringify({
        l: appState.appearance.colors,
        d: appState.appearance.darkColors,
      });
    } catch {
      return String(Math.random());
    }
  }

  $effect(() => {
    const sig = appearanceSignature();
    if (sig !== lastSeedSig) {
      lastSeedSig = sig;
      seedFromState();
    }
  });

  function handleFile(
    e: Event,
    setter: (url: string) => void,
    setName?: (name: string) => void
  ) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setter(reader.result);
      if (setName) setName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function clearImage(
    setter: (url: string) => void,
    setName?: (name: string) => void
  ) {
    setter("");
    if (setName) setName("");
  }

  function applyAndSave() {
    openRemoteService.setAppearance({
      title,
      logoUrl,
      logoMobileUrl,
      faviconUrl,
      colors: colorsLight,
      darkColors: colorsDark,
    });
    // Re-sync local editors from state so the UI reflects what was persisted
    const stateLight = appState.appearance.colors || {};
    const stateDark = appState.appearance.darkColors || {};
    colorsLight = { ...colorsLight, ...stateLight } as Colors;
    colorsDark = { ...colorsDark, ...stateDark } as Colors;
    for (const key of colorKeys) {
      const hxL = toHex(colorsLight[key]);
      if (hxL) colorHexLight[key] = hxL;
      const hxD = toHex(colorsDark[key]);
      if (hxD) colorHexDark[key] = hxD;
    }
  }

  function applyBranding() {
    openRemoteService.setBranding({
      title,
      logoUrl,
      logoMobileUrl,
      faviconUrl,
    });
  }
  function resetBranding() {
    openRemoteService.resetBranding();
    title = document.title;
    logoUrl = appState.appearance.logoUrl ?? "";
    logoMobileUrl = appState.appearance.logoMobileUrl ?? "";
    faviconUrl = appState.appearance.faviconUrl ?? "";
  }

  function resetToDefault() {
    // Reset only the currently selected theme
    openRemoteService.resetThemeColors(colorMode);
    if (colorMode === "light") {
      colorsLight = readTheme("light");
      for (const key of colorKeys) {
        const hx = toHex(colorsLight[key]);
        if (hx) colorHexLight[key] = hx;
      }
    } else {
      colorsDark = readTheme("dark");
      for (const key of colorKeys) {
        const hx = toHex(colorsDark[key]);
        if (hx) colorHexDark[key] = hx;
      }
    }
  }

  let presetName = $state("");
  function savePreset() {
    if (!presetName.trim()) return;
    openRemoteService.saveAppearancePreset(presetName.trim());
    presetName = "";
  }
  function applyPreset(name: string) {
    openRemoteService.applyAppearancePreset(name);
    // refresh local form from state
    title = appState.appearance.title ?? document.title;
    logoUrl = appState.appearance.logoUrl ?? "";
    logoMobileUrl = appState.appearance.logoMobileUrl ?? "";
    faviconUrl = appState.appearance.faviconUrl ?? "";
    colorsLight = { ...appState.appearance.colors } as Colors;
    colorsDark = { ...(appState.appearance.darkColors || {}) } as Colors;
    for (const key of colorKeys) {
      const hxL = toHex(colorsLight[key]);
      if (hxL) colorHexLight[key] = hxL;
      const hxD = toHex(colorsDark[key]);
      if (hxD) colorHexDark[key] = hxD;
    }
  }
  function deletePreset(name: string) {
    openRemoteService.deleteAppearancePreset(name);
  }

  const presets = $derived(appState.appearancePresets);

  function onHexChange(key: string, v: string) {
    if (colorMode === "light") {
      colorHexLight[key] = v;
      colorsLight[key] = v;
    } else {
      colorHexDark[key] = v;
      colorsDark[key] = v;
    }
  }

  function onTextChange(key: string, v: string) {
    if (colorMode === "light") {
      colorsLight[key] = v;
    } else {
      colorsDark[key] = v;
    }
  }

  // Helpers to allow bind:value with { get, set } pair
  function hexPair(key: string) {
    return {
      get: () =>
        colorMode === "light" ? colorHexLight[key] : colorHexDark[key],
      set: (v: string) => onHexChange(key, v),
    } as { get: () => string; set: (v: string) => void };
  }
  function textPair(key: string) {
    return {
      get: () => (colorMode === "light" ? colorsLight[key] : colorsDark[key]),
      set: (v: string) => onTextChange(key, v),
    } as { get: () => string; set: (v: string) => void };
  }

  $effect(() => {
    const src = colorMode === "light" ? colorsLight : colorsDark;
    const dst = colorMode === "light" ? colorHexLight : colorHexDark;
    for (const key of colorKeys) {
      const v = src[key];
      const hex = toHex(v);
      if (hex) dst[key] = hex;
    }
  });

  function toHex(value: string | undefined): string | "" {
    if (!value) return "";
    if (/^#([0-9a-fA-F]{6})$/.test(value)) return value;
    // Direct OKLCH -> Hex conversion (works even when browser can't render OKLCH)
    const okRe =
      /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+)?\s*\)$/i;
    const mOk = value.match(okRe);
    if (mOk) {
      const Lraw = mOk[1];
      const C = parseFloat(mOk[2]);
      const H = parseFloat(mOk[3]);
      const L = /%$/.test(Lraw)
        ? Math.max(0, Math.min(100, parseFloat(Lraw))) / 100
        : parseFloat(Lraw);
      return oklchToHex(L, C, H);
    }
    try {
      // Robust parsing via CSS variable indirection so browsers without JS OKLCH parser still work
      const el = document.createElement("span");
      const root = document.documentElement;
      const varName = "--tmp-color-parse";
      root.style.setProperty(varName, value);
      el.style.color = `var(${varName})`;
      document.body.appendChild(el);
      const rgb = getComputedStyle(el).color; // e.g., rgb(255, 255, 255)
      document.body.removeChild(el);
      root.style.removeProperty(varName);
      const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!m) return "";
      const r = Number(m[1]).toString(16).padStart(2, "0");
      const g = Number(m[2]).toString(16).padStart(2, "0");
      const b = Number(m[3]).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    } catch {
      return "";
    }
  }

  function oklchToHex(L: number, C: number, H: number): string {
    // Convert OKLCH -> OKLab
    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    // OKLab -> LMS
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    // LMS -> linear sRGB
    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let b2 = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    // Clamp to 0..1
    r = Math.min(1, Math.max(0, r));
    g = Math.min(1, Math.max(0, g));
    b2 = Math.min(1, Math.max(0, b2));

    // Linear -> gamma-corrected sRGB
    const toSRGB = (x: number) =>
      x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    const R = Math.round(toSRGB(r) * 255);
    const G = Math.round(toSRGB(g) * 255);
    const B = Math.round(toSRGB(b2) * 255);
    const hex = `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(2, "0")}${B.toString(16).padStart(2, "0")}`;
    return hex;
  }
</script>

<div class="flex flex-col gap-8 pb-24 lg:gap-10">
  <!-- Back to <page> -->
  {#if true}
    {@const backIndex = appState.lastPageIndex ?? PageIndex.ALARMS}
    {@const backPage = pages.find((p) => p.index === backIndex)}
    <div class="flex items-center justify-between gap-3">
      <Button
        variant="ghost"
        size="sm"
        class="gap-2"
        onclick={() => openRemoteService.navigateTo(backIndex)}
      >
        <ArrowLeft class="size-4" />
        Back to {backPage?.title ? backPage.title.toLowerCase() : "alarms"}
      </Button>
    </div>
  {/if}

  <header>
    <h2 class="text-foreground text-lg font-semibold tracking-tight">
      Appearance
    </h2>
    <p class="text-muted-foreground text-sm">
      Customize branding and colors. Changes are saved locally for you and
      persist across restarts.
    </p>
  </header>

  <!-- Branding header row only -->
  <Card class="border-border/50 border bg-[var(--surface-glass)]/50">
    <CardHeader class="flex-row items-center gap-3">
      <h3 class="text-foreground truncate text-base font-semibold">Branding</h3>
      <div class="ml-auto flex shrink-0 items-center gap-2">
        <Button onclick={applyBranding}>Save</Button>
        <Button variant="outline" onclick={resetBranding}>Reset</Button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        <!-- Website Title full width -->
        <div
          class="border-border/60 rounded-2xl border bg-[var(--surface-glass)]/50 p-4"
        >
          <Label class="mb-2 block">Website title</Label>
          <Input bind:value={title} placeholder="Enter site title" />
        </div>

        <!-- Upload cards row: 3 columns on sm+ -->
        <div class="grid gap-4 sm:grid-cols-3">
          <!-- Favicon Card -->
          <div
            class="border-border/60 rounded-2xl border bg-[var(--surface-glass)]/50 p-4"
          >
            <Label class="mb-3 block">Favicon</Label>
            <button
              type="button"
              class="group border-border/60 hover:border-primary/50 focus:ring-primary/40 relative mb-3 grid min-h-36 w-full place-items-center rounded-2xl border-2 border-dashed bg-[var(--surface-glass)]/50 p-4 text-center transition focus:ring-2 focus:outline-none"
              onclick={() => document.getElementById("faviconUpload")?.click()}
            >
              {#if faviconUrl}
                <img
                  src={faviconUrl}
                  alt="favicon"
                  class="max-h-24 w-auto object-contain"
                />
              {:else}
                <div
                  class="text-muted-foreground flex flex-col items-center gap-2 text-sm"
                >
                  <Camera class="text-foreground/70 size-6" />
                  <span>Add image</span>
                  <Button
                    size="sm"
                    variant="outline"
                    class="pointer-events-none"
                    ><ImagePlus class="mr-1 size-4" /> Upload</Button
                  >
                </div>
              {/if}
            </button>
            <div class="flex items-center gap-2">
              <Input
                class="flex-1"
                bind:value={faviconName}
                placeholder="Please upload an image"
                readonly
              />
              <input
                id="faviconUpload"
                class="hidden"
                type="file"
                accept="image/*"
                onchange={(e: Event) =>
                  handleFile(
                    e,
                    (u) => (faviconUrl = u),
                    (n) => (faviconName = n)
                  )}
              />
              {#if faviconUrl}
                <Button
                  variant="ghost"
                  onclick={() =>
                    clearImage(
                      (u) => (faviconUrl = u as any),
                      (n) => (faviconName = n as any)
                    )}>Clear</Button
                >
              {/if}
            </div>
          </div>

          <!-- Logo Card -->
          <div
            class="border-border/60 rounded-2xl border bg-[var(--surface-glass)]/50 p-4"
          >
            <Label class="mb-3 block">Logo</Label>
            <button
              type="button"
              class="group border-border/60 hover:border-primary/50 focus:ring-primary/40 relative mb-3 grid min-h-36 w-full place-items-center rounded-2xl border-2 border-dashed bg-[var(--surface-glass)]/50 p-4 text-center transition focus:ring-2 focus:outline-none"
              onclick={() => document.getElementById("logoUpload")?.click()}
            >
              {#if logoUrl}
                <img
                  src={logoUrl}
                  alt="logo"
                  class="max-h-24 w-auto object-contain"
                />
              {:else}
                <div
                  class="text-muted-foreground flex flex-col items-center gap-2 text-sm"
                >
                  <Camera class="text-foreground/70 size-6" />
                  <span>Add image</span>
                  <Button
                    size="sm"
                    variant="outline"
                    class="pointer-events-none"
                    ><ImagePlus class="mr-1 size-4" /> Upload</Button
                  >
                </div>
              {/if}
            </button>
            <div class="flex items-center gap-2">
              <Input
                class="flex-1"
                bind:value={logoName}
                placeholder="Please upload an image"
                readonly
              />
              <input
                id="logoUpload"
                class="hidden"
                type="file"
                accept="image/*"
                onchange={(e: Event) =>
                  handleFile(
                    e,
                    (u) => (logoUrl = u),
                    (n) => (logoName = n)
                  )}
              />
              {#if logoUrl}
                <Button
                  variant="ghost"
                  onclick={() =>
                    clearImage(
                      (u) => (logoUrl = u as any),
                      (n) => (logoName = n as any)
                    )}>Clear</Button
                >
              {/if}
            </div>
          </div>

          <!-- Logo (mobile) Card -->
          <div
            class="border-border/60 rounded-2xl border bg-[var(--surface-glass)]/50 p-4"
          >
            <Label class="mb-3 block">Logo (mobile)</Label>
            <button
              type="button"
              class="group border-border/60 hover:border-primary/50 focus:ring-primary/40 relative mb-3 grid min-h-36 w-full place-items-center rounded-2xl border-2 border-dashed bg-[var(--surface-glass)]/50 p-4 text-center transition focus:ring-2 focus:outline-none"
              onclick={() =>
                document.getElementById("logoMobileUpload")?.click()}
            >
              {#if logoMobileUrl}
                <img
                  src={logoMobileUrl}
                  alt="logo mobile"
                  class="max-h-24 w-auto object-contain"
                />
              {:else}
                <div
                  class="text-muted-foreground flex flex-col items-center gap-2 text-sm"
                >
                  <Camera class="text-foreground/70 size-6" />
                  <span>Add image</span>
                  <Button
                    size="sm"
                    variant="outline"
                    class="pointer-events-none"
                    ><ImagePlus class="mr-1 size-4" /> Upload</Button
                  >
                </div>
              {/if}
            </button>
            <div class="flex items-center gap-2">
              <Input
                class="flex-1"
                bind:value={logoMobileName}
                placeholder="Please upload an image"
                readonly
              />
              <input
                id="logoMobileUpload"
                class="hidden"
                type="file"
                accept="image/*"
                onchange={(e: Event) =>
                  handleFile(
                    e,
                    (u) => (logoMobileUrl = u),
                    (n) => (logoMobileName = n)
                  )}
              />
              {#if logoMobileUrl}
                <Button
                  variant="ghost"
                  onclick={() =>
                    clearImage(
                      (u) => (logoMobileUrl = u as any),
                      (n) => (logoMobileName = n as any)
                    )}>Clear</Button
                >
              {/if}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card class="border-border/50 border bg-[var(--surface-glass)]/50">
    <CardHeader class="gap-3">
      <!-- Mobile: title, switch (after title), and buttons on the same row -->
      <div class="flex items-center justify-between gap-2 sm:hidden">
        <div class="flex items-center gap-2">
          <h3 class="text-foreground font-semibold">Colors</h3>
          <div
            class="border-border/60 ml-2 flex items-center rounded-lg border bg-[var(--surface-glass)]/50 p-1 text-xs shadow-sm"
          >
            <button
              class={"rounded-md px-3 py-1 " +
                (colorMode === "light"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80")}
              onclick={() => (colorMode = "light")}>Light</button
            >
            <button
              class={"rounded-md px-3 py-1 " +
                (colorMode === "dark"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80")}
              onclick={() => (colorMode = "dark")}>Dark</button
            >
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button onclick={applyAndSave}>Save</Button>
          <Button variant="outline" onclick={resetToDefault}>Reset</Button>
        </div>
      </div>
      <!-- Desktop and larger: three-column header with title left, switch centered, buttons right -->
      <div class="hidden w-full grid-cols-3 items-center gap-3 sm:grid">
        <h3 class="text-foreground font-semibold">Colors</h3>
        <div class="flex justify-center">
          <div
            class="border-border/60 flex items-center rounded-lg border bg-[var(--surface-glass)]/50 p-1 text-xs shadow-sm"
          >
            <button
              class={"rounded-md px-3 py-1 " +
                (colorMode === "light"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80")}
              onclick={() => (colorMode = "light")}>Light</button
            >
            <button
              class={"rounded-md px-3 py-1 " +
                (colorMode === "dark"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80")}
              onclick={() => (colorMode = "dark")}>Dark</button
            >
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button onclick={applyAndSave}>Save</Button>
          <Button variant="outline" onclick={resetToDefault}>Reset</Button>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each colorKeys as key}
          <div class="space-y-2">
            <Label class="capitalize">{key.replaceAll("-", " ")}</Label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                value={colorMode === "light"
                  ? colorHexLight[key]
                  : colorHexDark[key]}
                class="border-border/60 h-10 w-14 rounded-lg border bg-transparent p-1"
                onchange={(e: Event) =>
                  onHexChange(key, (e.target as HTMLInputElement).value)}
              />
              <Input
                class="flex-1"
                value={colorMode === "light"
                  ? colorsLight[key]
                  : colorsDark[key]}
                placeholder="#3366FF or oklch(...)"
                oninput={(e: Event) =>
                  onTextChange(key, (e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <Card class="border-border/50 border bg-[var(--surface-glass)]/50">
    <CardHeader>
      <h3 class="text-foreground font-semibold">Presets</h3>
    </CardHeader>
    <CardContent class="space-y-3">
      <div class="flex items-center gap-2">
        <Input
          class="flex-1"
          bind:value={presetName}
          placeholder="Preset name"
        />
        <Button onclick={savePreset} disabled={!presetName.trim()}
          >Save preset</Button
        >
      </div>
      {#if presets.length > 0}
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {#each presets as p (p.name)}
            <div
              class="border-border/60 flex items-center justify-between gap-2 rounded-2xl border bg-[var(--surface-glass)]/70 p-3"
            >
              <div class="text-foreground truncate text-sm font-medium">
                {p.name}
              </div>
              <div class="flex items-center gap-2">
                <Button size="sm" onclick={() => applyPreset(p.name)}
                  >Apply</Button
                >
                <Button
                  size="sm"
                  variant="ghost"
                  onclick={() => deletePreset(p.name)}>Delete</Button
                >
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-muted-foreground text-sm">
          No presets yet. Create one from your current settings.
        </p>
      {/if}
    </CardContent>
  </Card>
</div>

<style>
  /* ensure native color input fits theme */
  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: 0.5rem;
  }
</style>
