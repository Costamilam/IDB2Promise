import { DemoOneObjectStore } from './demo-one-object-store';
import { DemoOne } from './demo-one';

describe('Custum Functions:', () => {
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

    it('findFirst', async () => {
        const item = await storage.findFirst({ foo: 'baz' });

        expect(item).toEqual({ ...data[1] });
    });

    it('find', async () => {
        let length = 0;

        for await (const item of storage.find((data) => data.foo.startsWith('ba'))) {
            expect(item).toEqual({ ...data[length] });

            length++;
        }

        expect(length).toEqual(2);
    });

    it('updateFirst', async () => {
        const changed = new DemoOne('bar (updated)');

        await storage.updateFirst({ bar: 'bar' }, changed);

        for (let i = 0; i < data.length; i++)
            if (i === 0)
                expect((await storage.get(i)).foo).toEqual(changed.foo);
            else
                expect((await storage.get(i)).foo).not.toEqual(changed.foo);
    });

    it('update', async () => {
        const change = (data: DemoOne) => new DemoOne(`${data.foo} (updated)`);

        await storage.update({ bar: 'bar' }, change);

        for (let i = 0; i < data.length; i++)
            expect(await storage.get(i)).toEqual({ ...change(data[i]) });
    });

    it('excludeFirst', async () => {
        await storage.excludeFirst({ foo: 'qux' });

        expect(await storage.count()).toEqual(data.length - 1);
    });

    it('exclude', async () => {
        await storage.exclude({ bar: 'bar' });

        expect(await storage.count()).toEqual(0);
    });
});
