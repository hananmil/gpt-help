import type { ChatCompletionChunk, ChatCompletionUserMessageParam } from "openai/resources/index.mjs";
import { get, writable } from "svelte/store";
import type { ChatCompletionMessage } from "openai/resources";
import {
  InteractionEvent,
  InteractionMessage,
  NewInteractionMessage,
  NewSessionMessage,
  InteractionTextMessage,
  ParticipantType,
  PayloadType,
} from "./dto/index";
import { v4 } from "uuid";

let activeSessionId: string | null = null;
let activeInteractionId: string | null = null;

function createStore() {
  const { subscribe, update } = writable<InteractionTextMessage[]>([]);

  function upsertRecord(message: InteractionTextMessage) {
    update((messages: InteractionTextMessage[]) => {
      const index = messages.findIndex((m) => m.messageId === message.messageId);
      if (index === -1) {
        return [...messages, message];
      }
      messages[index] = message;
      return messages;
    });
  }

  return {
    subscribe,
    create: (text: string): InteractionTextMessage => {
      const message: InteractionTextMessage = {
        messageId: generateRandomId(10),
        messageSequence: null,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        sessionId: activeSessionId,
        interactionId: activeInteractionId,
        participantId: null,
        participantType: ParticipantType.User,
        payloadType: PayloadType.text,
        finishedAt: null,
        payload: { text },
      };
      upsertRecord(message);
      return message;
    },
    upsert: upsertRecord,
    updateMessage: (
      messageId: string,
      func: (message: InteractionTextMessage | undefined) => InteractionTextMessage
    ) => {
      update((messages: InteractionTextMessage[]) => {
        const index = messages.findIndex((m) => m.messageId === messageId);
        if (index === -1) {
          messages.push(func(undefined));
          return messages;
        }
        messages[index] = func(messages[index]);
        return messages;
      });
    },
    remove: (messageId: string) => {
      update((messages: InteractionTextMessage[]) => {
        const index = messages.findIndex((m) => m.messageId === messageId);
        if (index === -1) {
          return messages;
        }
        messages.splice(index, 1);
        return messages;
      });
    },
    clear: () => {
      update(() => []);
    },
  };
}
console.log("----------------------Store creted----------------------");

export const store = createStore();
window?.addEventListener("message", (event: MessageEvent<InteractionEvent<InteractionMessage>>) => {
  activeSessionId = event.data.payload.sessionId || activeSessionId;
  activeInteractionId = event.data.payload.interactionId;
  store.upsert(event.data.payload as InteractionTextMessage);
});

export function generateRandomId(length: number = 10) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
