export enum MessageAddressType {
  User = "user",
  Agent = "agent",
  Tool = "tool",
}

// Base interface for all conversation messages
export interface InteractionMessage<T = unknown> {
  messageId: string;
  interactionId?: string;
  messageSequence?: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  finishedAt?: Date;
  sourceId: string; // Identifier for the source of the message (e.g., user, AI agent)
  sourceType: MessageAddressType;
  targetId: string; // Identifier for the target of the message (e.g., user, AI agent)
  targetType: MessageAddressType;
  payloadType: "text" | "function";
  payload: T;
}

export interface TextMessagePayload {
  text: string;
}

export interface ToolsMessagePayload {
  functionName: string;
  dataString: string;
}

export interface InteractionTextMessage extends InteractionMessage<TextMessagePayload> {
  payloadType: "text";
}

export interface InteractionFunctionMessage extends InteractionMessage<ToolsMessagePayload> {
  payloadType: "function";
}

export type transformFrom<Payload extends TextMessagePayload | ToolsMessagePayload, To> = (
  message: InteractionMessage<Payload>
) => To;
export type transformTo<Payload extends TextMessagePayload | ToolsMessagePayload, From> = (
  message: From
) => InteractionMessage<Payload>;

export interface Interaction {
  id: string;
  parentInteractionId: string;
  agents: string[];
  user?: string;
  messages: InteractionMessage[];
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "completed" | "aborted";
}
