import { render, fireEvent, waitFor } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Header from "./Header.svelte";
import * as store from "$lib/store.svelte";
import { AlarmStatus } from "@openremote/model";
import { PageIndex } from "$lib/pages";

// Mock the store module
vi.mock("$lib/store.svelte", () => {
  return {
    appState: {
      user: { id: "user1", username: "Test User", roles: new Map() },
      alarms: [],
      assets: [],
      appearance: {
        title: "My App",
        logoUrl: "",
        logoMobileUrl: "",
        colors: {},
        darkColors: {},
      },
      pageIndex: 0, // ALARMS
    },
    openRemoteService: {
      logout: vi.fn(),
      navigateTo: vi.fn(),
    },
  };
});

describe("Header", () => {
  beforeEach(() => {
    store.appState.user = {
      id: "user1",
      username: "Test User",
      roles: new Map(),
    };
    store.appState.alarms = [];
    store.appState.assets = [];
    store.appState.pageIndex = 0; // ALARMS
    vi.clearAllMocks();
  });

  it("renders user name", () => {
    const { getByText } = render(Header);

    // It renders "Greeting, FirstName"
    // We can just check for the first name "Test"
    expect(getByText(/Test/)).toBeInTheDocument();
  });

  it("renders stats", () => {
    store.appState.alarms = [
      { id: "1", status: AlarmStatus.OPEN, assigneeId: "user1" },
      { id: "2", status: AlarmStatus.OPEN, assigneeId: "other" },
    ] as any;
    store.appState.assets = [{}, {}] as any;

    const { getByText, getAllByText } = render(Header);

    // Assigned to you: 1
    expect(getByText("Assigned to you")).toBeInTheDocument();
    expect(getByText("1")).toBeInTheDocument();

    // Open alarms: 2
    expect(getByText("Open alarms")).toBeInTheDocument();
    // There might be multiple '2's
    expect(getAllByText("2").length).toBeGreaterThan(0);

    // Connected assets: 2
    expect(getByText("Connected assets")).toBeInTheDocument();
  });

  it("navigates to appearance", async () => {
    const { getByText } = render(Header);

    // Open dropdown
    const userButton = getByText("TU"); // Initials
    await fireEvent.click(userButton);

    // Click Appearance
    // Wait for dropdown to appear
    await waitFor(() => {
      expect(getByText("Appearance")).toBeInTheDocument();
    });
    const appearanceItem = getByText("Appearance");
    await fireEvent.click(appearanceItem);

    expect(store.openRemoteService.navigateTo).toHaveBeenCalledWith(
      PageIndex.APPEARANCE
    );
  });

  it("logs out", async () => {
    const { getByText } = render(Header);

    // Open dropdown
    const userButton = getByText("TU");
    await fireEvent.click(userButton);

    // Click Logout
    await waitFor(() => {
      expect(getByText("Log out")).toBeInTheDocument();
    });
    const logoutItem = getByText("Log out");
    await fireEvent.click(logoutItem);

    expect(store.openRemoteService.logout).toHaveBeenCalled();
  });
});
