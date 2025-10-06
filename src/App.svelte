<script lang="ts">
  import Header from "./lib/Header.svelte";
  import AlarmCard from "./lib/Alarm.svelte";
  import AddAlarmForm from "./lib/AddAlarmForm.svelte";
  import ViewAlarmForm from "./lib/ViewAlarmForm.svelte";
  import openremote from "@openremote/core";
  import type { Auth, AlarmEvent, SentAlarm, Alarm} from "@openremote/model";
  import rest from "@openremote/rest";

  let initialized = $state(false);
  let alarms = $state<SentAlarm[]>([]);
  // let alarm = $state<SentAlarm>();
  let alarmView = $state<SentAlarm>();
  let addPage = $state(false);
  let viewPage = $state(false);

  openremote
    .init({
      managerUrl: "https://localhost",
      keycloakUrl: "https://localhost/auth",
      auth: "KEYCLOAK" as Auth,
      redirect_uri: "https://localhost:5173/",
      autoLogin: false,
      realm: undefined,
      configureTranslationsOptions: (options: any) => {
        options.lng = "nl";
      },
    })
    .then(async (success: any) => {
      if (success) {
        initialized = true;
        fetchAlarms();
      }
      openremote.events.connect().then(() => {
        console.log("Connected to event stream");
        openremote.events.subscribe<AlarmEvent>({ eventType: "alarm" }, () => {
          fetchAlarms();
        });
      });
    });

  const fetchAlarms = async () => {
    const response = await rest.api.AlarmResource.getAlarms({
      realm: "master",
    });
    console.log(response);
    alarms = response.data;
  };

  const addAlarm = async (alarm: Alarm) => {
    const response = await rest.api.AlarmResource.createAlarm(alarm);
    console.log("Alarm created:", response.data);
    addPage = false;
  };

  // const fetchAlarmById = async (alarmId: number) => {
  //   const response = await rest.api.AlarmResource.getAlarm(alarmId);
  //   alarm = response.data;
  //   console.log("Alarm", alarm);
  // }

    const fetchAlarmById = async (alarm: SentAlarm) => {

  }
</script>

<main>
  <Header />
  <div class="px-4">
    <button
      class="p-2 bg-primary/20 ring-1 w-full rounded-md ring-primary"
      onclick={() => (addPage = !addPage)}
      >{addPage ? "Cancel adding" : "Add"} alarm</button
    >
  </div>
  {#if viewPage}
    <div class="px-4">
    <button
      class="p-2 bg-primary/20 ring-1 w-full rounded-md ring-primary"
      onclick={() => (viewPage = !viewPage)}>cancel view alarm</button
    >
    </div>
  {/if}
    <!-- <div class="px-4">
    <button
      class="p-2 bg-primary/20 ring-1 w-full rounded-md ring-primary"
      onclick={() => (viewPage = !viewPage)}
      >{viewPage ? "Cancel view" : "View"} alarm</button
    >
  </div> -->
  {#if addPage}
    <AddAlarmForm {addAlarm} />
  {:else if viewPage}
    <ViewAlarmForm {alarmView} />
  {:else}
    <div class="p-4 flex flex-col gap-4">
      {#if initialized}
        {#each alarms as alarm}
          <!-- <button onclick="{() => (viewPage = !viewPage, fetchAlarmById(alarm.id))}">
            <AlarmCard {alarm} />
          </button> -->
          <button onclick="{() => (viewPage = !viewPage, alarmView = alarm)}">
            <AlarmCard {alarm} />
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</main>
