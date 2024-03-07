import { strict } from "assert";
import { OpenAI } from "openai";
import { JSONSchema } from "openai/lib/jsonschema";
import {
  ChatCompletionChunk,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam,
  FunctionDefinition,
} from "openai/resources";
import { systemMessage } from "./instructions";
import { Tools } from "./tools";
import { request } from "http";
export type OnChunk = (data: ChatCompletionChunk) => Promise<void>;

import { exec } from "child_process";
import { promisify } from "util";

Tools.register(
  Tools.ToolType.action,
  "executeShellCommand",
  "Execute a shell command",
  <JSONSchema>{
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to be executed",
      },
    },
    required: ["command"],
  },
  async (args: any) => {
    const execAsync = promisify(exec);
    const result = await execAsync(args.command);
    return JSON.stringify(result);
  }
);

export class ChatAccess {
  private api: OpenAI;
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables.");
    }
    this.api = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  public async sendMessage(messages: Array<ChatCompletionMessageParam>, onChunk: OnChunk): Promise<void> {
    const request: ChatCompletionCreateParamsStreaming = {
      model: "gpt-3.5-turbo-0125",
      messages: [systemMessage, ...messages],
      tools: this.getTools(),
      stream: true,
    };
    console.log("sending request", request);
    const responseMessage = await this.api.chat.completions.create(request);

    for await (const message of responseMessage) {
      if (message.choices) {
        onChunk(message);
      }
    }
  }

  private getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] | undefined {
    const tool = Tools.getChatCompletionTool("executeShellCommand");
    if (tool) {
      return [tool];
    }
    return undefined;
  }
}
