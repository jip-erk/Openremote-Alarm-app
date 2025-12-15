<!-- 
// ==============================
// LOCATION CARD (Real & Mock)
// ==============================
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    Card,
    CardContent,
    CardHeader,
  } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { mockStorage } from "$lib/services/mock-storage.service";
  import MapPin from "@lucide/svelte/icons/map-pin";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
  import "leaflet/dist/leaflet.css";

  export let entityId: string | undefined = undefined;
  export let entityType: "alarm" | "asset" = "alarm";
  export let fixedLocation: { lat: number; lng: number } | undefined =
    undefined;

  let mapElement: HTMLElement;

  let map: any;
  let marker: any;
  let L: any;

  const DEFAULT_LAT = 51.45; // Eindhoven-ish
  const DEFAULT_LNG = 5.48;

  interface Location {
    lat: number;
    lng: number;
  }

  let location: Location | null = null;

  $: storageKey = entityId
    ? `mock:${entityType}:${entityId}:location`
    : `mock:${entityType}:draft:location`;

  function loadLocation() {
    location = mockStorage.get<Location>(storageKey);
  }

  function saveLocation() {
    if (location) {
      mockStorage.set(storageKey, location);
    }
  }

  export function save() {
    saveLocation();
  }

  function resetLocation() {
    location = null;
    mockStorage.remove(storageKey);
    if (map) {
      map.setView([DEFAULT_LAT, DEFAULT_LNG], 13);
      if (marker) {
        marker.setLatLng([DEFAULT_LAT, DEFAULT_LNG]);
      }
    }
  }

  onMount(async () => {
    if (typeof window !== "undefined") {
      L = (await import("leaflet")).default;

      // Fix Leaflet icon issues in Webpack/Vite
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      loadLocation();
      const initialLat = location?.lat ?? DEFAULT_LAT;
      const initialLng = location?.lng ?? DEFAULT_LNG;

      map = L.map(mapElement).setView([initialLat, initialLng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(
        map
      );

      marker.on("dragend", (event: any) => {
        const latLng = event.target.getLatLng();
        location = { lat: latLng.lat, lng: latLng.lng };
        if (!entityId) saveLocation();
      });

      map.on("click", (e: any) => {
        if (fixedLocation) return;
        marker.setLatLng(e.latlng);
        location = { lat: e.latlng.lat, lng: e.latlng.lng };
        if (!entityId) saveLocation();
      });
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

  $: if (map && marker) {
    if (fixedLocation) {
      location = fixedLocation;
    } else {
      loadLocation();
    }

    if (location) {
      const { lat, lng } = location;
      map.setView([lat, lng], map.getZoom());
      marker.setLatLng([lat, lng]);
    } else {
      map.setView([DEFAULT_LAT, DEFAULT_LNG], 13);
      marker.setLatLng([DEFAULT_LAT, DEFAULT_LNG]);
    }
  }
</script>

<Card class="border-border/50 border bg-[var(--surface-glass)]/50">
  <CardHeader>
    <h3
      class="text-foreground flex items-center justify-between leading-none font-semibold tracking-tight"
    >
      <span class="flex items-center gap-2">
        <MapPin class="size-5" />
        Location
      </span>
      <div class="flex items-center gap-2">
        {#if !fixedLocation}
          <Button
            variant="ghost"
            size="icon"
            class="h-6 w-6"
            onclick={resetLocation}
            title="Reset Location"
          >
            <RotateCcw class="size-3" />
          </Button>
        {/if}
        <span
          class="border-border rounded border px-2 py-0.5 text-xs font-normal tracking-wider uppercase opacity-70"
          >{fixedLocation ? "Asset Location" : "Mock Only"}</span
        >
      </div>
    </h3>
  </CardHeader>
  <CardContent>
    <div
      class="border-border z-0 h-[300px] w-full overflow-hidden rounded-lg border"
      bind:this={mapElement}
    ></div>
    {#if location}
      <div class="text-muted-foreground mt-2 font-mono text-xs">
        Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
      </div>
    {:else}
      <div class="text-muted-foreground mt-2 text-xs italic">
        Default location shown. Click map to set marker.
      </div>
    {/if}
  </CardContent>
</Card>
