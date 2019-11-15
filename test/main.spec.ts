import { ObjectStore, DatabaseConnection } from '../src/test';

import { DemoOneObjectStore } from './demo-one-object-store';

describe('Testenting IndexedDB PendingStorage:', () => {
    const storage = new DemoOneObjectStore();

    it('class return a valid instance of ObjectStore and DatabaseConnection', () => {
        expect(storage instanceof ObjectStore).toEqual(true);

        expect(storage instanceof DatabaseConnection).toEqual(true);
    });

    it('readOnly is a valid instance of IDBObjectStore', async () => {
        const readOnly = await storage.call('getReadableOnly');

        expect(readOnly instanceof IDBObjectStore).toEqual(true);

        expect(readOnly.name).toEqual(storage.objectStoreName);
    });

    it('readWrite is a valid instance of IDBObjectStore', async () => {
        const readWrite = await storage.call('getReadableAndWritable');

        expect(readWrite instanceof IDBObjectStore).toEqual(true);

        expect(readWrite.name).toEqual(storage.objectStoreName);
    });
});
