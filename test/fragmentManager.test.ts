import * as assert from 'assert';

import { ExtensionContext } from 'vscode';
import { CodeFragmentCollection, CodeFragmentHeader, FragmentManager } from '../src/fragmentManager';
import { DummyExtensionContext } from './dummyExtensionContext';

suite('FragmentManager tests', () => {
    test('The first initialize creates an example fragment', async () => {
        const ctx = new DummyExtensionContext();
        const sut = new FragmentManager(ctx);

        await sut.initialize();

        const fragments = sut.getAll();
        assert.equal(fragments.length, 1);
        assert.equal(fragments[0].label, 'Example fragment');
    });

    test('Initialize does not override existing fragments', () => {
        const ctx = new DummyExtensionContext(
            new CodeFragmentCollection([new CodeFragmentHeader('abc', 'Custom fragment')])
        );
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => {
                const fragments = sut.getAll();
                assert.equal(fragments.length, 1);
                assert.equal(fragments[0].id, 'abc');
                assert.equal(fragments[0].label, 'Custom fragment');
            });
    });

    test('saveNewCodeFragment creates new fragment', () => {
        const ctx = new DummyExtensionContext();
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.saveNewCodeFragment('TestContent', 'TestLabel'))
            .then(() => {
                const fragments = sut.getAll();
                assert.equal(fragments.length, 2);
                assert.equal(fragments[1].label, 'TestLabel');
            });
    });

    test('getFragmentContent returns the content', () => {
        const ctx = new DummyExtensionContext();
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.saveNewCodeFragment('TestContent', 'TestLabel'))
            .then(id => {
                const content = sut.getFragmentContent(id);
                assert.equal(content.content, 'TestContent');
                assert.equal(content.id, id);
            });
    });

    test('deleteFragment deletes header and content', () => {
        const ctx = new DummyExtensionContext();
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.saveNewCodeFragment('TestContent', 'TestLabel'))
            .then(id => sut.deleteFragment(id).then(() => id))
            .then(id => {
                const fragments = sut.getAll();
                assert.equal(fragments.length, 1);
                assert.equal(fragments.some(f => f.label === 'TestLabel') , false);

                const content = sut.getFragmentContent(id);
                assert.equal(content, undefined);
            });
    });

    test('renameFragment changes the label', () => {
        const ctx = new DummyExtensionContext();
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.saveNewCodeFragment('TestContent', 'TestLabel'))
            .then(id => sut.renameFragment(id, 'ChangedLabel').then(() => id))
            .then(id => {
                const fragments = sut.getAll();
                const renamed = fragments.find(f => f.id === id);

                assert.equal(renamed.label, 'ChangedLabel');
            });
    });

    test('getAllWithContent returns all fragments with content', () => {
        const ctx = new DummyExtensionContext();
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.saveNewCodeFragment('TestContent', 'TestLabel'))
            .then(id => {
                const all = sut.getAllWithContent();
                assert.equal(all[0][0].label, 'Example fragment');

                assert.equal(all[1][0].id, id);
                assert.equal(all[1][0].label, 'TestLabel');
                assert.equal(all[1][1].id, id);
                assert.equal(all[1][1].content, 'TestContent');
            });
    });

    test('deleteAllFragments deletes all fragments', () => {
        const ctx = new DummyExtensionContext();
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.saveNewCodeFragment('TestContent', 'TestLabel'))
            .then(id => sut.deleteAllFragments().then(() => id))
            .then(id => {
                const all = sut.getAll();

                assert.equal(all.length, 0);
                assert.equal(sut.getFragmentContent(id), undefined);
            });
    });

    test('moveUpCodeFragment does not change order if at top', () => {
        const ctx = new DummyExtensionContext(
            new CodeFragmentCollection([
                new CodeFragmentHeader('f1', ''),
                new CodeFragmentHeader('f2', ''),
                new CodeFragmentHeader('f3', ''),
            ])
        );
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.moveUpCodeFragment('f1'))
            .then(() => {
                const fragmentIds = sut.getAll().map(f => f.id);
                assert.deepEqual(fragmentIds, ['f1', 'f2', 'f3']);
            });
    });

    test('moveUpCodeFragment moves fragment up', () => {
        const ctx = new DummyExtensionContext(
            new CodeFragmentCollection([
                new CodeFragmentHeader('f1', ''),
                new CodeFragmentHeader('f2', ''),
                new CodeFragmentHeader('f3', ''),
            ])
        );
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.moveUpCodeFragment('f2'))
            .then(() => {
                const fragmentIds = sut.getAll().map(f => f.id);
                assert.deepEqual(fragmentIds, ['f2', 'f1', 'f3']);
            });
    });

    test('moveDownCodeFragment does not change order if at bottom', () => {
        const ctx = new DummyExtensionContext(
            new CodeFragmentCollection([
                new CodeFragmentHeader('f1', ''),
                new CodeFragmentHeader('f2', ''),
                new CodeFragmentHeader('f3', ''),
            ])
        );
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.moveDownCodeFragment('f3'))
            .then(() => {
                const fragmentIds = sut.getAll().map(f => f.id);
                assert.deepEqual(fragmentIds, ['f1', 'f2', 'f3']);
            });
    });

    test('moveDownCodeFragment moves fragment down', () => {
        const ctx = new DummyExtensionContext(
            new CodeFragmentCollection([
                new CodeFragmentHeader('f1', ''),
                new CodeFragmentHeader('f2', ''),
                new CodeFragmentHeader('f3', ''),
            ])
        );
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.moveDownCodeFragment('f2'))
            .then(() => {
                const fragmentIds = sut.getAll().map(f => f.id);
                assert.deepEqual(fragmentIds, ['f1', 'f3', 'f2']);
            });
    });

    test('moveToTopCodeFragment does not change order if at top', () => {
        const ctx = new DummyExtensionContext(
            new CodeFragmentCollection([
                new CodeFragmentHeader('f1', ''),
                new CodeFragmentHeader('f2', ''),
                new CodeFragmentHeader('f3', ''),
            ])
        );
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.moveToTopCodeFragment('f1'))
            .then(() => {
                const fragmentIds = sut.getAll().map(f => f.id);
                assert.deepEqual(fragmentIds, ['f1', 'f2', 'f3']);
            });
    });

    test('moveToTopCodeFragment moves fragment to top', () => {
        const ctx = new DummyExtensionContext(
            new CodeFragmentCollection([
                new CodeFragmentHeader('f1', ''),
                new CodeFragmentHeader('f2', ''),
                new CodeFragmentHeader('f3', ''),
            ])
        );
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.moveToTopCodeFragment('f3'))
            .then(() => {
                const fragmentIds = sut.getAll().map(f => f.id);
                assert.deepEqual(fragmentIds, ['f3', 'f1', 'f2']);
            });
    });

    test('moveToBottomCodeFragment does not change order if at bottom', () => {
        const ctx = new DummyExtensionContext(
            new CodeFragmentCollection([
                new CodeFragmentHeader('f1', ''),
                new CodeFragmentHeader('f2', ''),
                new CodeFragmentHeader('f3', ''),
            ])
        );
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.moveToBottomCodeFragment('f3'))
            .then(() => {
                const fragmentIds = sut.getAll().map(f => f.id);
                assert.deepEqual(fragmentIds, ['f1', 'f2', 'f3']);
            });
    });

    test('moveToBottomCodeFragment moves fragment to bottom', () => {
        const ctx = new DummyExtensionContext(
            new CodeFragmentCollection([
                new CodeFragmentHeader('f1', ''),
                new CodeFragmentHeader('f2', ''),
                new CodeFragmentHeader('f3', ''),
            ])
        );
        const sut = new FragmentManager(ctx);

        return sut.initialize()
            .then(() => sut.moveToBottomCodeFragment('f1'))
            .then(() => {
                const fragmentIds = sut.getAll().map(f => f.id);
                assert.deepEqual(fragmentIds, ['f2', 'f3', 'f1']);
            });
    });
});
