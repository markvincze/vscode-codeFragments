'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CodeFragmentProvider } from './codeFragments';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const codeFragmentProvider = new CodeFragmentProvider(context);

    codeFragmentProvider
        .initialize()
        .then(() => {
            vscode.window.registerTreeDataProvider('codeFragments', codeFragmentProvider);

            vscode.commands.registerCommand('codeFragments.saveSelectedCodeFragment', () => {
                const showNoTextMsg = 
                    () => vscode.window.showInformationMessage('Select a piece of code in the editor to save it as a fragment.');

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    showNoTextMsg();
                    return;
                }

                editor.edit(builder => {
                    const content = editor.document.getText(editor.selection);

                    if(content.length < 1)
                    {
                        showNoTextMsg();
                        return;
                    }

                    codeFragmentProvider.saveNewCodeFragment(content);
                });
            });

            vscode.commands.registerCommand('codeFragments.insertCodeFragment', fragmentId => {
                if(!fragmentId) {
                    vscode.window.showInformationMessage('Insert a code fragment into the editor by clicking on it in the Code Fragments view.');
                }

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('Open a file in the editor to insert a fragment.');
                    return;
                }

                const content = codeFragmentProvider.getFragmentContent(fragmentId);

                editor.edit(builder => {
                    vscode.window.activeTextEditor.selection
                    builder.insert(editor.selection.start, content);
                });
            });
        });

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "hello" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var selection = editor.selection;
        var text = editor.document.getText(selection);

        // Display a message box to the user
        vscode.window.showInformationMessage('Selected characters: ' + text.length);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}