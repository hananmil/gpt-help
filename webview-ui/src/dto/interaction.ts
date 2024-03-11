import { v4 } from "uuid";
import type { IEvent } from "./events";
import type { Interaction } from "./session";

export enum ParticipantType {
  User = "user",
  Agent = "agent",
  Tool = "tool",
}

export enum PayloadType {
  text = "text",
  audio = "audio",
  function = "function",
}

// Base interface for all conversation messages
export interface InteractionMessage<T = unknown> {
  messageId: string;
  sessionId: string;
  interactionId: string;
  messageSequence?: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  finishedAt?: Date;
  participantId: string; // Identifier for the source of the message (e.g., user, AI agent)
  participantType: ParticipantType;
  payloadType: PayloadType;
  payload: T;
}

export interface NewInteractionMessage<T = unknown>
  extends Omit<
    InteractionMessage<T>,
    "InteractionId" | "MessageSequence" | "CreatedAt" | "UpdatedAt" | "FinishedAt"
  > {}

export interface NewSessionMessage<T = unknown> extends Omit<NewInteractionMessage<T>, "SessionId"> {}

export interface TextMessagePayload {
  text: string;
}

export interface ToolsMessagePayload {
  functionName: string;
  dataString: string;
}

export interface InteractionTextMessage extends InteractionMessage<TextMessagePayload> {
  payloadType: PayloadType.text;
}

export interface InteractionToolMessage extends InteractionMessage<ToolsMessagePayload> {
  payloadType: PayloadType.function;
}
export type InteractionEventPayload =
  | InteractionMessage
  | NewInteractionMessage
  | NewSessionMessage
  | Interaction;

export class InteractionEvent<T extends InteractionEventPayload> implements IEvent<T> {
  public id: string;
  public timestamp: Date;
  constructor(
    public payloadType: "interaction" | "message",
    public payload: T,
    public direction: "inbound" | "outbound",
    public correlationId: string | undefined = undefined,
    public metadata: Record<string, string> = {}
  ) {
    this.id = v4();
    this.timestamp = new Date();
  }
  public get route(): string {
    return this.payloadType + "." + this.direction;
  }
  public get routingKey(): string {
    switch (this.payloadType) {
      case "interaction":
        return ParticipantType.Agent;
      case "message":
        return (this.payload as InteractionMessage).participantType;
    }
    return "UnknownPayload." + this.payloadType;
  }
}

export type transformFrom<Payload extends TextMessagePayload | ToolsMessagePayload, To> = (
  message: InteractionMessage<Payload>
) => To;
export type transformTo<Payload extends TextMessagePayload | ToolsMessagePayload, From> = (
  message: From
) => InteractionMessage<Payload>;
