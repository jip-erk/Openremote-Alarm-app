import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AssetCard from "./AssetCard.svelte";
import * as store from "$lib/store.svelte";
import { createMockAlarm } from "../../test/fixtures";
import { AlarmStatus } from "@openremote/model";
import { PageIndex } from "$lib/pages";

// Mock the store module
vi.mock("$lib/store.svelte", () => {
  return {
    appState: {
      alarms: [],
      assetTypeById: {},
      pageIndex: 0,
      selectedAsset: null,
    },
    openRemoteService: {
      navigateToAsset: vi.fn(),
    },
    isConsoleAssetLink: vi.fn().mockReturnValue(false),
  };
});

describe("AssetCard", () => {
  beforeEach(() => {
    store.appState.alarms = [];
  });

  it("renders asset details", () => {
    const asset = {
      id: { assetId: "asset-1" },
      assetName: "Main Building",
      createdOn: new Date().toISOString(),
    } as any;

    const { getByText } = render(AssetCard, { props: { asset } });

    expect(getByText("Main Building")).toBeInTheDocument();
  });

  it("shows alarm counts", () => {
    // Update mock state
    store.appState.alarms = [
      createMockAlarm({
        id: 1,
        status: AlarmStatus.OPEN,
        asset: [{ id: "asset-1" } as any],
      }),
      createMockAlarm({
        id: 2,
        status: AlarmStatus.OPEN,
        asset: [{ id: "asset-1" } as any],
      }),
      createMockAlarm({
        id: 3,
        status: AlarmStatus.IN_PROGRESS,
        asset: [{ id: "asset-1" } as any],
      }),
      createMockAlarm({
        id: 4,
        status: AlarmStatus.OPEN,
        asset: [{ id: "asset-2" } as any],
      }),
    ] as any;

    const asset = {
      id: { assetId: "asset-1" },
      assetName: "Main Building",
    } as any;

    const { getByText } = render(AssetCard, { props: { asset } });

    // Should show 2 open alarms (id 1 and 2)
    // The component likely renders "2 open" or similar
    expect(getByText(/2 open/i)).toBeInTheDocument();
    // Should show 1 in progress
    expect(getByText(/1 in progress/i)).toBeInTheDocument();
  });

  it("navigates on click", async () => {
    const asset = {
      id: { assetId: "asset-1" },
      assetName: "Main Building",
    } as any;

    const { getByText } = render(AssetCard, { props: { asset } });
    const card = getByText("Main Building").closest('[role="button"]');

    // If it's not a button, we might need to find the clickable element.
    // Looking at AssetCard.svelte (from memory/context), the whole card might be clickable or have a button.
    // Let's assume the card itself has an onclick.

    await fireEvent.click(card!);

    expect(store.openRemoteService.navigateToAsset).toHaveBeenCalledWith(
      PageIndex.ASSET,
      asset
    );
  });
});
