import openremote from "@openremote/core";
import rest from "@openremote/rest";
import type {
  Auth,
  AlarmEvent,
  SentAlarm,
  Alarm,
  UserAssetLink,
  Asset,
  UserAssetLinkId,
} from "@openremote/model";
import { pages } from "$lib/pages";

type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "system";

const THEME_STORAGE_KEY = "or-theme";
const DEFAULT_MANAGER_URL = "https://localhost";
const SHOW_CONSOLE_ASSETS_KEY = "or-show-console-assets";

interface User {
  id?: string;
  username: string;
  roles: Map<string, string[]>;
}

function getStoredPageIndex(): number {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("pageIndex");
    return stored ? parseInt(stored, 10) : 0;
  }
  return 0;
}

function savePageIndex(index: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem("pageIndex", index.toString());
  }
}

function getStoredShowConsoleAssets(): boolean {
  if (typeof window === "undefined") return false;
  const v = localStorage.getItem(SHOW_CONSOLE_ASSETS_KEY);
  return v === "true";
}

function getStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(
    THEME_STORAGE_KEY
  ) as ThemePreference | null;
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  return prefersDark.matches ? "dark" : "light";
}

function resolveTheme(preference: ThemePreference): ThemeMode {
  return preference === "system" ? getSystemTheme() : preference;
}

function applyThemeClass(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

function normalizeUrl(value?: string) {
  if (!value) return undefined;
  return value.replace(/\/+$|\/+(?=\?)/g, "");
}

export function resolveManagerBaseUrl() {
  const explicit = normalizeUrl(import.meta.env?.VITE_OR_MANAGER_URL);
  if (explicit) return explicit;
  // Always use the Docker OpenRemote instance
  return DEFAULT_MANAGER_URL;
}

function resolveKeycloakUrl(managerUrl: string) {
  const explicit = normalizeUrl(import.meta.env?.VITE_OR_KEYCLOAK_URL);
  if (explicit) return explicit;
  return `${managerUrl}/auth`;
}

export const appState = $state({
  pageIndex: getStoredPageIndex(),
  // Track last visited page to enable contextual "Back to <page>" actions
  lastPageIndex: undefined as number | undefined,
  selectedAlarm: null as SentAlarm | null,
  selectedUserAssetLink: null as UserAssetLink | null,
  selectedAsset: null as Asset | null,
  initialized: false,
  alarms: [] as SentAlarm[],
  assets: [] as UserAssetLink[],
  // Map of assetId -> true when the asset is of type ConsoleAsset
  consoleAssetIds: {} as Record<string, boolean>,
  // Map of assetId -> backend-reported type name/slug/class (used for icon mapping)
  assetTypeById: {} as Record<string, string>,
  // UI preference: hide console assets by default
  showConsoleAssets: getStoredShowConsoleAssets(),
  assignees: [] as { value: string | null; label: string }[],
  user: null as User | null,
  themePreference: getStoredThemePreference(),
  theme: resolveTheme(getStoredThemePreference()),
  // Appearance customization (persisted per-user locally)
  appearance: {
    title: undefined as string | undefined,
    logoUrl: undefined as string | undefined,
    logoMobileUrl: undefined as string | undefined,
    faviconUrl: undefined as string | undefined,
    colors: {} as Record<string, string>,
    darkColors: {} as Record<string, string>,
  },
  appearancePresets: [] as {
    name: string;
    appearance: {
      title?: string;
      logoUrl?: string;
      logoMobileUrl?: string;
      faviconUrl?: string;
      colors: Record<string, string>;
      darkColors?: Record<string, string>;
    };
  }[],
});

if (typeof window !== "undefined") {
  applyThemeClass(appState.theme);
  const systemWatcher = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemChange = () => {
    if (appState.themePreference === "system") {
      appState.theme = resolveTheme("system");
      applyThemeClass(appState.theme);
    }
  };
  systemWatcher.addEventListener("change", handleSystemChange);
}

class OpenRemoteService {
  async init() {
    if (appState.initialized) return true;

    try {
      const managerUrl = resolveManagerBaseUrl();
      const keycloakUrl = resolveKeycloakUrl(managerUrl);
      const success = await openremote.init({
        managerUrl,
        keycloakUrl,
        auth: "KEYCLOAK" as Auth,
        consoleAutoEnable: false,
        skipFallbackToBasicAuth: true,
        autoLogin: true,
        realm: "master",
        configureTranslationsOptions: (options: any) => {
          options.lng = "nl";
        },
      });

      if (success) {
        appState.initialized = true;
        const profile = (openremote as any)._keycloak.profile;

        appState.user = {
          id: profile?.id || undefined,
          username: openremote?.username || "Unknown",
          roles: openremote?.roles || new Map(),
        };

        // Load all data required by initial views so labels (e.g., assignees) render correctly
        await Promise.all([
          this.fetchAlarms(),
          this.fetchAssets(),
          this.listAssignees(),
        ]);

        // Load persisted appearance for this user and apply
        this.loadAppearance();

        openremote?.events?.subscribe<AlarmEvent>(
          { eventType: "alarm" },
          () => {
            this.fetchAlarms();
          }
        );
      }

      return success;
    } catch (error) {
      console.error("Failed to initialize OpenRemote:", error);
      return false;
    }
  }

  async fetchAlarms() {
    try {
      const response = await rest.api.AlarmResource.getAlarms({
        realm: "master",
      });
      appState.alarms = response.data;
    } catch (error) {
      console.error("Failed to fetch alarms:", error);
    }
  }

  async getAlarm(alarmId?: number) {
    try {
      if (!alarmId) return;
      const response = await rest.api.AlarmResource.getAlarm(alarmId);

      appState.selectedAlarm = response.data;
    } catch (error) {
      console.error("Failed to get alarm:", error);
      throw error;
    }
  }

  async addAlarm(alarm: Alarm, assetIds: string[]) {
    try {
      if (alarm.assigneeId === "") delete alarm.assigneeId;
      const response = await rest.api.AlarmResource.createAlarm(alarm, {
        assetIds,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create alarm:", error);
      throw error;
    }
  }

  async updateAlarm(id: number, alarm: SentAlarm) {
    try {
      if (alarm.assigneeId === "") delete alarm.assigneeId;
      const response = await rest.api.AlarmResource.updateAlarm(id, alarm);
      return response.data;
    } catch (error) {
      console.error("Failed to create alarm:", error);
      throw error;
    }
  }

  async removeAlarm(alarmId: number) {
    try {
      await rest.api.AlarmResource.removeAlarm(alarmId);
      appState.alarms = appState.alarms.filter((a) => a.id !== alarmId);
    } catch (error) {
      console.error("Failed to remove alarm:", error);
      throw error;
    }
  }

  async fetchAssets() {
    try {
      const response = await rest.api.AssetResource.getUserAssetLinks();
      const links = response.data;
      appState.assets = links;

      // Enrich with actual asset type to detect ConsoleAsset and cache by id
      const ids = links
        .map((l) => l.id?.assetId)
        .filter((id): id is string => typeof id === "string");

      if (ids.length > 0) {
        const results = await Promise.allSettled(
          ids.map((id) => rest.api.AssetResource.get(id))
        );

        const map: Record<string, boolean> = {};
        const typeMap: Record<string, string> = {};
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const id = ids[i]!;
          if (result.status === "fulfilled") {
            const asset: any = result.value.data;
            // Try multiple common locations for type name
            const typeName =
              asset?.type ||
              asset?.typeName ||
              asset?.assetType ||
              asset?.assetType?.name ||
              asset?.type?.name;
            map[id] =
              typeof typeName === "string" && /ConsoleAsset$/i.test(typeName);
            if (typeof typeName === "string") {
              typeMap[id] = typeName;
            } else if (typeof typeName?.toString === "function") {
              typeMap[id] = String(typeName);
            }
          }
        }
        appState.consoleAssetIds = map;
        appState.assetTypeById = typeMap;
      } else {
        appState.consoleAssetIds = {};
        appState.assetTypeById = {};
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    }
  }

  async getAsset(userAssetLinkId: UserAssetLinkId) {
    try {
      const response = await rest.api.AssetResource.get(
        userAssetLinkId.assetId!
      );
      appState.selectedAsset = response.data;
      console.log(appState.selectedAsset);
    } catch (error) {
      console.error("Failed to fetch asset:", error);
    }
  }

  async listAssignees() {
    try {
      const response = await rest.api.UserResource.query({
        realmPredicate: { name: "master" },
      });
      const options = response.data
        .filter((u) => u.username != "manager-keycloak")
        .map((u) => {
          return { value: u.id ?? null, label: u.username || "Unknown" };
        });
      options.unshift({ value: null, label: "None" });
      appState.assignees = options;
    } catch (error) {
      console.error("Failed to list assignees:", error);
      return [];
    }
  }

  navigateTo(pageIndex: number, alarm?: SentAlarm) {
    appState.selectedAlarm = null;
    // Remember where we came from for back-navigation on hidden pages
    appState.lastPageIndex = appState.pageIndex;
    const page = pages.find((p) => p.index === pageIndex);
    if (!page) return;
    const roles = appState.user?.roles?.get("openremote");
    // If page has roles defined, check them. If empty, it's public.
    if (page.roles.length > 0 && !page.roles.some((r) => roles?.includes(r)))
      return;
    appState.pageIndex = pageIndex;
    savePageIndex(pageIndex);
    if (alarm) {
      appState.selectedAlarm = alarm;
    } else {
      appState.selectedAlarm = null;
    }
  }

  navigateToAsset(pageIndex: number, asset?: UserAssetLink) {
    appState.selectedAlarm = null;
    appState.selectedAsset = null;
    appState.selectedUserAssetLink = null;
    // Remember where we came from for back-navigation on hidden pages
    appState.lastPageIndex = appState.pageIndex;
    const page = pages.find((p) => p.index === pageIndex);
    if (!page) return;
    const roles = appState.user?.roles?.get("openremote");
    // If page has roles defined, check them. If empty, it's public.
    if (page.roles.length > 0 && !page.roles.some((r) => roles?.includes(r)))
      return;
    appState.pageIndex = pageIndex;
    savePageIndex(pageIndex);
    if (asset) {
      appState.selectedUserAssetLink = asset;
    } else {
      appState.selectedUserAssetLink = null;
    }
  }

  async logout() {
    try {
      openremote.logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("pageIndex");
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }

  setThemePreference(preference: ThemePreference) {
    appState.themePreference = preference;
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
    appState.theme = resolveTheme(preference);
    applyThemeClass(appState.theme);
  }

  setShowConsoleAssets(value: boolean) {
    appState.showConsoleAssets = value;
    if (typeof window !== "undefined") {
      localStorage.setItem(SHOW_CONSOLE_ASSETS_KEY, String(value));
    }
  }

  // --- Appearance management ---
  private getAppearanceStorageKey() {
    const userKey = appState.user?.id || appState.user?.username || "anon";
    return `or-appearance-${userKey}`;
  }
  private getAppearancePresetsKey() {
    const userKey = appState.user?.id || appState.user?.username || "anon";
    return `or-appearance-presets-${userKey}`;
  }

  private defaultTitle =
    typeof document !== "undefined" ? document.title : "openremote-alarm";
  private defaultFavicon =
    typeof document !== "undefined"
      ? document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ||
        "/vite.svg"
      : "/vite.svg";

  private applyFavicon(href?: string) {
    if (typeof document === "undefined") return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href && href.trim().length > 0 ? href : this.defaultFavicon;
  }

  private applyColors(
    light?: Record<string, string>,
    dark?: Record<string, string>
  ) {
    if (typeof document === "undefined") return;
    // Remove any inline overrides for keys we are about to set via stylesheet so dark/light can differ
    const root = document.documentElement;
    const allKeys = new Set<string>([
      ...Object.keys(light || {}),
      ...Object.keys(dark || {}),
    ]);
    allKeys.forEach((k) => root.style.removeProperty(`--${k}`));

    const styleId = "appearance-color-overrides";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    let css = "";
    // Important: Scope light overrides to html:not(.dark) so they never leak into dark mode.
    if (light && Object.keys(light).length > 0) {
      css +=
        "html:not(.dark){" +
        Object.entries(light)
          .map(([k, v]) => `--${k}:${v};`)
          .join("") +
        "}";
    }
    if (dark && Object.keys(dark).length > 0) {
      css +=
        ".dark{" +
        Object.entries(dark)
          .map(([k, v]) => `--${k}:${v};`)
          .join("") +
        "}";
    }
    styleEl.textContent = css;
    if (!css) {
      styleEl.remove();
    }
  }

  loadAppearance() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(this.getAppearanceStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        appState.appearance = {
          title: parsed.title,
          logoUrl: parsed.logoUrl,
          logoMobileUrl: parsed.logoMobileUrl,
          faviconUrl: parsed.faviconUrl,
          colors: parsed.colors || {},
          darkColors: parsed.darkColors || {},
        };
      }
      const presetsStr = localStorage.getItem(this.getAppearancePresetsKey());
      if (presetsStr) {
        appState.appearancePresets = JSON.parse(presetsStr);
      }
      // Apply to DOM
      if (appState.appearance.title) document.title = appState.appearance.title;
      this.applyFavicon(appState.appearance.faviconUrl);
      this.applyColors(
        appState.appearance.colors,
        appState.appearance.darkColors
      );
    } catch (e) {
      console.warn("Failed to load appearance", e);
    }
  }

  private persistAppearance() {
    if (typeof window === "undefined") return;
    const key = this.getAppearanceStorageKey();
    localStorage.setItem(key, JSON.stringify(appState.appearance));
  }

  private persistPresets() {
    if (typeof window === "undefined") return;
    const key = this.getAppearancePresetsKey();
    localStorage.setItem(key, JSON.stringify(appState.appearancePresets));
  }

  setAppearance(partial: {
    title?: string;
    logoUrl?: string;
    logoMobileUrl?: string;
    faviconUrl?: string;
    colors?: Record<string, string>;
    darkColors?: Record<string, string>;
  }) {
    // Merge and apply
    appState.appearance = {
      ...appState.appearance,
      ...partial,
      colors: {
        ...(appState.appearance.colors || {}),
        ...(partial.colors || {}),
      },
      darkColors: {
        ...(appState.appearance.darkColors || {}),
        ...(partial.darkColors || {}),
      },
    };
    if (partial.title !== undefined)
      document.title = partial.title || this.defaultTitle;
    if (partial.faviconUrl !== undefined) this.applyFavicon(partial.faviconUrl);
    if (partial.colors || partial.darkColors)
      this.applyColors(
        appState.appearance.colors,
        appState.appearance.darkColors
      );
    this.persistAppearance();
  }

  resetAppearance() {
    // Clear local overrides
    appState.appearance = {
      title: undefined,
      logoUrl: undefined,
      logoMobileUrl: undefined,
      faviconUrl: undefined,
      colors: {},
      darkColors: {},
    };
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.getAppearanceStorageKey());
    }
    // Re-apply defaults
    if (typeof document !== "undefined") {
      document.title = this.defaultTitle;
      this.applyFavicon(undefined);
      // Clear inline custom properties we know about
      const keys = [
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
        "surface-glass",
        "surface-highlight",
        "popover",
        "popover-foreground",
      ];
      const root = document.documentElement;
      keys.forEach((k) => root.style.removeProperty(`--${k}`));
      // Remove style tag
      const styleEl = document.getElementById("appearance-color-overrides");
      styleEl?.parentElement?.removeChild(styleEl);
    }
  }

  // Scoped branding update/reset
  setBranding(partial: {
    title?: string;
    logoUrl?: string;
    logoMobileUrl?: string;
    faviconUrl?: string;
  }) {
    appState.appearance = { ...appState.appearance, ...partial };
    if (partial.title !== undefined)
      document.title = partial.title || this.defaultTitle;
    if (partial.faviconUrl !== undefined) this.applyFavicon(partial.faviconUrl);
    this.persistAppearance();
  }

  resetBranding() {
    appState.appearance.title = undefined;
    appState.appearance.logoUrl = undefined;
    appState.appearance.logoMobileUrl = undefined;
    appState.appearance.faviconUrl = undefined;
    if (typeof document !== "undefined") {
      document.title = this.defaultTitle;
      this.applyFavicon(undefined);
    }
    this.persistAppearance();
  }

  // Scoped color reset
  resetColors() {
    appState.appearance.colors = {};
    appState.appearance.darkColors = {};
    if (typeof document !== "undefined") {
      const keys = [
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
        "surface-glass",
        "surface-highlight",
        "popover",
        "popover-foreground",
      ];
      const root = document.documentElement;
      keys.forEach((k) => root.style.removeProperty(`--${k}`));
      const styleEl = document.getElementById("appearance-color-overrides");
      styleEl?.parentElement?.removeChild(styleEl);
    }
    this.persistAppearance();
  }

  // Reset only the selected theme colors (light or dark)
  resetThemeColors(theme: "light" | "dark") {
    if (theme === "light") {
      appState.appearance.colors = {};
    } else {
      appState.appearance.darkColors = {};
    }
    if (typeof document !== "undefined") {
      this.applyColors(
        appState.appearance.colors,
        appState.appearance.darkColors
      );
    }
    this.persistAppearance();
  }

  saveAppearancePreset(name: string) {
    const existingIdx = appState.appearancePresets.findIndex(
      (p) => p.name === name
    );
    const snapshot = JSON.parse(JSON.stringify(appState.appearance));
    if (existingIdx >= 0) {
      appState.appearancePresets[existingIdx] = { name, appearance: snapshot };
    } else {
      appState.appearancePresets.push({ name, appearance: snapshot });
    }
    this.persistPresets();
  }

  applyAppearancePreset(name: string) {
    const found = appState.appearancePresets.find((p) => p.name === name);
    if (!found) return;
    this.setAppearance(found.appearance);
  }

  deleteAppearancePreset(name: string) {
    appState.appearancePresets = appState.appearancePresets.filter(
      (p) => p.name !== name
    );
    this.persistPresets();
  }
}

export const openRemoteService = new OpenRemoteService();

openRemoteService.init();

// Helper to check if a user asset link refers to a console asset
export function isConsoleAssetLink(link?: UserAssetLink | null): boolean {
  if (!link?.id?.assetId) return false;
  return !!appState.consoleAssetIds[link.id.assetId];
}
