'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CodeFragmentProvider }  from './codeFragments';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    
    const codeFragmentProvider = new CodeFragmentProvider(context);
    
    vscode.window.registerTreeDataProvider('codeFragments', codeFragmentProvider);

    vscode.commands.registerCommand('insertCodeFragment', () => {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file in the editor to insert a fragment.');
            return;
        }
        
        editor.edit(builder => {
            vscode.window.activeTextEditor.selection
            // builder.insert(new vscode.Position(0, 0), "NEW TEXT FOO BAR");
            builder.insert(editor.selection.start, "NEW TEXT FOO BAR");
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