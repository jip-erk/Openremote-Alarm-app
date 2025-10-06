import openremote from "@openremote/core";
import rest from "@openremote/rest";
import type {
  Auth,
  AlarmEvent,
  SentAlarm,
  Alarm,
  UserAssetLink,
} from "@openremote/model";
import { pages } from "$lib/pages";

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

export const appState = $state({
  pageIndex: getStoredPageIndex(),
  selectedAlarm: null as SentAlarm | null,
  initialized: false,
  alarms: [] as SentAlarm[],
  assets: [] as UserAssetLink[],
  assignees: [] as { value: string | null; label: string }[],
  user: null as User | null,
});

class OpenRemoteService {
  async init() {
    if (appState.initialized) return true;

    try {
      const success = await openremote.init({
        managerUrl: "https://localhost",
        keycloakUrl: "https://localhost/auth",
        auth: "KEYCLOAK" as Auth,
        consoleAutoEnable: false,
        skipFallbackToBasicAuth: true,
        autoLogin: true,
        realm: undefined,
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

        await this.fetchAlarms();

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
}

export const openRemoteService = new OpenRemoteService();

openRemoteService.init();
