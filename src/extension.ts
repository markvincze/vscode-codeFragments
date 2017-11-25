'use strict';
import * as vscode from 'vscode';
import { CodeFragmentProvider } from './codeFragments';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const codeFragmentProvider = new CodeFragmentProvider(context);

    const saveSelectedCodeFragment = () => {
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
    };

    const insertCodeFragment = fragmentId => {
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
    };

    codeFragmentProvider
        .initialize()
        .then(() => {
            vscode.window.registerTreeDataProvider('codeFragments', codeFragmentProvider);

            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.saveSelectedCodeFragment', saveSelectedCodeFragment));
            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.insertCodeFragment', insertCodeFragment));
        });
}

export function deactivate() { }
