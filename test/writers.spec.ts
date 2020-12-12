import { DemoOneObjectStore } from './demo-one-object-store';
import { DemoOne } from './demo-one';

describe('Data Writers:', () => {
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

    it('add', () => {
        return storage.add(new DemoOne('any'))
            .then(async () => {
                expect(await storage.count()).toEqual(data.length + 1);
            });
    });

    it('put', () => {
        const cahnged = new DemoOne('any');

        return storage.put(cahnged, 0)
            .then(async () => {
                expect((await storage.get(0)).foo).toEqual(cahnged.foo);
            });
    });

    it('delete', () => {
        return storage.delete(0)
            .then(async () => {
                expect(await storage.count()).toEqual(data.length - 1);
            });
    });

    it('clear', () => {
        return storage.clear()
            .then(async () => {
                expect(await storage.count()).toEqual(0);
            });
    });
});
