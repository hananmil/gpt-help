<svelte:options accessors={true} />

<script lang="ts">
  import type { TextArea } from "@vscode/webview-ui-toolkit";
  import { interactionStore, messagesStore, sessionStore } from "./messages.store";
  import { ParticipantType, type InteractionTextMessage, InteractionEvent } from "./dto/index";
  import { vscode } from "./utilities/vscode";
  import type { IEvent } from "./dto/events";
  import { V4MAPPED } from "dns";
  // import uniqid from "uniqid";
  let input: TextArea = null;

  let currentMessage: InteractionTextMessage;

  export function sendMessage() {
    const message = input.value;
    if (message.trim() !== "") {
      if (!currentMessage) {
        currentMessage = messagesStore.create(message);
      }
      currentMessage.payload.text = message;
      const interaction = $interactionStore;
      const session = $sessionStore;

      messagesStore.upsert(currentMessage);
      console.log("sending message", currentMessage);
      const event = new InteractionEvent<InteractionTextMessage>({
        action: "sent",
        payload: currentMessage,
        interactionId: interaction?.id ?? session?.id,
      });

      vscode.postMessage(event);

      currentMessage = null;
      input.value = "";
    }
  }

  async function clearConversation() {
    messagesStore.clear();
  }

  function writing(event) {
    if (input.value.trim() !== "" && !currentMessage) {
      console.log("writing set to true");
      currentMessage = messagesStore.create("writing...");
      return;
    }
    if (input.value.trim() === "" && currentMessage) {
      console.log("writing set to false");
      messagesStore.remove(currentMessage.id);
      currentMessage = null;
    }
  }
</script>

<section on:submit|preventDefault={sendMessage} class="bottom-section">
  <section>
    <vscode-text-area rows="4" id="user-input" bind:this={input} on:input={writing}>
      <span slot="start" class="codicon codicon-git-merge">Title</span>
    </vscode-text-area>
    <p>Press <code>Ctrl</code>+<code>Enter</code> to send.</p>
  </section>
  <div class="search-toolbar">
    <div class="toolbar-grow">
      {#if $sessionStore}
        Session id <vscode-tag>{$sessionStore?.id ?? ""}</vscode-tag>
      {/if}
      {#if $interactionStore}
        Interaction id <vscode-tag>{$interactionStore?.id ?? ""}</vscode-tag>
        {JSON.stringify($interactionStore?.participants?.agents ?? "")}
      {/if}
    </div>
    <vscode-button appearance="primary" on:keydown={sendMessage} on:click={sendMessage}
      >Send message</vscode-button
    >
    <vscode-button appearance="primary" on:keydown={clearConversation} on:click={clearConversation}
      >Clear</vscode-button
    >
  </div>
</section>

<style>
  vscode-text-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    border-style: solid;
    border-width: 1px;
  }

  .toolbar-grow {
    flex-grow: 1;
    justify-content: center;
  }

  vscode-tag {
    margin-top: 0.8em;
    margin-bottom: 0.5em;
    margin-left: 1em;
  }

  vscode-button {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    margin-right: 1em;
  }

  .bottom-section {
    padding: 10px;
  }

  .search-toolbar {
    background-color: var(--vscode-editorSuggestWidget-selectedBackground);
    border-color: var(--vscode-focusBorder);
    border-style: solid;
    border-width: 1px;
    display: flex;
    gap: em;
    justify-content: flex-end;
    padding: 3px;
    margin-bottom: 2em;
  }
</style>
