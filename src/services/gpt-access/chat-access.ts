import { ChatCompletionRequestMessage } from "openai";
import { ChatService } from "..";

export class ChatAccess {
  private _chatService: ChatService = new ChatService();
  private static _detectQuestionsPrompt: Array<ChatCompletionRequestMessage> = [
    {
      role: "system",
      content: `Detect if the text contains questions. If it doesn't: reply with "No questions".
        If it does have questions:
        Reply with user input, and only perform the following formatting:
        
        If user input contains questions, format them by the example below. 
        If the input doesn't contains questions, say "No questions."
        
        Do you have a TV?
        Yes
        No
        
        Should be
        ###[{
            "Question": "Your favorite tool is?",
            "Answers":[
                {
                    "answer": "Axe",
                    "description": "Used to chop down trees"
                },
                {
                    "answer": "Pickaxe",
                    "description": "Used to mine"
                }
            ]
        }]###`,
    },
  ];

  private static _helpTheUserPrompt: Array<ChatCompletionRequestMessage> = [
    {
      role: "system",
      content: `
You are integrated into a vscode plugin, that can receive commands from you and help the user with his work.
Your output should be in a markdown only.

You should ask a user questions to help you build a better process as an end result.

For example, don't say "install XYS", ask the user if he has it installed. 
Don't ask questions dependant on previous answers. For example is you ask "Do you have TV?" don't ask "What's the size of your TV?".

Don't provide instructions before getting the answers you need.

For every question you ask the user, provide the user with possible answers.         
`,
    },
  ];

  constructor() {}

  public async helpTheUser(chat: Array<ChatCompletionRequestMessage>): Promise<string> {
    var messages = [...ChatAccess._helpTheUserPrompt, ...chat];
    const result = await this._chatService.sendMessage(messages);

    return result?.choices[0].message?.content ?? "";
  }

  public async detectQuestions(prompt: string): Promise<string> {
    var messages = [...ChatAccess._detectQuestionsPrompt, this.buildPromptMessage(prompt)];
    const result = await this._chatService.sendMessage(messages);

    return result?.choices[0].message?.content ?? "";
  }

  private buildPromptMessage(prompt: string): ChatCompletionRequestMessage {
    return {
      role: "user",
      content: prompt,
    };
  }
}
