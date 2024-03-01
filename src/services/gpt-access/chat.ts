import { OpenAI } from 'openai';
import { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources';

export type OnChunk = (data: ChatCompletionChunk.Choice) => Promise<void>;
export class ChatAccess {
    private api: OpenAI;
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in environment variables.");
        }
        this.api = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    public async sendMessage(arg0: Array<ChatCompletionMessageParam>, onChunk: OnChunk): Promise<void> {
        const response = await this.api.chat.completions.create({
            model: 'gpt-3.5-turbo-0125',
            messages: arg0,
            tools: this.getTools(),
            stream: true
        });

        for await (const message of response) {
            if (message.choices) {
                onChunk(message.choices[0]);
            }
        }

    }

    private getTools(): OpenAI.Chat.Completions.ChatCompletionTool[] | undefined {
        return [];
    }

}