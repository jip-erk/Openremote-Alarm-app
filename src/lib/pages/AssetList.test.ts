import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AssetList from "./AssetList.svelte";
import * as store from "$lib/store.svelte";

// Mock the store module
vi.mock("$lib/store.svelte", () => {
  return {
    appState: {
      assets: [],
      assetTypeById: {},
      showConsoleAssets: false,
      alarms: [], // needed for AssetCard
    },
    openRemoteService: {
      fetchAssets: vi.fn(),
      navigateTo: vi.fn(),
    },
    isConsoleAssetLink: vi.fn().mockReturnValue(false),
  };
});

describe("AssetList", () => {
  beforeEach(() => {
    store.appState.assets = [];
    store.appState.alarms = [];
  });

  it("renders assets", () => {
    store.appState.assets = [
      {
        id: { assetId: "1" },
        assetName: "Building A",
        createdOn: new Date().toISOString(),
      },
      {
        id: { assetId: "2" },
        assetName: "Building B",
        createdOn: new Date().toISOString(),
      },
    ] as any;

    const { getByText } = render(AssetList);

    expect(getByText("Building A")).toBeInTheDocument();
    expect(getByText("Building B")).toBeInTheDocument();
  });

  it("filters assets by search", async () => {
    store.appState.assets = [
      {
        id: { assetId: "1" },
        assetName: "Building A",
        createdOn: new Date().toISOString(),
      },
      {
        id: { assetId: "2" },
        assetName: "Warehouse",
        createdOn: new Date().toISOString(),
      },
    ] as any;

    const { getByPlaceholderText, getByText, queryByText, getByLabelText } =
      render(AssetList);

    const searchButton = getByLabelText("Search assets");
    await fireEvent.click(searchButton);

    const searchInput = getByPlaceholderText(/search/i);
    await fireEvent.input(searchInput, { target: { value: "Ware" } });

    expect(getByText("Warehouse")).toBeInTheDocument();
    expect(queryByText("Building A")).not.toBeInTheDocument();
  });
});
