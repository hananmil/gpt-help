import { commands, ExtensionContext } from "vscode";
import { GPTHelpPanel } from "./panels/GPTHelpPanel";

export function activate(context: ExtensionContext) {
  // Create the show GPT help command
  const showHelloWorldCommand = commands.registerCommand("gpt-help-extention.showHelp", () => {
    GPTHelpPanel.render(context.extensionUri);
  });

  // Add command to the extension context
  addDisposable(context, showHelloWorldCommand);

  GPTHelpPanel.render(context.extensionUri);

  console.log('Congratulations, your extension "gpt-help-extention" is now active!');
}

//a function to add disposable to execution context
function addDisposable(context: ExtensionContext, disposable: { dispose(): any }) {
  context.subscriptions.push(disposable);
}
