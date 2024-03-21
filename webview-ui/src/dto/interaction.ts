import type { InteractionElement, InteractionMessage } from "./interfaces";
import { InteractionElementType } from "./enums";
import { IEvent, generateId } from "./events";

export class InteractionEvent<T extends InteractionElement = InteractionElement> implements IEvent<T> {
  public id: string;
  public interactionId?: string;
  public timestamp: Date;
  public payload: T;
  public action:
    | "sent"
    | "requested"
    | "responded"
    | "completed"
    | "failed"
    | "created"
    | "updated"
    | "deleted"
    | "cancelled";
  public parentEventId: string | undefined = undefined;
  public correlationId: string | undefined = undefined;
  public metadata: Record<string, string> = {};
  constructor(source: Partial<Omit<InteractionEvent<T>, "id" | "timestamp" | "route" | "routingKey">>) {
    Object.assign(this, source);
    this.id = generateId();
    this.timestamp = new Date();
    if (!this.action) {
      throw new Error("direction is required for InteractionEvent");
    }
    if (!this.payload) {
      throw new Error("payload is required for InteractionEvent");
    }
  }

  public get route(): string {
    return this.payload.elementType + "." + this.action;
  }

  public get routingKey(): string {
    try {
      switch (this.payload.elementType) {
        case InteractionElementType.interaction:
          return InteractionElementType.interaction;
        case InteractionElementType.message:
          return (this.payload as InteractionElement as InteractionMessage).to.type;
        case InteractionElementType.session:
          return InteractionElementType.session;
        default:
          throw new Error(`Unsupported interaction element type: ${this.payload.elementType}`);
      }
    } catch (e) {
      return "failedToGetRoutingKey";
    }
  }
}
