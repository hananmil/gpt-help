import { commands, ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { GPTHelpPanel } from "./panels/GPTHelpPanel";
import assisie from "./services/assisie";
import { ServiceConnectionSocket } from "./services/socket";
import { stat } from "fs";

export async function activate(context: ExtensionContext): Promise<void> {
  const credentials = await assisie.verifyLogin(context);
  vscode.window.showInformationMessage(`${credentials.given_name} you are now logged in to Assisie!`);
  const outputChannel = vscode.window.createOutputChannel("Assisie");

  const socket = new ServiceConnectionSocket(credentials);

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 30);
  statusBarItem.text = "Assisie";
  statusBarItem.color = "gray";
  statusBarItem.show();
  setupEvents(socket, outputChannel, statusBarItem);
  socket.connect();

  // Create the show GPT help command
  const showChat = commands.registerCommand("gpt-help.chat", () => {
    GPTHelpPanel.render(context.extensionUri, socket);
  });
  addDisposable(context, showChat);
  addDisposable(context, outputChannel);
  addDisposable(context, statusBarItem);
  GPTHelpPanel.render(context.extensionUri, socket);

  console.log('Congratulations, your extension "gpt-help-extension" is now active!');
}

//a function to add disposable to execution context
function addDisposable(context: ExtensionContext, disposable: { dispose(): any }) {
  context.subscriptions.push(disposable);
}

function setupEvents(
  socket: ServiceConnectionSocket,
  outputChannel: vscode.OutputChannel,
  statusBarItem: vscode.StatusBarItem
) {
  socket.onConnected(() => {
    outputChannel.appendLine("Connected to Assisie");
    statusBarItem.color = "green";
    statusBarItem.text = "Assisie: Connected";
  });
  socket.onDropped(() => {
    outputChannel.appendLine("Disconnected from Assisie");
    statusBarItem.color = "red";
    statusBarItem.text = "Assisie: Disconnected";
  });
  socket.onReady(() => {
    outputChannel.appendLine("Assisie is ready");
    statusBarItem.color = "green";
    statusBarItem.text = "Assisie: Ready";
  });
  socket.onBusy(() => {
    outputChannel.appendLine("Assisie is busy");
    statusBarItem.color = "yellow";
    statusBarItem.text = "Assisie: Busy";
  });
}
