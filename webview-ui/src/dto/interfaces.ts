import type { InteractionElementType, ParticipantType, PayloadType } from "./enums";

export interface Participant {
  id: string;
  type: ParticipantType;
}

export interface InteractionParticipants {
  user?: Participant;
  agents: ReadonlyArray<Participant>;
}

export interface InteractionElement {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  finishedAt?: Date;
  elementType: InteractionElementType;
  parentElementId?: string;
}

export interface Interaction extends InteractionElement {
  children: Promise<readonly InteractionElement[]>;
  result?: InteractionMessage;
  participants: InteractionParticipants;
}

export interface InteractionSession extends Omit<Interaction, "parentElementId" | "result"> {
  ownerId: string;
}

export interface InteractionMessage<T = unknown> extends InteractionElement {
  from: Participant;
  to?: Participant;
  payloadType: PayloadType;
  payload: T;
}

export interface TextMessagePayload {
  text: string;
}

export interface ToolsMessagePayload {
  callId: string;
  functionName: string;
  dataString: string;
}

export interface SystemMessagePayload {
  agentMessageText: string;
  interactionMetadata: Record<string, string>;
}

export interface InteractionTextMessage extends InteractionMessage<TextMessagePayload> {
  payloadType: PayloadType.text;
}

export interface InteractionToolMessage extends InteractionMessage<ToolsMessagePayload> {
  payloadType: PayloadType.tool;
}

export interface InteractionSystemMessage extends InteractionMessage<SystemMessagePayload> {
  payloadType: PayloadType.data;
}
