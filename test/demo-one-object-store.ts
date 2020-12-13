import { ObjectStore, IndexDefinition } from '../src/idb2promise';
import { DemoOne } from './demo-one';

export class DemoOneObjectStore extends ObjectStore<DemoOne> {

    readonly databaseName: string = 'DemoDatabase';

    readonly objectStoreName: string = 'DemoOne';

    readonly objectStoreOptions: IDBObjectStoreParameters = { autoIncrement: true };

    indexes: IndexDefinition[] = [{
        name: 'byFoo',
        keyPath: 'foo'
    }];

    constructor() {
        super();
    }

    updateDB() {
        return super.updateDB();
    }

}
