import type { SentAlarm } from "@openremote/model";

export interface AlarmGroup {
  key: string;
  title: string;
  description: string;
  latestTimestamp: number;
  count: number;
  items: SentAlarm[];
}

function normalize(str: string | undefined | null): string {
  return (str || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function groupAlarms(alarms: SentAlarm[]): AlarmGroup[] {
  const groups = new Map<string, AlarmGroup>();

  for (const alarm of alarms) {
    const title = alarm.title || "Untitled alarm";
    const description = alarm.content || "";

    const key = `${normalize(title)}::${normalize(description)}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title,
        description,
        latestTimestamp: 0,
        count: 0,
        items: [],
      });
    }

    const group = groups.get(key)!;
    group.items.push(alarm);
    group.count++;

    const alarmTime = new Date(alarm.createdOn || 0).getTime();
    if (alarmTime > group.latestTimestamp) {
      group.latestTimestamp = alarmTime;
    }
  }

  // Sort groups by latest timestamp desc
  const sortedGroups = Array.from(groups.values()).sort(
    (a, b) => b.latestTimestamp - a.latestTimestamp
  );

  // Sort items within groups by timestamp desc
  for (const group of sortedGroups) {
    group.items.sort(
      (a, b) =>
        new Date(b.createdOn || 0).getTime() -
        new Date(a.createdOn || 0).getTime()
    );
  }

  return sortedGroups;
}
