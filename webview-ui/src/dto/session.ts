import type { InteractionMessage } from "./interaction";

export enum InteractionType {
  session = "session",
  flow = "flow",
}

export interface ChatSession {
  readonly recordId: string;
  readonly ownerId: string;
  readonly rootInteraction: Interaction;
  readonly activeInteraction?: Interaction;
}

export class Interaction {
  id: string;
  sessionId: string;
  type: InteractionType;
  startTime: Date;
  lastUpdated: Date;
  agentId: string;
  users: string[];
  status: "active" | "completed" | "aborted";
  messages: InteractionMessage[];
  children?: Interaction[];
}
