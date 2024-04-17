<svelte:options accessors={true} />

<script lang="ts">
  import { messagesStore } from "./messages.store";
  import type { Unsubscriber } from "svelte/store";
  import Message from "./Message.svelte";

  let store: Unsubscriber;
</script>

<section class="chat-view">
  {#each $messagesStore as message}
    <Message element={message} />
  {/each}
</section>

<style>
  .chat-view {
    min-height: calc(100% - var(--input-height) - 32px);
    max-height: calc(100% - var(--input-height) - 32px);
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
</style>
