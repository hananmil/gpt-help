import { v4 } from "uuid";
export interface IEvent<T> {
  id: string;
  timestamp: Date;
  route: string;
  routingKey?: string;
  parentEventId: string | undefined;
  correlationId: string;
  metadata: Record<string, string>;
  payload: T;
}

export function generateId(): string {
  return v4();
}
