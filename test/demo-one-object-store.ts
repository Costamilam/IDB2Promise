import { ObjectStore } from '../src/test';

import { DemoOne } from './demo-one';

export class DemoOneObjectStore extends ObjectStore<DemoOne> {

    readonly objectStoreName: string = 'DemoOne';

    readonly objectStoreOptions: IDBObjectStoreParameters = { autoIncrement: true };

    readonly dBName: string = 'DemoDatabase';

    constructor() {
        super();
    }

    call<Type = any>(method: string, ...args: any): Type {
        return super[method](...args);
    }

}
