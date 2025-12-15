<!-- 
// ==============================
// MOCK ONLY - VOICE RECORD CARD
// ==============================
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    Card,
    CardContent,
    CardHeader,
  } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { mockStorage } from "$lib/services/mock-storage.service";
  import { appState } from "$lib/store.svelte";
  import Mic from "@lucide/svelte/icons/mic";
  import Square from "@lucide/svelte/icons/square";
  import Play from "@lucide/svelte/icons/play";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import User from "@lucide/svelte/icons/user";

  export let alarmId: string | undefined = undefined;

  interface Recording {
    id: string;
    timestamp: number;
    dataUrl: string;
  }

  let recordings: Recording[] = [];
  let isRecording = false;
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let recordingTime = 0;
  let timerInterval: any;

  $: storageKey = alarmId
    ? `mock:alarm:${alarmId}:recordings`
    : "mock:alarm:draft:recordings";

  function loadRecordings() {
    recordings = mockStorage.get<Recording[]>(storageKey) || [];
  }

  function saveRecordings() {
    mockStorage.set(storageKey, recordings);
  }

  onMount(() => {
    loadRecordings();
  });

  $: if (alarmId) {
    loadRecordings();
  }

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  });

  export function save() {
    saveRecordings();
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === "string") {
            const newRecording: Recording = {
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              dataUrl: e.target.result,
            };
            recordings = [newRecording, ...recordings];
            if (!alarmId) saveRecordings();
          }
        };
        reader.readAsDataURL(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      isRecording = true;
      recordingTime = 0;
      timerInterval = setInterval(() => {
        recordingTime++;
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(
        "Could not access microphone. Please ensure permissions are granted."
      );
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      clearInterval(timerInterval);
    }
  }

  function deleteRecording(id: string) {
    recordings = recordings.filter((r) => r.id !== id);
    if (!alarmId) saveRecordings();
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<Card
  class="border-border/50 flex h-full flex-col border bg-[var(--surface-glass)]/50"
>
  <CardHeader>
    <h3
      class="text-foreground flex items-center justify-between leading-none font-semibold tracking-tight"
    >
      <span class="flex items-center gap-2">
        <Mic class="size-5" />
        Voice Notes
      </span>
      <span
        class="border-border rounded border px-2 py-0.5 text-xs font-normal tracking-wider uppercase opacity-70"
        >Mock Only</span
      >
    </h3>
  </CardHeader>
  <CardContent class="flex flex-1 flex-col gap-4">
    {#if isRecording}
      <div
        class={`bg-background/50 border-destructive/50 flex min-h-32 animate-pulse flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed ${recordings.length === 0 ? "flex-1" : ""}`}
      >
        <span class="text-destructive font-mono text-xl"
          >● {formatTime(recordingTime)}</span
        >
        <Button variant="destructive" size="sm" onclick={stopRecording}>
          <Square class="mr-2 size-4" /> Stop Recording
        </Button>
      </div>
    {:else}
      <button
        type="button"
        class={`border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50 flex min-h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${recordings.length === 0 ? "flex-1" : ""}`}
        onclick={startRecording}
      >
        <Mic class="text-muted-foreground mb-2 size-8" />
        <span class="text-muted-foreground text-sm">Start Recording</span>
      </button>
    {/if}

    {#if recordings.length > 0}
      <div class="space-y-3">
        {#each recordings as rec (rec.id)}
          <div
            class="border-border text-card-foreground flex flex-col gap-2 rounded-lg border p-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm font-medium">
                <div
                  class="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full"
                >
                  <User class="size-3.5" />
                </div>
                <span>{appState.user?.username || "User"}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="text-muted-foreground hover:text-destructive h-6 w-6"
                onclick={() => deleteRecording(rec.id)}
              >
                <Trash2 class="size-3.5" />
              </Button>
            </div>

            <audio
              src={rec.dataUrl}
              controls
              class="mt-1 h-8 w-full dark:hue-rotate-180 dark:invert-[.9]"
            ></audio>

            <div class="text-muted-foreground text-right text-xs">
              {new Date(rec.timestamp).toLocaleString()}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </CardContent>
</Card>
