import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isConsoleAssetLink,
  appState,
  openRemoteService,
} from "./store.svelte";
import rest from "@openremote/rest";

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage (already in setup.ts but good to be safe or rely on setup)
// Since setup.ts is configured, we don't strictly need it here if setup runs.
// But let's keep it if it was working.

// Mock @openremote/rest
vi.mock("@openremote/rest", () => {
  return {
    default: {
      api: {
        AlarmResource: {
          getAlarms: vi.fn().mockResolvedValue({ data: [] }),
          updateAlarm: vi.fn().mockResolvedValue({ data: {} }),
        },
        AssetResource: {
          getUserAssetLinks: vi.fn().mockResolvedValue({ data: [] }),
          get: vi.fn().mockResolvedValue({ data: {} }),
        },
        UserResource: {
          query: vi.fn().mockResolvedValue({ data: [] }),
        },
      },
    },
  };
});

// Mock @openremote/core
vi.mock("@openremote/core", () => {
  return {
    default: {
      init: vi.fn().mockResolvedValue(true),
      username: "testuser",
      roles: new Map(),
      events: {
        subscribe: vi.fn(),
      },
      _keycloak: {
        profile: { id: "user-1" },
      },
    },
  };
});

describe("store", () => {
  describe("isConsoleAssetLink", () => {
    beforeEach(() => {
      // Reset state
      appState.consoleAssetIds = {};
    });

    it("should return true if asset is in consoleAssetIds", () => {
      appState.consoleAssetIds = { "asset-1": true };
      const link = { id: { assetId: "asset-1" } } as any;
      expect(isConsoleAssetLink(link)).toBe(true);
    });

    it("should return false if asset is not in consoleAssetIds", () => {
      appState.consoleAssetIds = { "asset-1": true };
      const link = { id: { assetId: "asset-2" } } as any;
      expect(isConsoleAssetLink(link)).toBe(false);
    });

    it("should return false if link is null", () => {
      expect(isConsoleAssetLink(null)).toBe(false);
    });
  });

  describe("OpenRemoteService", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      appState.alarms = [];
      appState.assets = [];
    });

    it("fetchAlarms should update appState.alarms", async () => {
      const mockAlarms = [{ id: "1", title: "Alarm 1" }];
      (rest.api.AlarmResource.getAlarms as any).mockResolvedValue({
        data: mockAlarms,
      });

      await openRemoteService.fetchAlarms();

      expect(rest.api.AlarmResource.getAlarms).toHaveBeenCalled();
      expect(appState.alarms).toEqual(mockAlarms);
    });

    it("fetchAssets should update appState.assets and enrich types", async () => {
      const mockLinks = [{ id: { assetId: "asset-1" } }];
      const mockAsset = { id: "asset-1", type: "ConsoleAsset" };

      (rest.api.AssetResource.getUserAssetLinks as any).mockResolvedValue({
        data: mockLinks,
      });
      (rest.api.AssetResource.get as any).mockResolvedValue({
        data: mockAsset,
      });

      await openRemoteService.fetchAssets();

      expect(rest.api.AssetResource.getUserAssetLinks).toHaveBeenCalled();
      expect(rest.api.AssetResource.get).toHaveBeenCalledWith("asset-1");
      expect(appState.assets).toEqual(mockLinks);
      expect(appState.consoleAssetIds["asset-1"]).toBe(true);
    });

    it("updateAlarm should call API with assetIds", async () => {
      const alarmId = 123;
      const alarmData = { title: "Updated Alarm" } as any;
      const assetIds = ["asset-1", "asset-2"];

      await openRemoteService.updateAlarm(alarmId, alarmData, assetIds);

      expect(rest.api.AlarmResource.updateAlarm).toHaveBeenCalledWith(
        alarmId,
        alarmData,
        { assetIds }
      );
    });
  });
});
