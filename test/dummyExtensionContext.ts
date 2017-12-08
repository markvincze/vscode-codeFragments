import * as vscode from 'vscode';
import { CodeFragmentCollection } from '../src/fragmentManager';

class DummyMemento implements vscode.Memento {
    public get<T>(key: string): T;
    // tslint:disable-next-line:unified-signatures
    public get<T>(key: string, defaultValue: T): T;
    public get(key: any, defaultValue?: any) {
        const result = this[key];

        if (typeof result !== 'undefined') {
            return result;
        }

        return defaultValue;
    }

    // An additional update function for testing purposes, which communicates that it's not really an asynchronous operation.
    public updateSync(key: string, value: any): void {
        this[key] = value;
    }

    public update(key: string, value: any): Thenable<void> {
        this[key] = value;
        return Promise.resolve();
    }
}

export class DummyExtensionContext implements vscode.ExtensionContext {
    constructor(initialFragments?: CodeFragmentCollection) {
        const memento = new DummyMemento();
        memento.updateSync('CodeFragmentCollection', initialFragments);

        this.globalState = memento;
    }

    public subscriptions: Array<{ dispose(): any; }>;
    public workspaceState: vscode.Memento;
    public globalState: vscode.Memento;
    public extensionPath: string;
    public asAbsolutePath(relativePath: string): string {
        throw new Error('Method not implemented.');
    }
    public storagePath: string;
}
