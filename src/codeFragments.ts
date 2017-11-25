import * as vscode from 'vscode';

export class CodeFragmentProvider implements vscode.TreeDataProvider<CodeFragment> {
  constructor(
    private readonly extensionContext: vscode.ExtensionContext
  ) {
  }

  private _onDidChangeTreeData: vscode.EventEmitter<CodeFragment | undefined> = new vscode.EventEmitter<CodeFragment | undefined>();
  readonly onDidChangeTreeData: vscode.Event<CodeFragment | undefined> = this._onDidChangeTreeData.event;

  private codeFragments: CodeFragmentCollection = undefined;

  getTreeItem(element: CodeFragment): vscode.TreeItem {
    return element;
  }

  getChildren(element?: CodeFragment): Thenable<CodeFragment[]> {
    return new Promise(resolve => {
      if (!this.codeFragments) {
        this.codeFragments = this.extensionContext.globalState.get("CodeFragmentCollection");

        if (!this.codeFragments) {
          const exampleFragmentId = this.saveCodeFragmentContent("Example code fragment { } etc foo");

          this.codeFragments = new CodeFragmentCollection([
            new CodeFragmentHeader(
              exampleFragmentId,
              "Example fragment"
            )
          ]);

          this.extensionContext.globalState.update(
            "CodeFragmentCollection",
            this.codeFragments
          );
        }
      }

      resolve(
        this.codeFragments.fragments.map(f =>
          new CodeFragment(f.label, vscode.TreeItemCollapsibleState.None, { command: 'insertCodeFragment', title: 'Insert Code Fragment' }),
        )
      );

      //   [
      //   new CodeFragment('alma', vscode.TreeItemCollapsibleState.None, { command: 'insertCodeFragment', title: 'Insert Code Fragment' }),
      //   // new CodeFragment('narancs', vscode.TreeItemCollapsibleState.None),
      //   // new CodeFragment('dinnye', vscode.TreeItemCollapsibleState.None),
      // ]);
    });
  }

  saveCodeFragmentContent(content: string): string {
    const id = "CodeFragmentContent" + this.generateId();

    this.extensionContext.globalState.update(
      id,
      new CodeFragmentContent(
        id,
        content
      )
    );

    return id;
  }

  generateId(): string {
    return Math.floor((1 + Math.random()) * 0x1000000000000).toString();
  }
}

class CodeFragmentHeader {
  constructor(
    public readonly id: string,
    public readonly label: string
  ) { }
}

class CodeFragmentCollection {
  constructor(
    public readonly fragments: Array<CodeFragmentHeader>
  ) { }
}

class CodeFragmentContent {
  constructor(
    public readonly id: string,
    public readonly content: string
  ) { }
}

class CodeFragment extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command: vscode.Command,
  ) {
    super(label, collapsibleState)
  }
}
