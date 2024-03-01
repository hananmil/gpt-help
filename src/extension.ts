import * as vscode from 'vscode';
import { commands, ExtensionContext } from "vscode";
import { GPTHelpPanel } from "./panels/GPTHelpPanel";

export async function activate(context: ExtensionContext): Promise<void> {
  // Create the show GPT help command
  const showHelloWorldCommand = commands.registerCommand("gpt-help-extention.showHelp", () => {
    GPTHelpPanel.render(context.extensionUri);
  });

  let key = await context.secrets.get('OPENAI_API_KEY');
  if (!key) {
    await vscode.window.showInputBox({
      password: true,
      placeHolder: 'Enter your OpenAI API key',
      prompt: 'This key will be stored securely in your user settings.',
      ignoreFocusOut: true,
    }).then((inputKey) => {
      if (inputKey) {
        key = inputKey
        context.secrets.store('OPENAI_API_KEY', inputKey);
      }
    });
    if (!key) {
      vscode.window.showErrorMessage('You must enter an OpenAI API key to use this extension.');
      return;
    }
  }
  process.env['OPENAI_API_KEY'] = key;
  // Add command to the extension context
  addDisposable(context, showHelloWorldCommand);

  GPTHelpPanel.render(context.extensionUri);

  console.log('Congratulations, your extension "gpt-help-extention" is now active!');
}

//a function to add disposable to execution context
function addDisposable(context: ExtensionContext, disposable: { dispose(): any }) {
  context.subscriptions.push(disposable);
}
