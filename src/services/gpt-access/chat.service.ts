import {
  OpenAIApi,
  Configuration,
  CreateChatCompletionResponse,
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from "openai";

//This class implements the chat service interface
export class ChatService implements ChatService {
  private apiKey = process.env.OPENAI_API_KEY || "";
  public config: Configuration = new Configuration({
    apiKey: this.apiKey,
  });

  private api: OpenAIApi;

  constructor() {
    console.log("apiKey", this.apiKey);
    this.api = new OpenAIApi(this.config);
  }

  async sendMessage(
    messages: Array<ChatCompletionRequestMessage>
  ): Promise<CreateChatCompletionResponse | undefined> {
    try {
      var request = this.createRequest(messages);
      //send message to server
      var completion = this.api.createChatCompletion(request);

      const response: CreateChatCompletionResponse = (await completion).data;
      console.group("GPTChatAccess result:");
      console.groupCollapsed("Request:", request);
      console.groupCollapsed("Response:", response);
      console.groupCollapsed("GPTChatAccess result end.");
      console.groupEnd();
      return response;
    } catch (error) {
      console.error("error", error);
      return undefined;
    }
  }

  async sendMessageWStreamingResponse(
    message: Array<ChatCompletionRequestMessage>,
    onData: (data: string) => void
  ) {
    var request = this.createRequest(message);
    request.stream = true;
    var requestBody = JSON.stringify(request);
    console.log("requestBody", requestBody);
    var response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + this.apiKey,
      },
      body: requestBody,
    });
    if (!response.ok) {
      // console.error("response", response);
      throw new Error("Network response was not ok");
    }
    if (response.body === null) {
      throw new Error("Response body is null");
    }
    var reader = response.body.getReader();
    var decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      const parsedLines = lines
        .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
        .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
        .map((line) => {
          var result = JSON.parse(line);
          // console.log("line", result.choices[0]);
          return result;
        }); // Parse the JSON string

      for (const parsedLine of parsedLines) {
        const { choices } = parsedLine;
        const { delta } = choices[0];
        const { content } = delta;
        // Update the UI with the new content
        if (content) {
          onData(content);
        }
      }
    }
  }

  private createRequest(msgs: Array<ChatCompletionRequestMessage>): CreateChatCompletionRequest {
    var request = <CreateChatCompletionRequest>{
      model: "gpt-3.5-turbo",
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      max_tokens: 2048,
      temperature: 0.0,
      messages: msgs,
      top_p: 1,
      user: "test",
    };
    return request;
  }
}
