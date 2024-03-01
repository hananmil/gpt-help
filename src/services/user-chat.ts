import * as MarkdownIt from "markdown-it";
import { ChatAccess, OnChunk } from "./gpt-access/chat";
import { ChatCompletionAssistantMessageParam, ChatCompletionChunk, ChatCompletionUserMessageParam } from "openai/resources";
import { Type } from "typescript";

export interface ChatMessage<T> {
  id: string;
  timestamp?: number;
  isWriting: boolean;
  type: string;
  message: T;
}

export type AnyChatMessage = ChatMessage<any>;

export interface RequestChatMessage extends ChatMessage<ChatCompletionUserMessageParam> {
  type: "request";
  replyMessageId?: string;
}

export interface AssistantChatMessage extends ChatMessage<ChatCompletionChunk.Choice[]> {
  type: "response";
  replyToMessageId: string;
}


export class UserChat {
  private internalDialog: ChatAccess = new ChatAccess();
  private messages: Array<AnyChatMessage> = [];

  public async processMessage(request: any, postMessage: (message: any) => Thenable<boolean>) {

    const message = request.message as RequestChatMessage;
    const action = request.action as string;

    switch (action) {
      case "send": {
        this.messages.push(message);
        let responseMessage: AssistantChatMessage | undefined;

        // let md = new MarkdownIt();

        await this.internalDialog.sendMessage(this.messages.map(m => this.map(m)), async (chunk: ChatCompletionChunk.Choice) => {
          responseMessage = await this.onChunk(chunk, message);
        });

        if (!responseMessage) {
          return;
        }

        await postMessage({ action: "chatReply", message: responseMessage });

        return;
      }
      case "clear": {
        console.log("clearing session");
        this.messages = [];
        await postMessage({ action: "clearResult", message: "cleared" });
        console.log("posted cleared");
        return;
      }
      default: {
        console.error("unknown action", action, message, request);
        await postMessage({ action: "unknown", message: "unknown" });
      }
    }
  }
  map(m: AnyChatMessage): any {
    if (m.type === "request") {
      return {
        name: "user",
        role: 'user',
        content: m.message.text,
      } as ChatCompletionUserMessageParam;
    }
    if (m.type === "response") {
      return {
        role: 'assistant',
        message: m.message,
        id: m.id,
      } as ChatCompletionAssistantMessageParam;
    }
  }

  private async onChunk(data: ChatCompletionChunk.Choice, request: RequestChatMessage): Promise<AssistantChatMessage> {
    {
      let responseMessage = this.messages.find((m) => m.id === request.replyMessageId) as AssistantChatMessage | undefined;
      if (!responseMessage) {
        responseMessage = <AssistantChatMessage>{
          id: Math.random().toString(36).substring(7),
          type: "response",
          replyToMessageId: request.id,
          message: [data],
          isWriting: !data.finish_reason,
        };
        this.messages.push(responseMessage);
      } else {
        responseMessage.message.push(data);
      }
      return responseMessage;
    }
  };
}
