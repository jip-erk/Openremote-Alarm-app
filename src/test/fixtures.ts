import { type SentAlarm, AlarmStatus, AlarmSeverity } from "@openremote/model";

export const createMockAlarm = (
  overrides: Partial<SentAlarm> = {}
): SentAlarm =>
  ({
    id: 1,
    title: "Test Alarm",
    content: "Something happened",
    createdOn: new Date().toISOString(),
    severity: AlarmSeverity.HIGH,
    status: AlarmStatus.OPEN,
    ...overrides,
  }) as unknown as SentAlarm;
