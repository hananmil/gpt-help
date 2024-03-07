import { commands, ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { GPTHelpPanel } from "./panels/GPTHelpPanel";
import assisie from "./services/assisie";
import { ServiceConnectionSocket } from "./services/socket";

export async function activate(context: ExtensionContext): Promise<void> {
  const credentials = await assisie.verifyLogin(context);
  vscode.window.showInformationMessage(`${credentials.given_name} you are now logged in to Assisie!`);
  const outputChannel = vscode.window.createOutputChannel("Assisie");
  const socket = new ServiceConnectionSocket(credentials, outputChannel);
  socket.connect();

  // Create the show GPT help command
  const showChat = commands.registerCommand("gpt-help.chat", () => {
    GPTHelpPanel.render(context.extensionUri, socket);
  });

  addDisposable(context, showChat);
  addDisposable(context, outputChannel);

  GPTHelpPanel.render(context.extensionUri, socket);

  console.log('Congratulations, your extension "gpt-help-extension" is now active!');
}

//a function to add disposable to execution context
function addDisposable(context: ExtensionContext, disposable: { dispose(): any }) {
  context.subscriptions.push(disposable);
}
