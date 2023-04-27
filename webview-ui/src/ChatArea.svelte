<svelte:options accessors={true} />

<script type="ts">
  import { update_await_block_branch } from "svelte/internal";
  import { ChatMessages } from "./ChatMessages";

  export let messages: ChatMessages = new ChatMessages();

  messages.setOnMessagesChangedHandler(() => {
    messages = messages;
  });
</script>

<section class="chat-view">
  {#each messages.messages as message}
    <div class="message">
      <p class="message-sender {message.sender}">{message.sender ?? "Unknown sender"}:</p>
      {#if !message.isWriting && message.text}
        <p class="message-text">
          {@html message.text}
        </p>
      {/if}
      {#if message.isWriting}
        <p class="loader">Writing...</p>
      {/if}
    </div>
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

  .message {
    margin-bottom: 0.8em;
    display: inline;
    flex-direction: column;
    align-items: flex-start;
  }

  .message :global(p) {
    display: inline;
  }

  .message :global(ol) {
    margin-block-start: 0.5em;
    margin-block-end: 0;
    padding-inline-start: 2em;
  }

  .message > :global(p) :global(p):first-child {
    /* vertical-align: bottom; */
  }

  .message > p {
    line-height: 1.6em;
  }

  .message-sender {
    border-bottom: var(--vscode-activityBarBadge-background) 1px solid;
  }

  .message-sender > p {
    font-weight: bold;
  }
  .message-sender.user::before {
    content: "\1f9D0";
  }

  .message-sender.bot::before {
    content: "\1f916";
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
