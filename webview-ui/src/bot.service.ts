import { vscode } from "./utilities/vscode";
import { messagesSendQueue, messagesReturnQueue } from "./utilities/messagesQueue";

export class BotService {
  private messageReceivedHandler: ((message: string) => void) | undefined;

  constructor() {
    this.messageReceivedHandler = undefined;
    window.addEventListener("message", (event) => {
      if (this.messageReceivedHandler) this.messageReceivedHandler(event.data);
    });
  }

  public setMessageReceivedHandler(handler: (message: string) => void) {
    this.messageReceivedHandler = handler;
  }

  public async sendMessage(message: object) {
    vscode.postMessage(JSON.stringify({ action: "send", message }));
  }

  public async clearConversation() {
    vscode.postMessage(JSON.stringify({ action: "clear" }));
  }
}
