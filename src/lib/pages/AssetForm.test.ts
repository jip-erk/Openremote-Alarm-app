import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AssetForm from "./AssetForm.svelte";
import * as store from "$lib/store.svelte";
import { AlarmStatus } from "@openremote/model";
import { PageIndex } from "$lib/pages";

// Mock the store module
vi.mock("$lib/store.svelte", () => {
  return {
    appState: {
      selectedUserAssetLink: null,
      selectedAsset: null,
      alarms: [],
      consoleAssetIds: {},
      assignees: [],
    },
    openRemoteService: {
      getAsset: vi.fn(),
      navigateTo: vi.fn(),
    },
    resolveManagerBaseUrl: vi.fn().mockReturnValue("http://localhost:8080"),
  };
});

describe("AssetForm", () => {
  beforeEach(() => {
    store.appState.selectedUserAssetLink = null;
    store.appState.selectedAsset = null;
    store.appState.alarms = [];
    store.appState.assignees = [];
    vi.clearAllMocks();
  });

  it("renders asset details", () => {
    store.appState.selectedUserAssetLink = { id: { assetId: "123" } } as any;
    store.appState.selectedAsset = {
      id: "123",
      name: "Test Asset",
      type: { name: "Building" },
      attributes: {
        temperature: { value: 25 },
        status: { value: "OK" },
      },
    } as any;

    const { getByText, getAllByText, getByDisplayValue } = render(AssetForm);

    expect(getAllByText("Test Asset")[0]).toBeInTheDocument();
    expect(getByDisplayValue("Building")).toBeInTheDocument();
    expect(getByText("temperature")).toBeInTheDocument();
    expect(getByDisplayValue("25")).toBeInTheDocument();
    expect(getByText("status")).toBeInTheDocument();
    expect(getByDisplayValue("OK")).toBeInTheDocument();
  });

  it("renders related alarms", () => {
    store.appState.selectedUserAssetLink = { id: { assetId: "123" } } as any;
    store.appState.selectedAsset = { id: "123", name: "Test Asset" } as any;
    store.appState.alarms = [
      {
        id: "alarm1",
        title: "High Temp",
        status: AlarmStatus.OPEN,
        asset: [{ id: "123" }],
        createdOn: new Date().toISOString(),
        assigneeId: null,
      },
    ] as any;

    const { getByText } = render(AssetForm);

    expect(getByText("High Temp")).toBeInTheDocument();
  });

  it("navigates back", async () => {
    store.appState.selectedUserAssetLink = { id: { assetId: "123" } } as any;

    const { container } = render(AssetForm);

    const backButton = container.querySelector("button");
    await fireEvent.click(backButton!);

    expect(store.openRemoteService.navigateTo).toHaveBeenCalledWith(
      PageIndex.ASSETS
    );
  });
});
