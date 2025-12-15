import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AlarmList from "./AlarmList.svelte";
import * as store from "$lib/store.svelte";
import { createMockAlarm } from "../../test/fixtures";
import { AlarmStatus } from "@openremote/model";

// Mock the store module
vi.mock("$lib/store.svelte", () => {
  return {
    appState: {
      alarms: [],
      user: { id: "user-1", username: "me" },
      assignees: [
        { value: "user-1", label: "Me" },
        { value: "user-2", label: "Other" },
      ],
      pageIndex: 0,
    },
    openRemoteService: {
      // Add methods if needed
    },
  };
});

describe("AlarmList", () => {
  beforeEach(() => {
    store.appState.alarms = [];
  });

  it("renders alarms", () => {
    store.appState.alarms = [
      createMockAlarm({ id: 1, title: "Alarm 1", assigneeId: "user-2" }),
      createMockAlarm({ id: 2, title: "Alarm 2", assigneeId: "user-2" }),
    ];

    const { getByText } = render(AlarmList);

    expect(getByText("Alarm 1")).toBeInTheDocument();
    expect(getByText("Alarm 2")).toBeInTheDocument();
  });

  it("filters by status", async () => {
    store.appState.alarms = [
      createMockAlarm({
        id: 1,
        title: "Open Alarm",
        status: AlarmStatus.OPEN,
        assigneeId: "user-2",
      }),
      createMockAlarm({
        id: 2,
        title: "Resolved Alarm",
        status: AlarmStatus.RESOLVED,
        assigneeId: "user-2",
      }),
    ];

    const { getByText, queryByText, getAllByText, getByRole } =
      render(AlarmList);

    expect(getByText("Open Alarm")).toBeInTheDocument();

    // By default, it might show all or open.
    // If the filter defaults to "all", both should be visible.
    // If it defaults to "open", only "Open Alarm" should be visible.
    // Let's assume default is "all" or check the component logic.
    // In AlarmList.svelte (from memory/context), default filter is usually "all" or "open".
    // Let's assume "all" for now, or check if we need to click a filter.

    // Actually, let's just check if we can filter.
    // Find filter buttons.
    const resolvedFilter = getByRole("button", { name: "Resolved" });
    await fireEvent.click(resolvedFilter);

    expect(getByText("Resolved Alarm")).toBeInTheDocument();
    expect(queryByText("Open Alarm")).not.toBeInTheDocument();
  });
});
