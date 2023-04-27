<svelte:options accessors={true} />

<script type="ts">
  import type { TextArea } from "@vscode/webview-ui-toolkit";
  import { BotService } from "./bot.service";
  import type { ChatMessages } from "./ChatMessages";

  let input: TextArea = null;
  let botService: BotService = new BotService();

  export let messages: ChatMessages = null;
  let currentMessageId: string = null;

  export function sendMessage() {
    const message = input.value;
    if (message.trim() !== "") {
      if (currentMessageId === null) {
        currentMessageId = messages.addMessage({ isWriting: false, sender: "user", text: message });
      } else {
        messages.updateMessage({ id: currentMessageId, isWriting: false, sender: "user", text: message });
      }
      var replyMessageId = messages.addMessage({ isWriting: true, sender: "bot", text: "Thinking..." });
      messages.updateMessage({ id: currentMessageId, replyMessageId });
      botService.sendMessage(messages.getById(currentMessageId));
      currentMessageId = null;
      input.value = "";
    }
  }

  async function clearConversation() {
    await botService.clearConversation();
  }

  function writing(event) {
    if (input.value.trim() !== "" && currentMessageId === null) {
      currentMessageId = messages.addMessage({ isWriting: true, sender: "user" });
      return;
    }
    if (input.value.trim() === "" && currentMessageId) {
      messages.removeMessage(currentMessageId);
      currentMessageId = null;
    }
  }
</script>

<section on:submit|preventDefault={sendMessage} class="bottom-section">
  <section>
    <vscode-text-area rows="4" id="user-input" bind:this={input} on:input={writing}>
      <span slot="start" class="codicon codicon-git-merge">Title</span>
    </vscode-text-area>
  </section>
  <div class="search-toolbar">
    <vscode-button appearance="primary" on:click={sendMessage}>Send message</vscode-button>
    <vscode-button appearance="primary" on:click={clearConversation}>Clear conversation</vscode-button>
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

  .bottom-section {
    padding: 10px;
  }

  .search-toolbar {
    background-color: var(--vscode-editorSuggestWidget-selectedBackground);
    border-color: var(--vscode-focusBorder);
    border-style: solid;
    border-top: none;
    border-width: 1px;
    display: flex;
    gap: 2em;
    justify-content: flex-end;
    padding: 3px;
    margin-bottom: 2em;
  }
</style>
