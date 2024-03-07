/* eslint-disable @typescript-eslint/naming-convention */
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageToolCall,
  ChatCompletionUserMessageParam,
} from "openai/resources";

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

export interface ResponseChatChunk extends ChatMessage<ChatCompletionChunk> {
  type: "chunk";
  requestMessageId: string;
  seq: number;
}

export interface ResponseChatMessage extends ChatMessage<ChatCompletion> {
  type: "response";
  requestMessageId: string;
}

export class ChatMessageMerger {
  private response: ResponseChatMessage | undefined;
  private requestMessageId: string;

  constructor(requestMessageId: string) {
    this.requestMessageId = requestMessageId;
  }

  public mergeChunk(chunk: ChatCompletionChunk): ResponseChatMessage {
    if (!this.response) {
      this.initializeResponse(chunk);
    }

    if (!this.response?.message.choices?.length) {
      throw new Error("No choices in response");
    }
    const choice = this.response?.message.choices[0];
    const chunkChoice = chunk.choices[0];

    this.validateRole(chunkChoice, choice);
    this.mergeToolCalls(chunkChoice, choice);
    this.mergeContent(chunkChoice, choice);

    return this.response as ResponseChatMessage;
  }

  private initializeResponse(chunk: ChatCompletionChunk) {
    this.response = {
      id: chunk.id,
      type: "response",
      isWriting: true,
      requestMessageId: this.requestMessageId,
      timestamp: Date.now(),
      message: {
        id: chunk.id,
        choices: [
          {
            index: 0,
            logprobs: chunk.choices[0].logprobs ?? null,
            message: {
              content: chunk.choices[0].delta?.content ?? null,
              role: "assistant",
              tool_calls: chunk.choices[0].delta?.tool_calls?.map(
                (tc) =>
                  <ChatCompletionMessageToolCall>{
                    id: tc.id,
                    type: "function",
                    function: {
                      id: tc.id,
                      name: tc.function?.name,
                      arguments: tc.function?.arguments,
                    },
                  }
              ),
            },
            finish_reason: chunk.choices[0].finish_reason ?? "length",
          },
        ],
        created: chunk.created,
        model: chunk.model,
        object: "chat.completion",
        system_fingerprint: chunk.system_fingerprint,
      },
    };
  }

  private validateRole(chunkChoice: ChatCompletionChunk.Choice, choice: ChatCompletion.Choice) {
    if (chunkChoice.delta?.role && chunkChoice.delta?.role !== choice.message.role) {
      throw new Error("Chunk Role mismatch");
    }
  }

  private mergeToolCalls(chunkChoice: ChatCompletionChunk.Choice, choice: ChatCompletion.Choice) {
    if (chunkChoice?.delta?.tool_calls) {
      if (!choice.message.tool_calls) {
        choice.message.tool_calls = chunkChoice.delta?.tool_calls?.map(
          (tc) =>
            <ChatCompletionMessageToolCall>{
              function: {
                name: tc.function?.name,
                id: tc.id,
                arguments: tc.function?.arguments,
              },
              id: tc.id,
              type: tc.type,
            }
        );
      } else {
        for (const tc of chunkChoice.delta.tool_calls) {
          const last: ChatCompletionMessageToolCall =
            choice.message.tool_calls[choice.message.tool_calls.length - 1];
          last.function.arguments += tc.function?.arguments ?? "";
        }
      }
    }
  }

  private mergeContent(chunkChoice: ChatCompletionChunk.Choice, choice: ChatCompletion.Choice) {
    if (chunkChoice.delta?.content) {
      if (!choice.message.content) {
        choice.message.content = chunkChoice.delta.content;
      } else {
        choice.message.content += chunkChoice.delta.content;
      }
    }
  }
}
