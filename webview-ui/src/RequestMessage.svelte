<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { type RequestChatMessage } from "./ChatMessages";

  export let message: RequestChatMessage | undefined;
</script>

{#if message}
  <span>
    {message.message.role}
  </span>
  <span>
    {message.message.content}
  </span>
{/if}
