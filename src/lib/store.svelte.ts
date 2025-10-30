import openremote from "@openremote/core";
import rest from "@openremote/rest";
import type {
  AlarmEvent,
  SentAlarm,
  Alarm,
  UserAssetLink,
} from "@openremote/model";
import { pages } from "$lib/pages";
import { Auth } from "@openremote/model";
type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "system";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";

const THEME_STORAGE_KEY = "or-theme";
const DEFAULT_MANAGER_URL = "https://localhost";

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
  initialized: false,
  alarms: [] as SentAlarm[],
  assets: [] as UserAssetLink[],
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
        auth: Auth.KEYCLOAK,
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

        await Promise.all([this.fetchAlarms(), this.fetchAssets()]);

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

  async login() {
    try {
      const keycloak = (openremote as any)._keycloak;

      const redirectUri = "openremote://auth-callback";

      let loginUrl = keycloak.createLoginUrl({
        redirectUri,
        prompt: "login",
      });

      const urlObj = new URL(loginUrl);
      urlObj.searchParams.set("redirect_uri", redirectUri);
      loginUrl = urlObj.toString();

      console.log("Opening login URL:", loginUrl);

      await Browser.open({ url: loginUrl, windowName: "_self" });

      App.addListener("appUrlOpen", async (data) => {
        if (data.url.startsWith("openremote://auth-callback")) {
          await Browser.close();
          appState.initialized = true;
          console.log("Data:", data);
          // Extract code/token from data.url and finish login
          // You may need to exchange the code for tokens here
        }
      });
    } catch (error) {
      console.error("Failed to login:", error);
      throw error;
    }
  }

  // async fetchAccessToken(
  //   url: string,
  //   code: string,
  //   clientId: string,
  //   redirectUri: string
  // ): Promise<any> {
  //   const body = new URLSearchParams([
  //     ["code", code],
  //     ["grant_type", "authorization_code"],
  //     ["client_id", clientId],
  //     ["redirect_uri", stripHash(redirectUri)],
  //   ]);

  //   return await fetch(url, {
  //     method: "POST",
  //     credentials: "include",
  //     body,
  //   });
  // }

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
      appState.assets = response.data;
    } catch (error) {
      console.error("Failed to fetch assets:", error);
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
}

export const openRemoteService = new OpenRemoteService();

openRemoteService.init();
