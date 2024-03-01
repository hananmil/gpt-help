import type { ChatCompletionChunk, ChatCompletionUserMessageParam } from "openai/resources/index.mjs";
import { get, writable } from "svelte/store";
export interface ChatMessage<T> {
  id: string;
  timestamp?: number;
  isWriting: boolean;
  type: 'request' | 'response';
  message: T;
}

export type AnyChatMessage = ChatMessage<unknown>;

export interface RequestChatMessage extends ChatMessage<ChatCompletionUserMessageParam> {
  type: "request";
  replyMessageId?: string;
}

export interface AssistantChatMessage extends ChatMessage<ChatCompletionChunk.Choice[]> {
  type: "response";
  replyToMessageId: string;
}


function readCache() {
  try {
    const json = localStorage.getItem("messages");
    return json ? JSON.parse(json) : [];

  } catch (e) {
    console.warn("Error reading cache", e);
    return [];
  }
}
function createStore() {
  const { subscribe, update } = writable<AnyChatMessage[]>(readCache());

  return {
    subscribe,
    upsert: (message: AnyChatMessage) => {
      update((messages: AnyChatMessage[]) => {
        const index = messages.findIndex((m) => m.id === message.id);
        if (index === -1) {
          return [...messages, message];
        }
        messages[index] = message;
        return messages;
      });
    },
    get: () => get(store),
    clear: () => {
      update(() => []);
    },
    post: (message: AnyChatMessage) => {
      console.log("Posting message", message);
      window?.postMessage(message);
    }
  };
}
console.log("----------------------Store creted----------------------");

export const store = createStore();

window?.addEventListener('message', event => {
  console.log("Received message", event.data);
  const message = JSON.parse(event.data);
  if (message.action === 'clearResult') {
    if (message.message === 'cleared') {
      store.clear();
    } else {
      console.error("Unknown message", message);
    }
  } else if (message.action === 'chatReply') {
    store.upsert(message.message);
  }
})

export function generateRandomId(length: number = 10) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
