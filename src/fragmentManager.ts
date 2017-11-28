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
    getAll(): Array<[CodeFragmentHeader, CodeFragmentContent]>;
    saveNewCodeFragment(content: string, label?: string): Thenable<void>;
}
