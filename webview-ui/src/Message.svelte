<script lang="ts">
  import {
    InteractionElementType,
    type InteractionElement,
    InteractionSession,
    InteractionMessage,
    PayloadType,
    InteractionToolMessage,
    InteractionTextMessage,
    Interaction,
  } from "./dto/index";
  import MarkdownIt from "markdown-it";

  export let element: InteractionElement | undefined;
  function isMessageElement(element: InteractionElement): element is InteractionMessage {
    return element.elementType === InteractionElementType.message;
  }
  function isSessionElement(element: InteractionElement): element is InteractionSession {
    return element.elementType === InteractionElementType.session;
  }
  function isInteractionElement(element: InteractionElement): element is Interaction {
    return element.elementType === InteractionElementType.interaction;
  }

  function isTextPayload(element: InteractionMessage): element is InteractionTextMessage {
    return element.payloadType === PayloadType.text;
  }

  function isToolPayload(element: InteractionMessage): element is InteractionToolMessage {
    return element.payloadType === PayloadType.tool;
  }
  const date = element.finishedAt as Date;
  function isDataPayload(element: InteractionMessage): element is InteractionMessage {
    return element.payloadType === PayloadType.data;
  }

  const md = new MarkdownIt();
</script>

{#if element}
  {#if isMessageElement(element)}
    <div class="message" class:writing={!!element.finishedAt}>
      <div class="message-sidebar">
        <div class="message-sender">
          <span class="from {element.from.type}"></span>
          <span>⇾</span>
          <span class="to {element.to.type}"></span>
        </div>
      </div>
      <div class="message-text {element.payloadType}">
        {#if isTextPayload(element)}
          {@html md.render(element.payload.text)}
        {:else if isToolPayload(element)}
          <p><strong>Function :</strong>{element.payload.functionName} callId {element.payload.callId}</p>
          <p>Arguments :</p>
          <span>
            {@html md.render(
              "\n```json\n" + JSON.stringify(JSON.parse(element.payload.dataString), null, 2) + "\n```"
            )}
          </span>
        {:else if isDataPayload(element)}
          <pre>{@html md.render("```\n" + JSON.stringify(element.payload, null, 2)) + "\n```"}</pre>
        {/if}
      </div>
    </div>
  {:else}
    <div class="message">
      <div class="message-sidebar">
        <div class="message-sender">
          <div class="system">
            {#if isSessionElement(element)}
              Session
            {:else}
              Interaction
            {/if}
          </div>
        </div>
      </div>
      <div class="message-text">
        {#if isSessionElement(element)}
          <p>Session started at {element.createdAt}</p>
        {:else}
          <p>Interaction started at {element.createdAt}</p>
        {/if}
        {#if isInteractionElement(element)}
          <div>
            <span>Participants:</span>
            {#each element.participants.agents as agent}
              <span class="agent">{agent.id}</span>
            {/each}
            {#if element.participants.user}
              <span class="user">and the user.</span>
            {:else}
              <span class="non-interactive">non interactive.</span>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style lang="scss">
  .message:nth-child(n + 2) {
    border-top: var(--vscode-inputValidation-warningBorder) 1px solid;
  }
  .message {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin: 0;
    padding: 0;

    :global(.writing) {
      font-style: italic;
    }

    :global(ol) {
      margin-block-start: 0.5em;
      margin-block-end: 0;
      padding-inline-start: 2em;
    }

    .message-sidebar {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 15em;
      border-right: var(--vscode-inputValidation-warningBorder) 1px solid;
      padding: 0%;
      margin: 0%;
      height: 100%;
      background-color: #f0f0f00e;

      .message-sender {
        display: block;
        width: 100%;
        padding-top: 0.5em;
        padding-left: 1em;

        .from {
          font-size: x-large;
        }
        .to {
          font-size: x-small;
        }
        ::before {
          content: "";
          // width: 2em;
          height: 2em;
          display: inline-block;
          background-size: contain;
          vertical-align: middle;
        }

        .user::before {
          content: "\1f9D0";
        }

        .agent::before {
          content: "\1f916";
        }
        .tool {
          color: aquamarine;
        }
        .tool::before {
          content: "⚒";
        }

        .system::before {
          content: "⚠";
          margin-right: 1em;
        }
        .system {
          text-align: center;
          color: orange;
          margin: 0%;
          padding: 0%;
        }
      }

      .message-sender.system {
        background-color: var(--vscode-inputValidation-warningBackground);
        border-bottom: var(--vscode-inputValidation-warningBorder) 1px solid;
      }
    }

    .message-text {
      margin: 0;
      padding: 0%;
      padding-bottom: 1em;
      margin-left: 1em;
      word-break: break-word;
      font-family: monospace;
      white-space: pre-wrap;
      width: 100%;
      :global(table) {
        margin-left: 4em;
        margin-top: 1em;
      }

      :global(th) {
        background-color: var(--vscode-activityBarBadge-background);
        text-align: center;
      }

      :global(tr):hover {
        font-weight: bold;
      }
    }
  }
</style>
