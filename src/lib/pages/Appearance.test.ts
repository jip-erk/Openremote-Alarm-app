import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Appearance from "./Appearance.svelte";
import * as store from "$lib/store.svelte";
import { PageIndex } from "$lib/pages";

// Mock the store module
vi.mock("$lib/store.svelte", () => {
  return {
    appState: {
      appearance: {
        title: "My App",
        logoUrl: "",
        logoMobileUrl: "",
        faviconUrl: "",
        colors: {},
        darkColors: {},
      },
      appearancePresets: [],
      lastPageIndex: 0,
    },
    openRemoteService: {
      setAppearance: vi.fn(),
      setBranding: vi.fn(),
      resetBranding: vi.fn(),
      resetThemeColors: vi.fn(),
      saveAppearancePreset: vi.fn(),
      applyAppearancePreset: vi.fn(),
      deleteAppearancePreset: vi.fn(),
      navigateTo: vi.fn(),
    },
  };
});

describe("Appearance", () => {
  beforeEach(() => {
    store.appState.appearance = {
      title: "My App",
      logoUrl: "",
      logoMobileUrl: "",
      faviconUrl: "",
      colors: {},
      darkColors: {},
    };
    store.appState.appearancePresets = [];
    vi.clearAllMocks();
  });

  it("renders branding settings", () => {
    const { getByPlaceholderText, getByDisplayValue } = render(Appearance);

    expect(getByPlaceholderText("Enter site title")).toBeInTheDocument();
    expect(getByDisplayValue("My App")).toBeInTheDocument();
  });

  it("saves branding settings", async () => {
    const { getByPlaceholderText, getAllByText } = render(Appearance);

    const titleInput = getByPlaceholderText("Enter site title");
    await fireEvent.input(titleInput, { target: { value: "New Title" } });

    const saveButtons = getAllByText("Save");
    await fireEvent.click(saveButtons[0]);

    expect(store.openRemoteService.setBranding).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Title",
      })
    );
  });

  it("saves color settings", async () => {
    const { getAllByText } = render(Appearance);

    const saveButtons = getAllByText("Save");
    await fireEvent.click(saveButtons[1]);

    expect(store.openRemoteService.setAppearance).toHaveBeenCalled();
  });
});
