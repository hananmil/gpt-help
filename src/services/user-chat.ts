import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "openai";
import * as MarkdownIt from "markdown-it";
import { ChatAccess } from "./gpt-access/chat-access";

export interface IChatMessage {
  id: string;
  replyMessageId?: string;
  replyToMessageId?: string;
  sender?: string;
  text?: string;
  timestamp?: number;
  isWriting: boolean;
}

export class UserChat {
  private internalDialog: ChatAccess = new ChatAccess();
  private messages: Array<IChatMessage> = [];

  public async processMessage(messageString: string, postMessage: (message: any) => Thenable<boolean>) {
    const parsed = JSON.parse(messageString);

    const message = parsed.message as IChatMessage;
    const action = parsed.action as string;
    switch (action) {
      case "send": {
        this.messages.push(message);
        await this.internalDialog.sendMessage(this.mapMessages(), (data: string) => {
          var responseMessage: IChatMessage | undefined;

          responseMessage = this.messages.find((m) => m.id === message.replyMessageId);

          if (!responseMessage) {
            responseMessage = {
              id: message.replyMessageId ?? "",
              replyToMessageId: message.id,
              sender: "bot",
              text: data,
              timestamp: Date.now(),
              isWriting: true,
            };
            this.messages.push(responseMessage);
          } else {
            responseMessage.text += data;
          }

          var md = new MarkdownIt();
          responseMessage = { ...responseMessage };
          responseMessage.text = md.render(responseMessage.text ?? "");

          postMessage({ action: "chatReply", message: responseMessage });
        });

        return;
      }
      case "clear": {
        console.log("clearing session");
        this.messages = [];
        postMessage({ action: "clearResult", message: "cleared" });
        return;
      }
      default: {
        console.error("unknown action", action, message, messageString);
        postMessage({ action: "unknown", message: "unknown" });
      }
    }
  }

  private mapMessages(): Array<ChatCompletionRequestMessage> {
    return this.messages.map((m) => {
      return {
        content: m.text as string,
        role: (m.sender === "bot" ? "assistant" : m.sender) as ChatCompletionRequestMessageRoleEnum,
      };
    });
  }
}
