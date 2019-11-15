import { DemoOneObjectStore } from './demo-one-object-store';

describe('Testenting IndexedDB PendingStorage:', () => {
    const storage = new DemoOneObjectStore();

    let index: IDBIndex[] = [];

    beforeEach(async () => {
        const indexNames = await storage.getIndexNames();

        for (const indexName of indexNames) {
            storage.deleteIndex(indexName);
        }

        index.push(
            await storage.createIndex('bar', 'foo'),
            await storage.createIndex('baz', 'foo')
        );
    });

    it('index method return a valid index', async () => {
        const item = await storage.index(index[0].name);

        expect(item instanceof IDBIndex).toEqual(true);

        expect(JSON.stringify(item)).toEqual(JSON.stringify(index[0]));
    });

    it('getIndexNames method return a valid and complete index name list', async () => {
        const list = await storage.getIndexNames();

        expect(list.length).toEqual(index.length);

        for (let i = 0; i < list.length; i++) {
            expect(list[i]).toEqual(index[i].name);
        }
    });

    it('createIndex method increment index name list', () => {
        return storage.createIndex('qux', 'foo')
            .then(async newIndex => {
                const length = (await storage.getIndexNames()).length;

                index.push(newIndex);

                expect(length).toEqual(index.length);
            });
    });

    it('deleteIndex method decrement index name list', () => {
        return storage.deleteIndex(index[0].name)
            .then(async () => {
                const length = (await storage.getIndexNames()).length;

                index = index.filter(item => item.name != index[0].name);

                expect(length).toEqual(index.length);
            });
    });
});
