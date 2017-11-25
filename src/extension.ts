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

            let disposable = vscode.commands.registerCommand('codeFragments.saveSelectedCodeFragment', () => {
                const showNoTextMsg = () => vscode.window.showInformationMessage(
                    'Select a piece of code in the editor to save it as a fragment.');

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    showNoTextMsg();
                    return;
                }

                editor.edit(builder => {
                    const content = editor.document.getText(editor.selection);

                    if (content.length < 1) {
                        showNoTextMsg();
                        return;
                    }

                    codeFragmentProvider.saveNewCodeFragment(content);
                });
            });

            context.subscriptions.push(disposable);

            disposable = vscode.commands.registerCommand('codeFragments.insertCodeFragment', fragmentId => {
                if (!fragmentId) {
                    vscode.window.showInformationMessage(
                        'Insert a code fragment into the editor by clicking on it in the Code Fragments view.');
                }

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('Open a file in the editor to insert a fragment.');
                    return;
                }

                const content = codeFragmentProvider.getFragmentContent(fragmentId);

                editor.edit(builder => {
                    builder.insert(editor.selection.start, content);
                });
            });

            context.subscriptions.push(disposable);
        }
    );
}

export function deactivate() { }
