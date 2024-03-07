import * as MarkdownIt from "markdown-it";
import { ChatAccess } from "./gpt-access/chat";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";
import {
  AnyChatMessage,
  RequestChatMessage,
  ResponseChatMessage,
  ResponseChatChunk,
  ChatMessageMerger,
} from "./gpt-access/dto";
import { Tools } from "./gpt-access/tools";

export class UserChat {
  private internalDialog: ChatAccess = new ChatAccess();
  private messages: Array<AnyChatMessage> = [];

  public async processMessage(request: any, postMessage: (message: any) => Thenable<boolean>) {
    const message = request.message as RequestChatMessage;
    const action = request.action as string;

    switch (action) {
      case "send": {
        this.messages.push(message);
        let responseMessage: ResponseChatMessage | undefined;
        let done = false;
        while (!done) {
          // let md = new MarkdownIt();
          let seq = 0;
          const manager = new ChatMessageMerger(message.id);
          await this.internalDialog.sendMessage(
            this.messages.map((m) => this.map(m)),
            async (chunk: ChatCompletionChunk) => {
              postMessage({
                action: "chatChunk",
                message: <ResponseChatChunk>{
                  id: message.replyMessageId,
                  seq: seq++,
                  type: "chunk",
                  isWriting: true,
                  requestMessageId: message.id,
                  timestamp: Date.now(),
                  message: chunk,
                },
              });
              responseMessage = manager.mergeChunk(chunk);
            }
          );

          if (!responseMessage) {
            return;
          }
          responseMessage.isWriting = false;
          console.log("sending response", responseMessage);
          this.messages.push(responseMessage);
          await postMessage({ action: "chatReply", message: responseMessage });

          if (responseMessage.message.choices[0].message.tool_calls) {
            for (let i = 0; i < responseMessage.message.choices[0].message.tool_calls.length; i++) {
              const toolsCall = responseMessage.message.choices[0].message.tool_calls[i];
              const tool = Tools.getToolDelegate(toolsCall.function.name);
              if (!tool) {
                console.error("unknown tool", toolsCall.function.name);
                return;
              }
              const toolResult = await tool(JSON.parse(toolsCall.function.arguments));
              const resultMessage = <ChatCompletionToolMessageParam>{
                // eslint-disable-next-line @typescript-eslint/naming-convention
                tool_call_id: toolsCall.id,
                role: "tool",
                content: toolResult,
              };
              this.messages.push({
                id: responseMessage.id,
                type: "response",
                isWriting: false,
                message: {
                  choices: [
                    {
                      message: resultMessage,
                      index: 0,
                      finish_reason: "stop",
                    },
                  ],
                },
              });
            }
          } else {
            done = true;
          }
        }
        return;
      }
      case "loadMessages": {
        console.log("loading messages");
        for (let i = 0; i < this.messages.length; i++) {
          await postMessage({ action: "chatReply", message: this.messages[i] });
        }
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

  private map(m: AnyChatMessage): ChatCompletionMessageParam {
    if (m.type === "request") {
      const request = m as RequestChatMessage;
      return {
        name: "user",
        role: "user",
        content: request.message.content,
      } as ChatCompletionUserMessageParam;
    }
    const responseMessage = m as ResponseChatMessage;
    const choice = responseMessage.message.choices[0];
    return choice.message;
  }
}
