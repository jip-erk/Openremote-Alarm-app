import { describe, it, expect } from "vitest";
import { cn, statusBadgeClass, severityBadgeClass } from "./utils";
import { AlarmStatus, AlarmSeverity } from "@openremote/model";

describe("utils", () => {
  describe("cn", () => {
    it("should merge classes", () => {
      expect(cn("a", "b")).toBe("a b");
      expect(cn("a", { b: true, c: false })).toBe("a b");
    });

    it("should merge tailwind classes", () => {
      expect(cn("p-4", "p-2")).toBe("p-2");
    });
  });

  describe("statusBadgeClass", () => {
    it("should return correct class for status", () => {
      expect(statusBadgeClass(AlarmStatus.OPEN)).toContain("status-open");
      expect(statusBadgeClass(AlarmStatus.CLOSED)).toContain("status-closed");
    });

    it("should default to OPEN for null/undefined", () => {
      expect(statusBadgeClass(null)).toContain("status-open");
      expect(statusBadgeClass(undefined)).toContain("status-open");
    });
  });

  describe("severityBadgeClass", () => {
    it("should return correct class for severity", () => {
      expect(severityBadgeClass(AlarmSeverity.LOW)).toContain("severity-low");
      expect(severityBadgeClass(AlarmSeverity.HIGH)).toContain("severity-high");
    });

    it("should default to MEDIUM for null/undefined", () => {
      expect(severityBadgeClass(null)).toContain("severity-medium");
      expect(severityBadgeClass(undefined)).toContain("severity-medium");
    });
  });
});
