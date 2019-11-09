'use strict';
import * as vscode from 'vscode';
import { CodeFragmentProvider, CodeFragmentTreeItem } from './codeFragmentsTreeItem';
import { Exporter, ImportResult } from './exporter';
import { FragmentManager } from './fragmentManager';

export async function activate(context: vscode.ExtensionContext) {
    const fragmentManager = new FragmentManager(context);
    const codeFragmentProvider = new CodeFragmentProvider(fragmentManager);

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

            const config = vscode.workspace.getConfiguration('codeFragments');

            const defaultLabel = content.substr(0, 100);

            if (config.get('askForNameOnCreate')) {
                const opt: vscode.InputBoxOptions = {
                    ignoreFocusOut: false,
                    placeHolder: 'Code Fragment Name',
                    prompt: 'Give the fragment a name...',
                    value: defaultLabel
                };

                vscode.window.showInputBox(opt)
                    .then(label => {
                        fragmentManager.saveNewCodeFragment(content, label);
                    });
            } else {
                fragmentManager.saveNewCodeFragment(content, defaultLabel);
            }
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

        const content = fragmentManager.getFragmentContent(fragmentId);

        if (content) {
            editor.edit(builder => {
                builder.insert(editor.selection.start, content.content);
            });
        }
    };

    const deleteCodeFragment = (fragment?: CodeFragmentTreeItem) => {
        if (!fragment) {
            vscode.window.showInformationMessage(
                'Delete a fragment by right clicking on it in the list and selecting "Delete Code Fragment".');
        }

        fragmentManager.deleteFragment(fragment.id);
    };

    const renameCodeFragment = async (fragment?: CodeFragmentTreeItem) => {
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

        const newName = await vscode.window.showInputBox(opt);

        if (newName) {
            return fragmentManager.renameFragment(fragment.id, newName);
        }
    };

    const moveUpCodeFragment = (fragment?: CodeFragmentTreeItem) => {
        if (fragment) {
            fragmentManager.moveUpCodeFragment(fragment.id);
        }
    };

    const moveDownCodeFragment = (fragment?: CodeFragmentTreeItem) => {
        if (fragment) {
            fragmentManager.moveDownCodeFragment(fragment.id);
        }
    };

    const moveToTopCodeFragment = (fragment?: CodeFragmentTreeItem) => {
        if (fragment) {
            fragmentManager.moveToTopCodeFragment(fragment.id);
        }
    };

    const moveToBottomCodeFragment = (fragment?: CodeFragmentTreeItem) => {
        if (fragment) {
            fragmentManager.moveToBottomCodeFragment(fragment.id);
        }
    };

    const exportFragments = async () => {
        const exporter = new Exporter(fragmentManager);

        try {
            await exporter.export();
        } catch (error) {
            await vscode.window.showErrorMessage(error.message);
        }
    };

    const importFragments = async () => {
        const exporter = new Exporter(fragmentManager);

        try {
            const result = await exporter.import();

            if (result === ImportResult.NoFragments) {
                vscode.window.showInformationMessage('No fragments were found in the selected file.');
            }
        } catch (error) {
            await vscode.window.showErrorMessage(error);
        }
    };

    const deleteAllFragments = async () => {
        const exporter = new Exporter(fragmentManager);

        const action = await vscode.window.showWarningMessage(
            'All code fragments will be deleted, and there is no way to undo. Are you sure?',
            { modal: true, },
            'Delete');

        if (action === 'Delete') {
            try {
                await fragmentManager.deleteAllFragments();
            } catch (error) {
                await vscode.window.showErrorMessage(error);
            }
        }
    };

    await fragmentManager.initialize();

    vscode.window.registerTreeDataProvider('codeFragments', codeFragmentProvider);

    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.saveSelectedCodeFragment', saveSelectedCodeFragment));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.insertCodeFragment', insertCodeFragment));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.deleteCodeFragment', deleteCodeFragment));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.renameCodeFragment', renameCodeFragment));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.moveUpCodeFragment', moveUpCodeFragment));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.moveDownCodeFragment', moveDownCodeFragment));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.moveToTopCodeFragment', moveToTopCodeFragment));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.moveToBottomCodeFragment', moveToBottomCodeFragment));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.exportFragments', exportFragments));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.importFragments', importFragments));
    context.subscriptions.push(vscode.commands.registerCommand('codeFragments.deleteAllFragments', deleteAllFragments));
}

export function deactivate() { }
