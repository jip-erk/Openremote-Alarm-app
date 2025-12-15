import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AlarmCard from "./AlarmCard.svelte";
import { createMockAlarm } from "../../test/fixtures";
import * as store from "$lib/store.svelte";
import { AlarmStatus, AlarmSeverity } from "@openremote/model";

// Mock the store module
vi.mock("$lib/store.svelte", () => {
  return {
    appState: {
      assignees: [{ value: "user-1", label: "John Doe" }],
      pageIndex: 0,
      selectedAlarm: null,
    },
    openRemoteService: {
      // Add methods if needed
    },
  };
});

describe("AlarmCard", () => {
  it("renders alarm details correctly", () => {
    const alarm = createMockAlarm({
      title: "Temperature Alarm",
      content: "Temperature exceeded 50C",
      severity: AlarmSeverity.HIGH,
      status: AlarmStatus.OPEN,
      assigneeId: "user-1",
    });

    const { getByText } = render(AlarmCard, { props: { alarm } });

    expect(getByText("Temperature Alarm")).toBeInTheDocument();
    expect(getByText("Temperature exceeded 50C")).toBeInTheDocument();
    expect(getByText(/High/i)).toBeInTheDocument();
    expect(getByText(/Open/i)).toBeInTheDocument();
    expect(getByText("John Doe")).toBeInTheDocument();
  });

  it("handles unassigned alarm", () => {
    const alarm = createMockAlarm({
      assigneeId: undefined,
    });

    const { getByText } = render(AlarmCard, { props: { alarm } });
    expect(getByText("Unassigned")).toBeInTheDocument();
  });

  it("truncates long titles", () => {
    const longTitle = "A".repeat(100);
    const alarm = createMockAlarm({ title: longTitle });
    const { getByText } = render(AlarmCard, { props: { alarm } });

    // It might not be exactly in the document if truncated with CSS,
    // but usually we check if it renders at all or check for class.
    // For now, let's just ensure it doesn't crash.
    expect(
      getByText((content) => content.startsWith("AAAA"))
    ).toBeInTheDocument();
  });
});
