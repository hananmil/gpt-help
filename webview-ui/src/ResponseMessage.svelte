<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { type AssistantChatMessage } from "./ChatMessages";

  export let message: AssistantChatMessage;
</script>

<span>
  {message.type}
</span>
