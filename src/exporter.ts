import * as fs from 'fs';
import * as vscode from 'vscode';
import { CodeFragmentContent, CodeFragmentHeader, IFragmentManager } from './fragmentManager';

class PersistedFragment {
    constructor(
        public readonly label: string,
        public readonly content: string
    ) {
    }
}

class ExportFile {
    constructor(
        public readonly codeFragments: PersistedFragment[]
    ) {
    }
}

export enum ImportResult {
    Success,
    NoFragments
}

export class Exporter {
    constructor(
        private readonly manager: IFragmentManager
    ) {
    }

    public export(): Thenable<NodeJS.ErrnoException> {
        return vscode.window.showSaveDialog(
            {
                defaultUri: vscode.Uri.file('codeFragments.json'),
                filters: {
                    'Json files': ['json'],
                    'All files': ['*']
                }
            })
            .then(uri => {
                if (!uri) {
                    return;
                }

                const allFragments = this.manager.getAllWithContent();

                const exportContent = JSON.stringify(
                    new ExportFile(
                        allFragments.map((pair: [CodeFragmentHeader, CodeFragmentContent]) => new PersistedFragment(pair[0].label, pair[1].content)))
                );

                return this.writeFileAsync(uri.fsPath, exportContent);
            });
    }

    public import(): Thenable<ImportResult> {
        return vscode.window.showOpenDialog(
            {
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'Json files': ['json'],
                    'All files': ['*']
                },
            })
            .then(uri => {
                if (uri) {
                    return this.readFileAsync(uri[0].fsPath);
                } else {
                    return;
                }
            })
            .then(data => {
                if (data) {
                    const json: ExportFile = JSON.parse(data);

                    if (json.codeFragments && json.codeFragments.some(f => !!f.content && !!f.label)) {
                        const tasks = json.codeFragments.map(fragment => {
                            this.manager.saveNewCodeFragment(fragment.content, fragment.label);
                        });

                        return Promise.all(tasks).then(() => ImportResult.Success);
                    } else {
                        return ImportResult.NoFragments;
                    }
                } else {
                    // User pressed Cancel or closed the Open File dialog.
                    return ImportResult.Success;
                }
            });
    }

    private readFileAsync(filename: string): Thenable<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }

                resolve(data);
            });
        });
    }

    private writeFileAsync(filename: string, data: any): Thenable<NodeJS.ErrnoException> {
        return new Promise((resolve, reject) => {
            fs.writeFile(filename, data, err => {
                if (err) {
                    reject(err);
                }

                resolve();
            });
        });
    }
}
