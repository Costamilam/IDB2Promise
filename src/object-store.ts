import { Transaction } from './transaction';
import { toPromise, toAsyncGenerator } from './utils/request-converter';
import { IndexDefinition } from './intefaces/index-definition';

export abstract class ObjectStore<Type = any> {

    abstract readonly databaseName?: string;

    abstract readonly objectStoreName: string;

    abstract readonly objectStoreOptions?: IDBObjectStoreParameters;

    abstract indexes?: IndexDefinition[];

    private transaction: Transaction = null;

    constructor() { }

    async count(): Promise<number> {
        const storage = await this.getTransaction('readonly') as IDBObjectStore;

        return toPromise<number>(storage.count());
    }

    async get(key: string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey | IDBKeyRange): Promise<Type> {
        const storage = await this.getTransaction('readonly') as IDBObjectStore;

        return toPromise<Type>(storage.get(key));
    }

    async getAll(query?: string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey | IDBKeyRange, count?: number): Promise<Type[]> {
        const storage = await this.getTransaction('readonly') as IDBObjectStore;

        return toPromise<Type[]>(storage.getAll(query, count));
    }

    async getAllKeys(query?: string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey | IDBKeyRange, count?: number): Promise<IDBValidKey[]> {
        const storage = await this.getTransaction('readonly') as IDBObjectStore;

        return toPromise<IDBValidKey[]>(storage.getAllKeys(query, count));
    }

    async getKey(query: IDBValidKey | IDBKeyRange): Promise<IDBValidKey> {
        const storage = await this.getTransaction('readonly') as IDBObjectStore;

        return toPromise<IDBValidKey>(storage.getKey(query));
    }

    iterate(range?: IDBValidKey | IDBKeyRange, direction?: IDBCursorDirection, readableOnly: boolean = false): AsyncGenerator<IDBCursorWithValue & { value: Type }, void, void> {
        const request = (this.getTransaction(readableOnly ? 'readonly' : 'readwrite') as Promise<IDBObjectStore>)
            .then(storage => storage.openCursor(range, direction))

        return toAsyncGenerator(request);
    }

    iterateKeys(query?: IDBValidKey | IDBKeyRange, direction?: IDBCursorDirection): AsyncGenerator<IDBCursor, void, void> {
        const request = (this.getTransaction('readonly') as Promise<IDBObjectStore>)
            .then(storage => storage.openKeyCursor(query, direction));

        return toAsyncGenerator(request);
    }

    async add(data: any, key?: IDBValidKey): Promise<IDBValidKey> {
        const storage = await this.getTransaction('readwrite') as IDBObjectStore;

        return toPromise<IDBValidKey>(storage.add(data, key));
    }

    async put(data: any, key?: IDBValidKey): Promise<IDBValidKey> {
        const storage = await this.getTransaction('readwrite') as IDBObjectStore;

        return toPromise<IDBValidKey>(storage.put(JSON.parse(JSON.stringify(data)), key));
    }

    async delete(key: string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey | IDBKeyRange): Promise<void> {
        const storage = await this.getTransaction('readwrite') as IDBObjectStore;

        return toPromise<void>(storage.delete(key));
    }

    async clear(): Promise<void> {
        const storage = await this.getTransaction('readwrite') as IDBObjectStore;

        return toPromise<void>(storage.clear());
    }

    async index(name: string): Promise<IDBIndex> {
        const storage = await this.getTransaction('readonly') as IDBObjectStore;

        return toPromise<IDBIndex>(storage.index(name));
    }

    async indexNames(): Promise<string[]> {
        const storage = await this.getTransaction('readonly') as IDBObjectStore;

        return toPromise<string[]>(Array.from(storage.indexNames));
    }

    protected updateDB(): Promise<void> {
        return this.getTransaction('versionchange') as Promise<void>;
    }

    private getTransaction(mode: IDBTransactionMode): Promise<IDBObjectStore | void> {
        if (!this.transaction) {
            const databaseName = 'databaseName' in this ? this.databaseName : 'AppDatabase';

            this.transaction = new Transaction(databaseName, this.objectStoreName, this.objectStoreOptions, this.indexes);
        }

        switch (mode) {
            case 'readonly':
                return this.transaction.getReadOnly();

            case 'readwrite':
                return this.transaction.getReadWrite();

            case 'versionchange':
                return this.transaction.updateDB();
        }
    }

}
