import { DemoOneObjectStore } from './demo-one-object-store';

beforeEach(done => done());

describe('Index Manager:', () => {
    const storage = new DemoOneObjectStore();

    beforeAll(() => {
        return storage.updateDB();
    });

    it('index', async () => {
        const item = await storage.index(storage.indexes[0].name);

        expect(item instanceof IDBIndex).toEqual(true);

        expect(item.keyPath).toEqual(storage.indexes[0].keyPath);
    });

    it('indexNames', async () => {
        const list = await storage.indexNames();

        expect(list).toEqual(jasmine.arrayWithExactContents(storage.indexes.map(index => index.name)));
    });

    it('create index', async () => {
        storage.indexes.push({
            name: 'byBar',
            keyPath: ['bar']
        });

        await storage.updateDB();

        expect(await storage.indexNames()).toEqual(jasmine.arrayWithExactContents(storage.indexes.map(index => index.name)));
    });

    it('delete index', async () => {
        storage.indexes.pop();

        await storage.updateDB();

        expect(await storage.indexNames()).toEqual(jasmine.arrayWithExactContents(storage.indexes.map(index => index.name)));
    });
});
