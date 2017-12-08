import * as vscode from 'vscode';

import { IFragmentManager } from './fragmentManager';

export class CodeFragmentTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command: vscode.Command,
  ) {
    super(label, collapsibleState);
  }
}

export class CodeFragmentProvider implements vscode.TreeDataProvider<CodeFragmentTreeItem> {
  private onDidChangeTreeDataEmitter: vscode.EventEmitter<CodeFragmentTreeItem | undefined> =
    new vscode.EventEmitter<CodeFragmentTreeItem | undefined>();
  public readonly onDidChangeTreeData: vscode.Event<CodeFragmentTreeItem | undefined> = this.onDidChangeTreeDataEmitter.event;

  constructor(
    private readonly fragmentManager: IFragmentManager
  ) {
    fragmentManager.onFragmentsChanged(() => this.onDidChangeTreeDataEmitter.fire());
  }

  public getTreeItem(element: CodeFragmentTreeItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: CodeFragmentTreeItem): Thenable<CodeFragmentTreeItem[]> {
    return new Promise(resolve => {
      resolve(
        this.fragmentManager.getAll().map(f =>
          new CodeFragmentTreeItem(
            f.label,
            f.id,
            vscode.TreeItemCollapsibleState.None,
            {
              arguments: [f.id],
              command: 'codeFragments.insertCodeFragment',
              title: 'Insert Code Fragment',
              tooltip: 'Insert Code Fragment'
            }),
        )
      );
    });
  }
}
