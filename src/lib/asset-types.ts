import type { UserAssetLink } from "@openremote/model";
import Box from "@lucide/svelte/icons/box";
import Building2 from "@lucide/svelte/icons/building-2";
import DoorClosed from "@lucide/svelte/icons/door-closed";
import Router from "@lucide/svelte/icons/router";
import MonitorSmartphone from "@lucide/svelte/icons/monitor-smartphone";
import CloudSun from "@lucide/svelte/icons/cloud-sun";
import Lightbulb from "@lucide/svelte/icons/lightbulb";
import Mic from "@lucide/svelte/icons/mic";
import Thermometer from "@lucide/svelte/icons/thermometer";
import Car from "@lucide/svelte/icons/car";
import PlugZap from "@lucide/svelte/icons/plug-zap";
import Sun from "@lucide/svelte/icons/sun";
import Wind from "@lucide/svelte/icons/wind";
import BatteryCharging from "@lucide/svelte/icons/battery-charging";
import Bolt from "@lucide/svelte/icons/bolt";
import Users from "@lucide/svelte/icons/users";
import Droplets from "@lucide/svelte/icons/droplets";
import Eye from "@lucide/svelte/icons/eye";
import FolderTree from "@lucide/svelte/icons/folder-tree";
import Ship from "@lucide/svelte/icons/ship";
import Plug from "@lucide/svelte/icons/plug";

// Canonical type keys used by the app
export type AssetTypeKey =
  | "building"
  | "city"
  | "room"
  | "gateway"
  | "console"
  | "weather"
  | "light"
  | "microphone"
  | "thermostat"
  | "electric-vehicle"
  | "ev-charger"
  | "electricity-producer-solar"
  | "electricity-producer-wind"
  | "electricity-storage"
  | "electricity-supplier"
  | "environment-sensor"
  | "groundwater-sensor"
  | "people-counter"
  | "presence-sensor"
  | "parking"
  | "ship"
  | "door"
  | "plug"
  | "group"
  | "thing"
  | "unknown";

export type AssetIconComponent = typeof Box;

export interface AssetTypeInfo {
  key: AssetTypeKey;
  label: string;
  // Known descriptor slugs (from AssetDescriptor name) and other aliases to match
  slugs: string[];
  // Java simple class names to match
  classNames: string[];
  icon: AssetIconComponent;
  // Tailwind classes for bg/text color hints
  colorClasses?: { bg: string; text: string };
}

// Mapping informed by openremote model asset impl descriptors
export const ASSET_TYPE_REGISTRY: Record<AssetTypeKey, AssetTypeInfo> = {
  building: {
    key: "building",
    label: "Building",
    slugs: ["office-building"],
    classNames: ["BuildingAsset"],
    icon: Building2,
    colorClasses: { bg: "bg-blue-500/10", text: "text-blue-600" },
  },
  city: {
    key: "city",
    label: "City",
    slugs: ["city"],
    classNames: ["CityAsset"],
    icon: Building2,
    colorClasses: { bg: "bg-indigo-500/10", text: "text-indigo-600" },
  },
  room: {
    key: "room",
    label: "Room",
    slugs: ["door"],
    classNames: ["RoomAsset"],
    icon: DoorClosed,
    colorClasses: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  },
  gateway: {
    key: "gateway",
    label: "Gateway",
    slugs: ["router-wireless"],
    classNames: ["GatewayAsset"],
    icon: Router,
    colorClasses: { bg: "bg-amber-500/10", text: "text-amber-600" },
  },
  console: {
    key: "console",
    label: "Console",
    slugs: ["monitor-cellphone"],
    classNames: ["ConsoleAsset"],
    icon: MonitorSmartphone,
    colorClasses: { bg: "bg-slate-500/10", text: "text-slate-600" },
  },
  weather: {
    key: "weather",
    label: "Weather",
    slugs: ["weather-partly-cloudy"],
    classNames: ["WeatherAsset"],
    icon: CloudSun,
    colorClasses: { bg: "bg-cyan-500/10", text: "text-cyan-600" },
  },
  light: {
    key: "light",
    label: "Light",
    slugs: ["lightbulb"],
    classNames: ["LightAsset"],
    icon: Lightbulb,
    colorClasses: { bg: "bg-rose-500/10", text: "text-rose-600" },
  },
  microphone: {
    key: "microphone",
    label: "Microphone",
    slugs: ["microphone"],
    classNames: ["MicrophoneAsset"],
    icon: Mic,
    colorClasses: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-600" },
  },
  thermostat: {
    key: "thermostat",
    label: "Thermostat",
    slugs: ["thermostat"],
    classNames: ["ThermostatAsset"],
    icon: Thermometer,
    colorClasses: { bg: "bg-orange-500/10", text: "text-orange-600" },
  },
  "electric-vehicle": {
    key: "electric-vehicle",
    label: "Electric Vehicle",
    slugs: ["car-electric"],
    classNames: ["ElectricVehicleAsset"],
    icon: Car,
    colorClasses: { bg: "bg-lime-500/10", text: "text-lime-600" },
  },
  "ev-charger": {
    key: "ev-charger",
    label: "EV Charger",
    slugs: ["ev-station"],
    classNames: ["ElectricityChargerAsset"],
    icon: PlugZap,
    colorClasses: { bg: "bg-green-500/10", text: "text-green-600" },
  },
  "electricity-producer-solar": {
    key: "electricity-producer-solar",
    label: "Solar Producer",
    slugs: ["solar-power"],
    classNames: ["ElectricityProducerSolarAsset"],
    icon: Sun,
    colorClasses: { bg: "bg-yellow-500/10", text: "text-yellow-600" },
  },
  "electricity-producer-wind": {
    key: "electricity-producer-wind",
    label: "Wind Producer",
    slugs: ["wind-turbine"],
    classNames: ["ElectricityProducerWindAsset"],
    icon: Wind,
    colorClasses: { bg: "bg-teal-500/10", text: "text-teal-600" },
  },
  "electricity-storage": {
    key: "electricity-storage",
    label: "Electricity Storage",
    slugs: ["battery"],
    classNames: ["ElectricityStorageAsset", "ElectricityBatteryAsset"],
    icon: BatteryCharging,
    colorClasses: { bg: "bg-violet-500/10", text: "text-violet-600" },
  },
  "electricity-supplier": {
    key: "electricity-supplier",
    label: "Electricity Supplier",
    slugs: ["factory"],
    classNames: ["ElectricitySupplierAsset"],
    icon: Bolt,
    colorClasses: { bg: "bg-yellow-500/10", text: "text-yellow-700" },
  },
  "environment-sensor": {
    key: "environment-sensor",
    label: "Environment Sensor",
    slugs: ["leaf"],
    classNames: ["EnvironmentSensorAsset"],
    icon: Droplets,
    colorClasses: { bg: "bg-sky-500/10", text: "text-sky-600" },
  },
  "groundwater-sensor": {
    key: "groundwater-sensor",
    label: "Groundwater Sensor",
    slugs: ["waves"],
    classNames: ["GroundwaterSensorAsset"],
    icon: Droplets,
    colorClasses: { bg: "bg-blue-500/10", text: "text-blue-700" },
  },
  "people-counter": {
    key: "people-counter",
    label: "People Counter",
    slugs: ["account-multiple"],
    classNames: ["PeopleCounterAsset"],
    icon: Users,
    colorClasses: { bg: "bg-purple-500/10", text: "text-purple-600" },
  },
  "presence-sensor": {
    key: "presence-sensor",
    label: "Presence Sensor",
    slugs: ["motion-sensor"],
    classNames: ["PresenceSensorAsset"],
    icon: Eye,
    colorClasses: { bg: "bg-pink-500/10", text: "text-pink-600" },
  },
  parking: {
    key: "parking",
    label: "Parking",
    slugs: ["parking"],
    classNames: ["ParkingAsset"],
    icon: Car,
    colorClasses: { bg: "bg-gray-500/10", text: "text-gray-600" },
  },
  ship: {
    key: "ship",
    label: "Ship",
    slugs: ["ferry"],
    classNames: ["ShipAsset"],
    icon: Ship,
    colorClasses: { bg: "bg-cyan-500/10", text: "text-cyan-700" },
  },
  door: {
    key: "door",
    label: "Door",
    slugs: ["door-closed"],
    classNames: ["DoorAsset"],
    icon: DoorClosed,
    colorClasses: { bg: "bg-emerald-500/10", text: "text-emerald-700" },
  },
  plug: {
    key: "plug",
    label: "Plug",
    slugs: ["power-plug"],
    classNames: ["PlugAsset"],
    icon: Plug,
    colorClasses: { bg: "bg-stone-500/10", text: "text-stone-700" },
  },
  group: {
    key: "group",
    label: "Group",
    slugs: ["folder"],
    classNames: ["GroupAsset", "ElectricVehicleFleetGroupAsset"],
    icon: FolderTree,
    colorClasses: { bg: "bg-slate-500/10", text: "text-slate-600" },
  },
  thing: {
    key: "thing",
    label: "Thing",
    slugs: ["cube"],
    classNames: ["ThingAsset", "UnknownAsset", "Asset"],
    icon: Box,
    colorClasses: { bg: "bg-slate-500/10", text: "text-slate-600" },
  },
  unknown: {
    key: "unknown",
    label: "Unknown",
    slugs: [],
    classNames: [],
    icon: Box,
    colorClasses: { bg: "bg-slate-500/10", text: "text-slate-600" },
  },
};

export type OrAssetLike = {
  type?: string | { name?: string };
  typeName?: string;
  assetType?: string | { name?: string };
};

function normalizeTypeName(input: unknown): string | null {
  if (!input) return null;
  if (typeof input === "string") return input.toLowerCase();
  if (typeof input === "object") {
    const obj = input as { name?: unknown };
    if (typeof obj.name === "string") return obj.name.toLowerCase();
  }
  return null;
}

/**
 * Resolve a canonical AssetTypeKey from an asset object returned by REST
 */
export function resolveTypeKeyFromAsset(
  asset: OrAssetLike | null | undefined
): AssetTypeKey {
  const candidates: Array<string | null> = [
    normalizeTypeName(asset?.type),
    asset?.typeName ? asset?.typeName.toLowerCase() : null,
    normalizeTypeName(asset?.assetType),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    // Direct match on descriptor slugs
    for (const info of Object.values(ASSET_TYPE_REGISTRY)) {
      if (info.slugs.includes(candidate)) return info.key;
    }
    // Match on java class simple names
    for (const info of Object.values(ASSET_TYPE_REGISTRY)) {
      if (info.classNames.map((c) => c.toLowerCase()).includes(candidate))
        return info.key;
    }
  }
  return "unknown";
}

/**
 * Try to infer a type key from a user asset link; limited information, so we fall back to console/unknown.
 */
export function resolveTypeKeyFromLink(
  link: UserAssetLink | null | undefined,
  isConsole: boolean
): AssetTypeKey {
  if (isConsole) return "console";
  // Some backends might include a type name field on the link
  const candidate =
    (link as unknown as { assetType?: string; typeName?: string })?.assetType ||
    (link as unknown as { assetType?: string; typeName?: string })?.typeName;
  if (typeof candidate === "string") {
    const lower = candidate.toLowerCase();
    for (const info of Object.values(ASSET_TYPE_REGISTRY)) {
      if (info.slugs.includes(lower)) return info.key;
      if (info.classNames.map((c) => c.toLowerCase()).includes(lower))
        return info.key;
    }
  }
  return "unknown";
}

export function getTypeInfoByKey(key: AssetTypeKey): AssetTypeInfo {
  return ASSET_TYPE_REGISTRY[key] ?? ASSET_TYPE_REGISTRY.unknown;
}
