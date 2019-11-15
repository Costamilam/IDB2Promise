import { DemoOneObjectStore } from './demo-one-object-store';

import { DemoOne } from './demo-one';

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

    it('add method increment pending list length', () => {
        return storage.add(new DemoOne('any'))
            .then(async () => {
                expect(await storage.count()).toEqual(data.length + 1);
            });
    });

    it('put method change pending list item', () => {
        const cahnged = new DemoOne('any');

        return storage.put(cahnged, 0)
            .then(async () => {
                expect((await storage.get(0)).foo).toEqual(cahnged.foo);
            });
    });

    it('delete method remove pending list item', () => {
        return storage.delete(0)
            .then(async () => {
                expect(await storage.count()).toEqual(data.length - 1);
            });
    });

    it('clear method clean pending list', () => {
        return storage.clear()
            .then(async () => {
                expect(await storage.count()).toEqual(0);
            });
    });
});
