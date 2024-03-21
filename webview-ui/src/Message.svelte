<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { InteractionTextMessage } from "./dto/index";

  export let message: InteractionTextMessage | undefined;
</script>
{#if message}
  <div class="message {message.finishedAt ?  '' : 'writing'}">
    <p class="message-sender">{message.from.type}</p>
    <p class="message-text">
      {message.payload.text}
    </p>
    <br />
   <small>{message.id}</small>
  </div>
{/if}
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

  .message {
    margin-bottom: 0.8em;
    display: inline;
    flex-direction: column;
    align-items: flex-start;
    white-space: break-spaces;
  }

  .message.writing {
    font-style: italic;
  }

  .message :global(p) {
    display: inline;
  }

  .message :global(ol) {
    margin-block-start: 0.5em;
    margin-block-end: 0;
    padding-inline-start: 2em;
  }

  .message > p {
    line-height: 1.6em;
  }

  .message-sender {
    border-bottom: var(--vscode-activityBarBadge-background) 1px solid;
    font-family: monospace;
    display: inline-block;
    min-width: 7em;
  }
  .message-sender::before {
    content: "";
    width: 2em;
    height: 2em;
    display: inline-block;
    background-size: contain;
    border-radius: 3em;
    vertical-align: middle;
    margin-right: 1em;
  }

  .message-sender.user::before {
    /* content: "\1f9D0"; */
    background-image: url("/assets/avatar.png");
  }

  .message-sender.bot::before {
    background-image: url("/assets/robotvatar.png");
  }

  .message :global(table) {
    margin-left: 4em;
    margin-top: 1em;
  }

  .message :global(th) {
    background-color: var(--vscode-activityBarBadge-background);
    text-align: center;
  }

  .message :global(tr):hover {
    font-weight: bold;
  }

  .message-text {
    margin-top: 5px;
    word-break: break-word;
    width: 100%;
  }

  .loader {
    margin: 8px;
  }
</style>
