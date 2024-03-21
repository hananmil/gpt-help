import type { ChatCompletionChunk, ChatCompletionUserMessageParam } from "openai/resources/index.mjs";
import { get, writable, readable } from "svelte/store";
import type { ChatCompletionMessage } from "openai/resources";
import {
  InteractionElementType,
  InteractionEvent,
  InteractionMessage,
  Interaction,
  InteractionSession,
  InteractionTextMessage,
  ParticipantType,
  PayloadType,
} from "./dto/index";
import type { Writable } from "stream";
import e from "cors";

let interaction = writable<Interaction>();
let session = writable<InteractionSession>();

export function createStore() {
  const { subscribe, update } = writable<InteractionTextMessage[]>([]);

  function upsertRecord(message: InteractionTextMessage) {
    update((messages: InteractionTextMessage[]) => {
      const index = messages.findIndex((m) => m.id === message.id);
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
        id: generateRandomId(10),
        createdAt: new Date(),
        updatedAt: new Date(),
        elementType: InteractionElementType.message,
        from: { type: ParticipantType.user, id: "user-id" },
        to: { type: ParticipantType.agent, id: "default" },
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
        const index = messages.findIndex((m) => m.id === messageId);
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
        const index = messages.findIndex((m) => m.id === messageId);
        if (index === -1) {
          return messages;
        }
        messages.splice(index, 1);
        return messages;
      });
    },
    clear: () => {
      interaction.set(null);
      session.set(null);
      update(() => []);
    },
  };
}
console.log("----------------------Store creted----------------------");

export const store = createStore();
export const activeInteraction = { subscribe: interaction.subscribe };
export const activeSession = { subscribe: session.subscribe };

window?.addEventListener(
  "message",
  (event: MessageEvent<InteractionEvent<InteractionMessage | Interaction | InteractionSession>>) => {
    console.log("Message received", event.data);
    switch (event.data.payload.elementType) {
      case InteractionElementType.interaction:
        interaction.set(event.data.payload as Interaction);
        break;
      case InteractionElementType.session:
        session.set(event.data.payload as InteractionSession);
        break;
      case InteractionElementType.message:
        store.upsert(event.data.payload as InteractionTextMessage);
    }
  }
);

export function generateRandomId(length: number = 10) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
