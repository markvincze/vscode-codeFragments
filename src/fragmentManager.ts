import * as vscode from 'vscode';

export class CodeFragmentHeader {
  constructor(
    public readonly id: string,
    public label: string
  ) { }
}

export class CodeFragmentCollection {
  constructor(
    public readonly fragments: CodeFragmentHeader[]
  ) { }
}

export class CodeFragmentContent {
  constructor(
    public readonly id: string,
    public readonly content: string
  ) { }
}

export interface IFragmentManager {
  getAll(): CodeFragmentHeader[];
  getAllWithContent(): Array<[CodeFragmentHeader, CodeFragmentContent]>;
  saveNewCodeFragment(content: string, label?: string): Thenable<string>;
  onFragmentsChanged(handler: () => void);
}

export class FragmentManager implements IFragmentManager {
  private codeFragments: CodeFragmentCollection = undefined;
  private readonly fragmentsChangeEvent: Array<() => void> = [];

  constructor(
    private readonly extensionContext: vscode.ExtensionContext
  ) { }

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

  public getFragmentContent(id: string): CodeFragmentContent {
    return this.extensionContext.globalState.get<CodeFragmentContent>(id);
  }

  public async saveNewCodeFragment(content: string, label?: string): Promise<string> {
    const id = this.saveCodeFragmentContent(content);

    const header = new CodeFragmentHeader(
      id,
      label
    );

    this.codeFragments.fragments.push(header);

    this.fireFragmentsChanged();

    await this.persistCodeFragmentCollection();

    return id;
  }

  public async deleteFragment(fragmentId: string): Promise<void> {
    await this.extensionContext.globalState.update(fragmentId, undefined);

    const fragmentToDelete = this.codeFragments.fragments.findIndex(f => f.id === fragmentId);

    if (fragmentToDelete !== -1) {
      this.codeFragments.fragments.splice(fragmentToDelete, 1);

      this.fireFragmentsChanged();

      await this.persistCodeFragmentCollection();
    }
  }

  public renameFragment(fragmentId: string, newLabel: string): Thenable<void> {
    const fragment = this.codeFragments.fragments.find(f => f.id === fragmentId);

    if (fragment) {
      fragment.label = newLabel;

      this.fireFragmentsChanged();

      return this.persistCodeFragmentCollection();
    }

    return Promise.resolve();
  }

  public async deleteAllFragments(): Promise<void> {
    const tasks = this.codeFragments.fragments.map(f => this.extensionContext.globalState.update(f.id, undefined));

    this.codeFragments = new CodeFragmentCollection([]);

    await this.persistCodeFragmentCollection();

    this.fireFragmentsChanged();

    // NOT: The extra Promise is here just to change the type generic type of the Promise from void[] to void.
    await Promise.all(tasks);
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

  public getAll(): CodeFragmentHeader[] {
    return this.codeFragments.fragments;
  }

  public getAllWithContent(): Array<[CodeFragmentHeader, CodeFragmentContent]> {
    const headers = this.codeFragments.fragments;

    return headers.map(h => {
      const pair: [CodeFragmentHeader, CodeFragmentContent] = [h, this.getFragmentContent(h.id)];
      return pair;
    });
  }

  public onFragmentsChanged(handler: () => void) {
    if (handler) {
      this.fragmentsChangeEvent.push(handler);
    }
  }

  private executeMove(id: string, moveOperation: (index: number) => boolean): Thenable<void> {
    const index = this.codeFragments.fragments.findIndex(f => f.id === id);

    if (moveOperation(index)) {
      this.fireFragmentsChanged();
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

  private fireFragmentsChanged() {
    this.fragmentsChangeEvent.forEach(h => h());
  }
}
