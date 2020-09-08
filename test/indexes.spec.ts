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

    it('create index', () => {
        storage.indexes.push({
            name: 'byBar',
            keyPath: ['bar']
        });

        return storage.updateDB()
            .then(() => storage.indexNames())
            .then(indexes => expect(indexes).toEqual(jasmine.arrayWithExactContents(storage.indexes.map(index => index.name))));
    });

    it('delete index', () => {
        storage.indexes.pop();

        return storage.updateDB()
            .then(() => storage.indexNames())
            .then(indexes => expect(indexes).toEqual(jasmine.arrayWithExactContents(storage.indexes.map(index => index.name))));
    });
});
