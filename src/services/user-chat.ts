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

  public async processMessage(messageString: string): Promise<any> {
    const parsed = JSON.parse(messageString);

    const message = parsed.message as IChatMessage;
    const action = parsed.action as string;
    switch (action) {
      case "send": {
        this.messages.push(message);
        var result = await this.internalDialog.helpTheUser(this.mapMessages());

        var formattedResult = await this.internalDialog.detectQuestions(result);
        if (formattedResult !== "No questions.") {
          result = formattedResult;
        }

        const response = this.convertToHtml(result);

        var responseMessage: IChatMessage = {
          id: message.replyMessageId ?? "",
          replyToMessageId: message.id,
          sender: "bot",
          text: response,
          timestamp: Date.now(),
          isWriting: false,
        };

        return { action: "chatResult", message: responseMessage };
      }
      case "clear": {
        console.log("clearing session");
        this.messages = [];
        return { action: "clearResult", message: "cleared" };
      }
      default: {
        console.error("unknown action", action);
        return { action: "unknown", message: "unknown" };
      }
    }
  }

  private mapMessages(): Array<ChatCompletionRequestMessage> {
    return this.messages.map((m) => {
      return {
        content: m.text as string,
        role: (m.sender === "bot" ? "agent" : m.sender) as ChatCompletionRequestMessageRoleEnum,
      };
    });
  }

  private convertToHtml(input: string | undefined): string | undefined {
    if (!input) {
      return input;
    }
    const md = MarkdownIt();
    input = md.render(input);
    return input;
  }
}
