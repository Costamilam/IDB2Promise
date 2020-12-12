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

    it('add', async () => {
        await storage.add(new DemoOne('any'));

        expect(await storage.count()).toEqual(data.length + 1);
    });

    it('put', async () => {
        const changed = new DemoOne('any');

        await storage.put(changed, 0);

        expect((await storage.get(0)).foo).toEqual(changed.foo);
    });

    it('delete', async () => {
        await storage.delete(0);

        expect(await storage.count()).toEqual(data.length - 1);
    });

    it('clear', async () => {
        await storage.clear();

        expect(await storage.count()).toEqual(0);
    });
});
