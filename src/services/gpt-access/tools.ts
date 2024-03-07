import { ChatCompletionMessageToolCall, FunctionDefinition } from "openai/resources";
import { exec } from "child_process";
import { promisify } from "util";
import { JSONSchema } from "openai/lib/jsonschema";
import OpenAI from "openai";

export namespace Tools {
  const tools: Map<string, Tool> = new Map();

  export enum ToolType {
    flow = "flow",
    action = "action",
  }

  export type ToolExecitonDelegate = (arg: any) => Promise<string>;

  export interface Tool {
    type: ToolType;
    name: string;
    description: string;
    parameters: JSONSchema;
    delegate: ToolExecitonDelegate;
  }

  export function getChatCompletionTool(
    name: string
  ): OpenAI.Chat.Completions.ChatCompletionTool | undefined {
    const tool = tools.get(name);
    if (!tool) {
      return undefined;
    }
    return {
      type: "function",
      function: <FunctionDefinition>{
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    };
  }

  export function getToolDelegate(name: string): ToolExecitonDelegate | undefined {
    const tool = tools.get(name);
    return tool?.delegate;
  }

  export function register(
    type: ToolType,
    name: string,
    description: string,
    parameters: JSONSchema,
    delegate: ToolExecitonDelegate
  ): void {
    console.log(`Registering tool ${name}`);
    const tool = {
      type,
      name,
      description,
      parameters,
      delegate,
    };
    tools.set(name, tool);
  }
}
