//This class allows a consumer to register to messages, and receive them once push was done
class MessagesQueue {
  private _messages: any[] = [];
  private _callbacks: ((message: any) => void)[] = [];

  constructor(private _name: string) {}

  public push(message: any) {
    if (this._callbacks.length > 0) {
      this._callbacks.forEach((callback) => callback(message));
    } else {
      this._messages.push(message);
    }
  }

  public register(callback: (message: any) => void) {
    this._callbacks.push(callback);
    this._messages.forEach((message) => {
      callback(message);
    });
    this._messages = [];
  }
}

export const messagesSendQueue = new MessagesQueue("messagesSendQueue");
export const messagesReturnQueue = new MessagesQueue("messagesReturnQueue");
