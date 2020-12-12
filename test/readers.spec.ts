import { DemoOneObjectStore } from './demo-one-object-store';
import { DemoOne } from './demo-one';

describe('Data Readers:', () => {
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

    it('count', async () => {
        expect(await storage.count()).toEqual(data.length);
    });

    it('get', async () => {
        const item = await storage.get(0);

        expect(item).toEqual({ ...data[0] });
    });

    it('getAll', async () => {
        const all = await storage.getAll();

        expect(all instanceof Array).toEqual(true);

        expect(all.length).toEqual(data.length);

        for (let i = 0; i < all.length; i++) {
            expect(all[i]).toEqual({ ...data[i] });
        }
    });

    it('getKey', async () => {
        const key = await storage.getKey(0);

        expect(key).toEqual(0);
    });

    it('getAllKeys', async () => {
        const all = await storage.getAllKeys();

        expect(all instanceof Array).toEqual(true);

        expect(all.length).toEqual(data.length);

        for (let i = 0; i < all.length; i++) {
            expect(all[i]).toEqual(i);
        }
    });

    it('iterate', async () => {
        let length = 0;

        for await (const item of storage.iterate()) {
            expect(item.value).toEqual({ ...data[length] });

            length++;
        }

        expect(length).toEqual(data.length);
    });

    it('iterateKeys', async () => {
        let length = 0;

        for await (const item of storage.iterateKeys()) {
            expect(item.key).toEqual(length++);
        }

        expect(length).toEqual(data.length);
    });
});
