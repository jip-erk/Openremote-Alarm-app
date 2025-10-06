<script lang="ts">
  import type { SentAlarm } from "@openremote/model";
    import dayjs from "dayjs";

  const { alarmView }: { alarmView: SentAlarm } = $props();

 const getAlarmClasses = (status: string) => {
    switch (status) {
      case "OPEN":
        return "ring-red-600/50 bg-red-600/20 text-red-600";
      case "ACKNOWLEDGED":
        return "ring-yellow-600/50 bg-yellow-600/20 text-yellow-600";
      case "IN_PROGRESS":
        return "ring-blue-600/50 bg-blue-600/20 text-blue-600";
      case "RESOLVED":
        return "ring-green-600/50 bg-green-600/20 text-green-600";
      case "CLOSED":
        return "ring-gray-600/50 bg-gray-600/20 text-gray-600";
      default:
        return "ring-gray-600/50 bg-gray-600/20 text-gray-600";
    }
  };

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "ring-green-600/50 bg-green-600/20 text-green-600";
      case "MEDIUM":
        return "ring-orange-600/50 bg-orange-600/20 text-orange-600";
      case "HIGH":
        return "ring-red-600/50 bg-red-600/20 text-red-600";
      default:
        return "ring-gray-600/50 bg-gray-600/20 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Open";
      case "ACKNOWLEDGED":
        return "Acknowledged";
      case "IN_PROGRESS":
        return "In Progress";
      case "RESOLVED":
        return "Resolved";
      case "CLOSED":
        return "Closed";
      default:
        return status;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "Low";
      case "MEDIUM":
        return "Medium";
      case "HIGH":
        return "High";
      default:
        return severity;
    }
  };
</script>

<div class="w-full ring-1 ring-primary bg-primary/20 rounded-lg flex flex-col gap-2 p-2 mt-5">
  <table class="table-auto">
    <thead>
      <tr>
        <th>Id</th>
        <th>Title</th>
        <th>Severity</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody class="text-center">
      <tr>
        <td>{alarmView.id}</td>
        <td>{alarmView.title}</td>
        <td>
          <span
          class="ring-1 px-2 py-1 text-xs rounded-md {getSeverityClasses(
          alarmView.severity as string
          )}">{getSeverityText(alarmView.severity as string)}</span
        >
        </td>
        <td>
          <span
          class="ring-1 px-2 py-1 text-xs rounded-md {getAlarmClasses(
          alarmView.status as string
          )}">{getStatusText(alarmView.status as string)}</span
        >
        </td>
      </tr>
    </tbody>
  </table>
</div>