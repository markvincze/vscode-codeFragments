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

export class Exporter {
    constructor(
        private readonly manager: IFragmentManager
    ) {
    }

    public export(): Thenable<NodeJS.ErrnoException> {
        const allFragments = this.manager.getAll();

        const exportContent = JSON.stringify(
            new ExportFile(
                allFragments.map((pair: [CodeFragmentHeader, CodeFragmentContent]) => new PersistedFragment(pair[0].label, pair[1].content)))
        );

        return vscode.window.showSaveDialog(
            {
                defaultUri: vscode.Uri.file('codeFragments.json'),
                filters: {
                    'Json files': ['json'],
                    'All files': ['*.*']
                }
            })
            .then(uri => {
                return this.writeFileAsync(uri.fsPath, exportContent);
            });
    }

    public import(): Thenable<void> {
        return vscode.window.showOpenDialog(
            {
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'Json files': ['json'],
                    'All files': ['*.*']
                },
            })
            .then(uri => {
                return this.readFileAsync(uri[0].fsPath);
            })
            .then(data => {
                const json: ExportFile = JSON.parse(data);

                json.codeFragments.forEach(fragment => {
                    this.manager.saveNewCodeFragment(fragment.content, fragment.label);
                });
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
