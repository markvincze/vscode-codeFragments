'use strict';
import * as vscode from 'vscode';
import { CodeFragment, CodeFragmentProvider } from './codeFragments';

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

    const deleteCodeFragment = (fragment?: CodeFragment) => {
        if (!fragment) {
            vscode.window.showInformationMessage(
                'Delete a fragment by right clicking on it in the list and selecting "Delete Code Fragment".');
        }

        codeFragmentProvider.deleteFragment(fragment.id);
    };

    const renameCodeFragment = (fragment?: CodeFragment) => {
        if (!fragment) {
            vscode.window.showInformationMessage(
                'Rename a fragment by right clicking on it in the list and selecting "Rename Code Fragment".');
        }

        const opt: vscode.InputBoxOptions = {
            ignoreFocusOut: false,
            placeHolder: 'Code Fragment Name',
            prompt: 'Rename Code Fragment...',
            value: fragment.label
        };

        vscode.window.showInputBox(opt)
            .then(newName => {
                if (newName) {
                    return codeFragmentProvider.renameFragment(fragment.id, newName);
                }

                return Promise.resolve();
            });
    };

    const moveUpCodeFragment = (fragment?: CodeFragment) => {
        if (fragment) {
            codeFragmentProvider.moveUpCodeFragment(fragment.id);
        }
    };

    const moveDownCodeFragment = (fragment?: CodeFragment) => {
        if (fragment) {
            codeFragmentProvider.moveDownCodeFragment(fragment.id);
        }
    };

    const moveToTopCodeFragment = (fragment?: CodeFragment) => {
        if (fragment) {
            codeFragmentProvider.moveToTopCodeFragment(fragment.id);
        }
    };

    const moveToBottomCodeFragment = (fragment?: CodeFragment) => {
        if (fragment) {
            codeFragmentProvider.moveToBottomCodeFragment(fragment.id);
        }
    };

    codeFragmentProvider
        .initialize()
        .then(() => {
            vscode.window.registerTreeDataProvider('codeFragments', codeFragmentProvider);

            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.saveSelectedCodeFragment', saveSelectedCodeFragment));
            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.insertCodeFragment', insertCodeFragment));
            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.deleteCodeFragment', deleteCodeFragment));
            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.renameCodeFragment', renameCodeFragment));
            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.moveUpCodeFragment', moveUpCodeFragment));
            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.moveDownCodeFragment', moveDownCodeFragment));
            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.moveToTopCodeFragment', moveToTopCodeFragment));
            context.subscriptions.push(vscode.commands.registerCommand('codeFragments.moveToBottomCodeFragment', moveToBottomCodeFragment));
        });
}

export function deactivate() { }
