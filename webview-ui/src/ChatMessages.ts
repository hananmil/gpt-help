import { BotService } from "./bot.service";

export interface IChatMessage {
  id: string;
  replyMessageId?: string;
  replyToMessageId?: string;
  sender?: string;
  text?: string;
  timestamp?: number;
  isWriting: boolean;
  questions?: any[];
}

export class ChatMessages {
  private _messages: IChatMessage[] = [];
  private botService: BotService = new BotService();
  private _onMessagesChanged: () => void = () => {};

  public messages: IChatMessage[] = [];

  constructor() {
    const messages: IChatMessage[] = JSON.parse(localStorage.getItem("messages"));
    if (messages) {
      this._messages = messages;
      this.updateMessages();
    }

    this.botService.setMessageReceivedHandler(this.onMessageReceived.bind(this));
  }

  public getById(id: string): IChatMessage {
    const index = this._messages.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Message with id ${id} not found`);
    }
    return this._messages[index];
  }

  private onMessageReceived(message) {
    console.log("Message received", message);
    switch (message.action) {
      case "chatResult":
        this.updateMessage(message.message);
        break;
      case "clearResult":
        this.clearMessages();
        break;
      default:
        console.error("Unknown action: " + message.action);
    }
  }

  public addMessage(message: Partial<IChatMessage>): string {
    if (message.id) {
      throw new Error("Message id is not allowed to be set");
    }
    var newMessage: IChatMessage = { id: this.generateRandomId(5), isWriting: false, ...message };
    this._messages.push(newMessage);
    this.updateMessages();

    console.log("added message", newMessage);
    return newMessage.id;
  }

  public updateMessage(message: Partial<IChatMessage>) {
    console.log("Updating message", message);
    const index = this._messages.findIndex((m) => m.id === message.id);
    if (message.text?.startsWith("###") && message.text?.endsWith("###")) {
      const questions = JSON.parse(message.text.substring(3, message.text.length - 3));
      message.questions = questions;
      console.log("Message is a question ", questions);
    }

    if (index === -1) {
      throw new Error(`Message with id ${message.id} not found`);
    }
    this._messages[index] = { ...this._messages[index], ...message };
    this.updateMessages();
  }

  public removeMessage(id: string) {
    console.log("Removing message", id);
    const index = this._messages.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Message with id ${id} not found`);
    }
    this._messages.splice(index, 1);
    this.updateMessages();
  }

  public clearMessages() {
    console.log(`Clearing ${this._messages.length} messages`);
    this._messages = [];
    this.updateMessages();
  }

  public setOnMessagesChangedHandler(handler: () => void) {
    this._onMessagesChanged = handler;
  }

  private updateMessages() {
    this.messages = [...this._messages];
    localStorage.setItem("messages", JSON.stringify(this._messages));
    this._onMessagesChanged();
  }

  private generateRandomId(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}
