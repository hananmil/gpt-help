<script type="ts">
  import SearchBox from "./SearchBox.svelte";
  import ChatArea from "./ChatArea.svelte";

  import { onMount } from "svelte";

  import { allComponents, provideVSCodeDesignSystem } from "@vscode/webview-ui-toolkit";
  import { MessageFormatter } from "./messageFormatter.service";

  let messageFormatter: MessageFormatter = null;

  provideVSCodeDesignSystem().register(allComponents);

  let searchBox: SearchBox = null;
  let chatArea: ChatArea = null;

  function handleKeyDown(event) {
    if (event.keyCode === 13 && event.ctrlKey) {
      searchBox.sendMessage();
    }
  }

  function updateBottomHeight() {
    const bottomHeight = (document.querySelector(".bottom-section") as HTMLElement).offsetHeight;
    document.documentElement.style.setProperty("--input-height", bottomHeight + "px");
  }

  onMount(() => {
    updateBottomHeight();
    window.addEventListener("resize", updateBottomHeight);

    messageFormatter = new MessageFormatter();
    searchBox.messages = chatArea.messages;
  });
</script>

<vscode-panel-view orientation="horizontal" aria-label="Default" on:keydown={handleKeyDown}>
  <ChatArea bind:this={chatArea} />
  <SearchBox bind:this={searchBox} />
</vscode-panel-view>

<style>
  :root {
    --input-height: 0;
  }

  vscode-panel-view {
    background-color: var(--vscode-editor-background);
    color: var(--vscode-foreground);
    height: 100%;
    position: relative;
    display: flex;
    align-content: flex-start;
    flex-direction: column;
    justify-content: space-between;
  }
</style>
