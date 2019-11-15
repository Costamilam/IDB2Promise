import { DemoOneObjectStore } from './demo-one-object-store';

import { DemoOne } from './demo-one';
import { AsyncCursor } from '../src/test';

describe('Testenting IndexedDB PendingStorage:', () => {
    const storage = new DemoOneObjectStore();

    let data: DemoOne[] = [];

    beforeEach(() => {
        storage.clear();

        data = [
            new DemoOne('bar'),
            new DemoOne('baz'),
            new DemoOne('qux')
        ];

        return Promise.all(data.map(storage.add.bind(storage)));
    });

    it('count method return pending list length', async () => {
        expect(await storage.count()).toEqual(data.length);
    });

    it('get method return a valid and complete pending item', async () => {
        const item = await storage.get(0);

        expect(JSON.stringify(item)).toEqual(JSON.stringify(data[0]));
    });

    it('getAll method return a valid and complete pending list', async () => {
        const all = await storage.getAll();

        expect(all instanceof Array).toEqual(true);

        expect(all.length).toEqual(data.length);

        for (let i = 0; i < all.length; i++) {
            expect(JSON.stringify(all[i])).toEqual(JSON.stringify(data[i]));
        }
    });

    it('getKey method return a valid pending key', async () => {
        const key = await storage.getKey(0);

        expect(key).toEqual(0);
    });

    it('getAllKeys method return a valid and complete pending key list', async () => {
        const all = await storage.getAllKeys();

        expect(all instanceof Array).toEqual(true);

        expect(all.length).toEqual(data.length);

        for (let i = 0; i < all.length; i++) {
            expect(all[i]).toEqual(i);
        }
    });

    it('iterator method return a valid and complete pending iterator', done => {
        let length = 0;

        const iterator = storage.iterate();

        iterator
            .each(item => expect(JSON.stringify(item.value)).toEqual(JSON.stringify(data[length])))
            .each(() => length++)
            .finally(() => expect(length).toEqual(data.length))
            .finally(done);

        expect(iterator instanceof AsyncCursor).toEqual(true);
    });

    it('iteratorKeys method return a valid and complete pending key iterator', done => {
        let length = 0;

        const iterator = storage.iterateKeys();

        iterator
            .each(item => expect(item.key).toEqual(length))
            .each(() => length++)
            .finally(() => expect(length).toEqual(data.length))
            .finally(done);

        expect(iterator instanceof AsyncCursor).toEqual(true);
    });
});
