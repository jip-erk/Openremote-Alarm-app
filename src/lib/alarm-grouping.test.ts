import { describe, it, expect } from "vitest";
import { groupAlarms } from "./alarm-grouping";
import { createMockAlarm } from "../test/fixtures";

describe("groupAlarms", () => {
  it("should group alarms with same title and content", () => {
    const alarms = [
      createMockAlarm({
        title: "Fire",
        content: "Kitchen",
        createdOn: "2023-01-01T10:00:00Z",
      }),
      createMockAlarm({
        title: "Fire",
        content: "Kitchen",
        createdOn: "2023-01-01T11:00:00Z",
      }),
      createMockAlarm({
        title: "Flood",
        content: "Basement",
        createdOn: "2023-01-01T12:00:00Z",
      }),
    ];

    const groups = groupAlarms(alarms);

    expect(groups).toHaveLength(2);
    // Sorted by latest timestamp desc. Flood is 12:00, Fire is 11:00 (latest)
    expect(groups[0].title).toBe("Flood");
    expect(groups[0].count).toBe(1);
    expect(groups[1].title).toBe("Fire");
    expect(groups[1].count).toBe(2);
  });

  it("should handle empty list", () => {
    expect(groupAlarms([])).toEqual([]);
  });

  it("should normalize whitespace and case", () => {
    const alarms = [
      createMockAlarm({ title: "Fire ", content: "Kitchen" }),
      createMockAlarm({ title: "fire", content: "kitchen" }),
    ];
    const groups = groupAlarms(alarms);
    expect(groups).toHaveLength(1);
    expect(groups[0].count).toBe(2);
  });
});
