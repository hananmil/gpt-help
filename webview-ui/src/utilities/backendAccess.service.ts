// import WebSocket from "ws";

export class BackendAccess {
  private ws: WebSocket;

  public onMessageReceived: (message: any) => void = () => {};

  constructor() {
    this.initConnection();
  }

  public clearSession() {
    const message = { action: "clear" };
    this.ws.send(JSON.stringify(message));
  }

  public sendMessage(message: any) {
    this.ws.send(JSON.stringify(message));
  }

  private initConnection() {
    this.ws = new WebSocket("ws://localhost:3000/api/socket");
    console.log("Initializing connection to server");
    this.ws.onclose = () => {
      console.log("Disconnected from server");
      setTimeout(() => {
        this.initConnection();
        console.log("Reconnecting to server");
      }, 1000);
    };
    this.ws.onopen = () => {
      console.log("Connected to server");
    };
    this.ws.onmessage = async (event) => {
      // console.log("Received message: ", event);

      const parsedMessage = JSON.parse(await event.data.text());
      // console.log("Parsed message: ", parsedMessage);
      if (parsedMessage.message) {
        this.onMessageReceived(parsedMessage);
      }
    };
  }
}
