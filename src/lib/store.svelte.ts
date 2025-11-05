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

function resolveManagerBaseUrl() {
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
  selectedAlarm: null as SentAlarm | null,
  selectedUserAssetLink: null as UserAssetLink | null,
  selectedAsset: null as Asset | null,
  initialized: false,
  alarms: [] as SentAlarm[],
  assets: [] as UserAssetLink[],
  // Map of assetId -> true when the asset is of type ConsoleAsset
  consoleAssetIds: {} as Record<string, boolean>,
  // UI preference: hide console assets by default
  showConsoleAssets: getStoredShowConsoleAssets(),
  assignees: [] as { value: string | null; label: string }[],
  user: null as User | null,
  themePreference: getStoredThemePreference(),
  theme: resolveTheme(getStoredThemePreference()),
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
          }
        }
        appState.consoleAssetIds = map;
      } else {
        appState.consoleAssetIds = {};
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
    const page = pages.find((p) => p.index === pageIndex);
    if (!page) return;
    const roles = appState.user?.roles?.get("openremote");
    if (!page.roles.some((r) => roles?.includes(r))) return;
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
    const page = pages.find((p) => p.index === pageIndex);
    if (!page) return;
    const roles = appState.user?.roles?.get("openremote");
    if (!page.roles.some((r) => roles?.includes(r))) return;
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
}

export const openRemoteService = new OpenRemoteService();

openRemoteService.init();

// Helper to check if a user asset link refers to a console asset
export function isConsoleAssetLink(link?: UserAssetLink | null): boolean {
  if (!link?.id?.assetId) return false;
  return !!appState.consoleAssetIds[link.id.assetId];
}
