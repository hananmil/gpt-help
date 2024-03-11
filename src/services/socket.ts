import { Manager, Socket } from "socket.io-client";
import { WithJwt } from "./auth";
import { OutputChannel, StatusBarItem } from "vscode";

export enum SocketStatus {
  new = "new",
  connecting = "connecting",
  ready = "ready",
  busy = "busy",
  dropped = "dropped",
}

const WS_URL = "ws://localhost:3000";

export class ServiceConnectionSocket {
  private _manager: Manager;
  private _socket: Socket;
  private _status: SocketStatus;

  private _onReady: () => void = () => {};
  private _onBusy: () => void = () => {};
  private _onDropped: () => void = () => {};
  private _onConnected: () => void = () => {};

  constructor(userInfo: WithJwt) {
    this._manager = new Manager(WS_URL, {
      extraHeaders: { jwt: userInfo.jwt },
    });
    this._socket = this._manager.socket("/");
    this.initSocket();
    this._status = SocketStatus.new;
  }

  private initSocket() {
    this._socket.on("connect", () => {
      this._onConnected();
      this._status = SocketStatus.ready;
      this._onReady();
    });
    this._socket.on("disconnect", () => {
      this._onBusy();
      this._status = SocketStatus.dropped;
      this._onDropped();
    });
    this._socket.onAny((event, ...args) => {});
  }

  public connect(): void {
    this._socket.connect();
  }
  public closeConnection() {
    this._socket.disconnect();
  }

  public on(messageName: string, handler: (message: any) => void) {
    this._socket.on(messageName, handler);
  }

  public send(message: unknown) {
    this._socket.emit("message", message);
    this._status = SocketStatus.busy;
    this._onBusy();
  }

  public get status(): SocketStatus {
    return this._status;
  }

  public onBusy(handler: () => void) {
    this._onBusy = handler;
  }
  public onReady(handler: () => void) {
    this._onReady = handler;
  }

  public onDropped(handler: () => void) {
    this._onDropped = handler;
  }

  public onConnected(handler: () => void) {
    this._onConnected = handler;
  }
}
