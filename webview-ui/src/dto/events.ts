export interface IEvent<T> {
  id: string;
  timestamp: Date;
  route: string;
  routingKey?: string;
  correlationId: string;
  metadata: Record<string, string>;
  payloadType: string;
  payload: T;
}
