<svelte:options accessors={true} />

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    store,
    type AnyChatMessage,
    type RequestChatMessage,
    type AssistantChatMessage,
  } from "./ChatMessages";
  import type { Unsubscriber } from "svelte/store";
  import RequestMessage from "./RequestMessage.svelte";
  import ResponseMessage from "./ResponseMessage.svelte";
  let messages: AnyChatMessage[] = [];
  let subscription: Unsubscriber;
  onMount(() => {
    console.log("-------------------ChatArea mounted-----------------");
    subscription = store.subscribe((value) => {
      messages = value;
    });
  });
  onDestroy(() => {
    subscription();
  });
  function toRequest(message: AnyChatMessage): RequestChatMessage {
    return message as RequestChatMessage;
  }
  function toAssistant(message: AnyChatMessage): AssistantChatMessage {
    return message as AssistantChatMessage;
  }
</script>

<section class="chat-view">
  {#each messages as message}
    <div class="message {message.isWriting ? 'writing' : ''}">
      <p class="message-sender {message.type}">{message.type}:</p>
      {#if message.type === "request"}
        <p class="message-text">
          <RequestMessage message={toRequest(message)} />
        </p>
      {/if}
      {#if message.type === "response"}
        <p class="message-text">
          <ResponseMessage message={toAssistant(message)} />
        </p>
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
