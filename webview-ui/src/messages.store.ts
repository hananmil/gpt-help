import type { ChatCompletionChunk, ChatCompletionUserMessageParam } from "openai/resources/index.mjs";
import { get, writable, readable, Writable, Updater, Subscriber } from "svelte/store";
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
  InteractionElement,
} from "./dto/index";

const LOCAL_STORAGE_KEY = "messages";
const LOCAL_STORAGE_KEY_SESSION = "session";
const LOCAL_STORAGE_KEY_INTERACTION = "interaction";

export let messagesStore: MessagesStore;
export let interactionStore: Writable<Interaction>;
export let sessionStore: Writable<InteractionSession>;

let interaction: Interaction;
let session: InteractionSession;

export type MessagesStore = ReturnType<typeof createMessagesStore>;

async function saveToLocalStorage(key: string, data: any): Promise<void> {
  await localStorage.setItem(key, JSON.stringify(data));
}
async function loadFromLocalStorage<T>(key: string, defaultValue: T): Promise<T> {
  const data = await localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

async function loadCache() {
  const session = loadFromLocalStorage<InteractionSession | null>(LOCAL_STORAGE_KEY_SESSION, null);
  const interaction = loadFromLocalStorage<Interaction | null>(LOCAL_STORAGE_KEY_INTERACTION, null);
  const messages = loadFromLocalStorage<InteractionElement[]>(LOCAL_STORAGE_KEY, []);
  return { session: await session, interaction: await interaction, messages: await messages };
}

function createMessagesStore() {
  const { subscribe, update } = writable<InteractionElement[]>([]);

  const upsertRecord = (message: InteractionElement) => {
    update((messages: InteractionElement[]) => {
      const index = messages.findIndex((m) => m.id === message.id);
      if (index === -1) {
        messages = [...messages, message];
      } else {
        messages[index] = message;
      }
      saveToLocalStorage(LOCAL_STORAGE_KEY, messages);
      return messages;
    });
  };

  return {
    subscribe,
    create: (text: string): InteractionTextMessage => {
      const message: InteractionTextMessage = {
        id: generateRandomId(10),
        createdAt: new Date(),
        updatedAt: new Date(),
        elementType: InteractionElementType.message,
        from: { type: ParticipantType.user, id: "user" },
        to: { type: ParticipantType.agent, id: "agent" },
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
        saveToLocalStorage(LOCAL_STORAGE_KEY, messages);
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
        saveToLocalStorage(LOCAL_STORAGE_KEY, messages);
        return messages;
      });
    },
    clear: () => {
      interactionStore.set(null);
      sessionStore.set(null);
      update(() => []);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
      localStorage.removeItem(LOCAL_STORAGE_KEY_INTERACTION);
    },
  };
}

function createStores() {
  const messages = createMessagesStore();
  const session = writable<InteractionSession>();
  const interaction = writable<Interaction>();

  loadCache().then(({ session: sessionData, interaction: interactionData, messages: messagesData }) => {
    session.set(sessionData);
    interaction.set(interactionData);
    messagesData.forEach((m) => messages.upsert(m));
  });

  return { messages, interaction, session };
}
console.log("----------------------Store creted----------------------");

const stores = createStores();
messagesStore = stores.messages;
interactionStore = stores.interaction;
sessionStore = stores.session;

window?.addEventListener(
  "message",
  (event: MessageEvent<InteractionEvent<InteractionMessage | Interaction | InteractionSession>>) => {
    console.log("Message received", event.data);
    switch (event.data.payload.elementType) {
      case InteractionElementType.interaction:
        interactionStore.set(event.data.payload as Interaction);
        interaction = event.data.payload as Interaction;
        saveToLocalStorage(LOCAL_STORAGE_KEY_INTERACTION, interaction);
        break;
      case InteractionElementType.session:
        sessionStore.set(event.data.payload as InteractionSession);
        session = event.data.payload as InteractionSession;
        saveToLocalStorage(LOCAL_STORAGE_KEY_SESSION, session);
        break;
    }
    messagesStore.upsert(event.data.payload as InteractionTextMessage);
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
