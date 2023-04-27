import { OpenAIApi, Configuration, CreateChatCompletionResponse, ChatCompletionRequestMessage } from "openai";

//This class implements the chat service interface
export class ChatService implements ChatService {
  public config: Configuration = new Configuration({
    apiKey: "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",
  });
  private api: OpenAIApi;

  constructor() {
    this.api = new OpenAIApi(this.config);
  }

  async sendMessage(
    messages: Array<ChatCompletionRequestMessage>
  ): Promise<CreateChatCompletionResponse | undefined> {
    try {
      var request = {
        model: "gpt-3.5-turbo",
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        max_tokens: 2048,
        temperature: 0.0,
        messages: messages,
        top_p: 1,
        user: "test",
      };
      //send message to server
      var completion = this.api.createChatCompletion(request);

      const response: CreateChatCompletionResponse = (await completion).data;
      console.debug("GPTChatAccess", {
        request,
        response,
      });
      return response;
    } catch (error) {
      console.error("error", error);
      return undefined;
    }
  }
}
