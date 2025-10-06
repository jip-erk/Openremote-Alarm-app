<script lang="ts">
  import logo from "../../assets/logo.svg";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { openRemoteService } from "$lib/store.svelte";
  import { appState } from "$lib/store.svelte";
</script>

<header class=" flex items-center justify-between p-4">
  <img src={logo} alt="Logo" class=" h-12" />

  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Avatar.Root class="h-12 w-12">
        <Avatar.Fallback
          >{appState.user?.username
            ?.split(" ")
            .map((word) => word.charAt(0).toUpperCase())
            .join("")}</Avatar.Fallback
        >
      </Avatar.Root>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end" class="w-44">
      <DropdownMenu.Group>
        <DropdownMenu.Label>{appState.user?.username}</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={() => openRemoteService.logout()}
          >Logout</DropdownMenu.Item
        >
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</header>
