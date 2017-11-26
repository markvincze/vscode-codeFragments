import * as vscode from 'vscode';

class CodeFragmentHeader {
  constructor(
    public readonly id: string,
    public label: string
  ) { }
}

class CodeFragmentCollection {
  constructor(
    public readonly fragments: CodeFragmentHeader[]
  ) { }
}

class CodeFragmentContent {
  constructor(
    public readonly id: string,
    public readonly content: string
  ) { }
}

export class CodeFragment extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command: vscode.Command,
  ) {
    super(label, collapsibleState);
  }
}

export class CodeFragmentProvider implements vscode.TreeDataProvider<CodeFragment> {
  private onDidChangeTreeDataEmitter: vscode.EventEmitter<CodeFragment | undefined> =
    new vscode.EventEmitter<CodeFragment | undefined>();
  public readonly onDidChangeTreeData: vscode.Event<CodeFragment | undefined> = this.onDidChangeTreeDataEmitter.event;

  private codeFragments: CodeFragmentCollection = undefined;

  constructor(
    private readonly extensionContext: vscode.ExtensionContext
  ) { }

  public getTreeItem(element: CodeFragment): vscode.TreeItem {
    return element;
  }

  public initialize(): Thenable<void> {
    this.codeFragments = this.extensionContext.globalState.get('CodeFragmentCollection');

    if (this.codeFragments) {
      return Promise.resolve();
    }

    const exampleFragmentContent =
      `// This is an example fragment.
// Save a new fragment with the "Save selection as Code Fragment" command.
function foo() {
  alert('Thank you for using the Code Fragments extension!');
}`;

    const exampleFragmentId = this.saveCodeFragmentContent(exampleFragmentContent);

    this.codeFragments = new CodeFragmentCollection([
      new CodeFragmentHeader(
        exampleFragmentId,
        'Example fragment'
      )
    ]);

    return this.extensionContext.globalState.update(
      'CodeFragmentCollection',
      this.codeFragments
    );
  }

  public getChildren(element?: CodeFragment): Thenable<CodeFragment[]> {
    return new Promise(resolve => {
      resolve(
        this.codeFragments.fragments.map(f =>
          new CodeFragment(
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

  public getFragmentContent(id: string): string {
    const fragmentContent = this.extensionContext.globalState.get<CodeFragmentContent>(id);

    if (fragmentContent) {
      return fragmentContent.content;
    }

    return '';
  }

  public saveNewCodeFragment(content: string): Thenable<void> {
    const id = this.saveCodeFragmentContent(content);

    const header = new CodeFragmentHeader(
      id,
      content.substr(0, 100)
    );

    this.codeFragments.fragments.push(header);

    this.onDidChangeTreeDataEmitter.fire();

    return this.persistCodeFragmentCollection();
  }

  public deleteFragment(fragmentId: string): Thenable<void> {
    this.extensionContext.globalState.update(fragmentId, undefined);

    const fragmentToDelete = this.codeFragments.fragments.findIndex(f => f.id === fragmentId);

    if (fragmentToDelete !== -1) {
      this.codeFragments.fragments.splice(fragmentToDelete, 1);

      this.onDidChangeTreeDataEmitter.fire();

      return this.persistCodeFragmentCollection();
    }

    return Promise.resolve();
  }

  public renameFragment(fragmentId: string, newLabel: string): Thenable<void> {
    const fragment = this.codeFragments.fragments.find(f => f.id === fragmentId);

    if (fragment) {
      fragment.label = newLabel;

      this.onDidChangeTreeDataEmitter.fire();

      return this.persistCodeFragmentCollection();
    }

    return Promise.resolve();
  }

  public moveUpCodeFragment(id: string): Thenable<void> {
    return this.executeMove(
      id,
      index => {
        if (index > 0) {
          this.codeFragments.fragments.splice(
            index - 1,
            0,
            this.codeFragments.fragments.splice(index, 1)[0]
          );

          return true;
        }

        return false;
      }
    );
  }

  public moveDownCodeFragment(id: string) {
    return this.executeMove(
      id,
      index => {
        if (index > -1 && index < this.codeFragments.fragments.length - 1) {
          this.codeFragments.fragments.splice(
            index + 1,
            0,
            this.codeFragments.fragments.splice(index, 1)[0]
          );

          return true;
        }

        return false;
      }
    );
  }

  public moveToTopCodeFragment(id: string) {
    return this.executeMove(
      id,
      index => {
        if (index > 0) {
          this.codeFragments.fragments.splice(
            0,
            0,
            this.codeFragments.fragments.splice(index, 1)[0]
          );

          return true;
        }

        return false;
      }
    );
  }

  public moveToBottomCodeFragment(id: string) {
    return this.executeMove(
      id,
      index => {
        if (index > -1 && index < this.codeFragments.fragments.length - 1) {
          this.codeFragments.fragments.splice(
            this.codeFragments.fragments.length - 1,
            0,
            this.codeFragments.fragments.splice(index, 1)[0]
          );

          return true;
        }

        return false;
      }
    );
  }

  private executeMove(id: string, moveOperation: (index: number) => boolean): Thenable<void> {
    const index = this.codeFragments.fragments.findIndex(f => f.id === id);

    if (moveOperation(index)) {
      this.onDidChangeTreeDataEmitter.fire();
      return this.persistCodeFragmentCollection();
    }

    return Promise.resolve();
  }

  private saveCodeFragmentContent(content: string): string {
    const id = 'CodeFragmentContent' + this.generateId();

    this.extensionContext.globalState.update(
      id,
      new CodeFragmentContent(
        id,
        content
      )
    );

    return id;
  }

  private persistCodeFragmentCollection(): Thenable<void> {
    return this.extensionContext.globalState.update(
      'CodeFragmentCollection',
      this.codeFragments
    );
  }

  private generateId(): string {
    return Math.floor((1 + Math.random()) * 0x1000000000000).toString();
  }
}
