import type { AlarmSeverity, AlarmStatus } from "@openremote/model";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, "children">
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};

const statusBadgeMap: Record<AlarmStatus, string> = {
  OPEN: "border-[var(--status-open-ring)] bg-[var(--status-open-bg)] text-[var(--status-open-fg)]",
  ACKNOWLEDGED:
    "border-[var(--status-ack-ring)] bg-[var(--status-ack-bg)] text-[var(--status-ack-fg)]",
  IN_PROGRESS:
    "border-[var(--status-progress-ring)] bg-[var(--status-progress-bg)] text-[var(--status-progress-fg)]",
  RESOLVED:
    "border-[var(--status-resolved-ring)] bg-[var(--status-resolved-bg)] text-[var(--status-resolved-fg)]",
  CLOSED:
    "border-[var(--status-closed-ring)] bg-[var(--status-closed-bg)] text-[var(--status-closed-fg)]",
};

const severityBadgeMap: Record<AlarmSeverity, string> = {
  LOW: "border-[var(--severity-low-fg)] bg-[var(--severity-low-bg)] text-[var(--severity-low-fg)]",
  MEDIUM:
    "border-[var(--severity-medium-fg)] bg-[var(--severity-medium-bg)] text-[var(--severity-medium-fg)]",
  HIGH: "border-[var(--severity-high-fg)] bg-[var(--severity-high-bg)] text-[var(--severity-high-fg)]",
};

export function statusBadgeClass(status: AlarmStatus | null | undefined) {
  return status
    ? (statusBadgeMap[status] ?? statusBadgeMap.OPEN)
    : statusBadgeMap.OPEN;
}

export function severityBadgeClass(severity: AlarmSeverity | null | undefined) {
  return severity
    ? (severityBadgeMap[severity] ?? severityBadgeMap.MEDIUM)
    : severityBadgeMap.MEDIUM;
}

export function formatStatusLabel(status: AlarmStatus | null | undefined) {
  if (!status) return "Unknown";
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.at(0)?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatSeverityLabel(
  severity: AlarmSeverity | null | undefined
) {
  if (!severity) return "Unknown";
  const lower = severity.toLowerCase();
  return lower.at(0)?.toUpperCase() + lower.slice(1);
}
