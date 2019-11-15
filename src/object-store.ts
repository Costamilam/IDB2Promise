import { DatabaseConnection } from "./database-connection";

import { Request } from "./util/request";
import { AsyncCursor } from "./util/async-cursor";

export abstract class ObjectStore<Type> extends DatabaseConnection {

    constructor() {
        super();
    }

    count(): Request<number> {
        return new Request<number>(this.getReadableOnly().then(storage => storage.count()));
    }

    get(key: string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey | IDBKeyRange): Request<Type> {
        return new Request<Type>(this.getReadableOnly().then(storage => storage.get(key)));
    }

    getAll(query?: string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey | IDBKeyRange, count?: number): Request<Type[]> {
        return new Request<Type[]>(this.getReadableOnly().then(storage => storage.getAll(query, count)));
    }

    getAllKeys(query?: string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey | IDBKeyRange, count?: number): Request<IDBValidKey[]> {
        return new Request<IDBValidKey[]>(this.getReadableOnly().then(storage => storage.getAllKeys(query, count)));
    }

    getKey(query: IDBValidKey | IDBKeyRange): Request<IDBValidKey> {
        return new Request<IDBValidKey>(this.getReadableOnly().then(storage => storage.getKey(query)));
    }

    iterate(range?: IDBValidKey | IDBKeyRange, direction?: IDBCursorDirection, readableOnly: boolean = false): AsyncCursor {
        return new AsyncCursor(this[readableOnly ? 'getReadableOnly' : 'getReadableAndWritable']().then(storage => storage.openCursor(range, direction)));
    }

    iterateKeys(query?: IDBValidKey | IDBKeyRange, direction?: IDBCursorDirection): AsyncCursor {
        return new AsyncCursor(this.getReadableOnly().then(storage => storage.openKeyCursor(query, direction)));
    }

    add(data: any, key?: IDBValidKey): Request<IDBValidKey> {
        return new Request<IDBValidKey>(this.getReadableAndWritable().then(storage => storage.add(data, key)));
    }

    put(data: any, key?: IDBValidKey): Request<IDBValidKey> {
        return new Request<IDBValidKey>(this.getReadableAndWritable().then(storage => storage.put(JSON.parse(JSON.stringify(data)), key)));
    }

    delete(key: string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey | IDBKeyRange): Request<void> {
        return new Request<void>(this.getReadableAndWritable().then(storage => storage.delete(key)));
    }

    clear(): Request<void> {
        return new Request<void>(this.getReadableAndWritable().then(storage => storage.clear()));
    }

    index(name: string): Request<IDBIndex> {
        return new Request<IDBIndex>(this.getReadableOnly().then(storage => storage.index(name)));
    }

    // getAllIndex(): Promise<IDBIndex[]> {
    //     // const names = await this.getAllIndexNames();

    //     // return Promise.all(
    //     //     this.getAllIndexNames()
    //     //         .then(indexNames => indexNames.map(this.getIndex))
    //     // )

    //     return new Promise((resolve, reject) => {
    //         this.getAllIndexNames()
    //             .then(names => Promise.all(names.map(this.getIndex)).then(resolve).catch(reject));
    //     });
    // }

    getIndexNames(): Request<string[]> {
        return new Request<string[] | DOMStringList>(this.getReadableOnly().then(storage => storage.indexNames))
            .then(list => Array.from(list));
    }

    createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): Request<IDBIndex> {
        return new Request<IDBIndex>(this.getVersionChange().then(storage => storage.createIndex(name, keyPath, options)));
    }

    deleteIndex(name: string): Request<void> {
        return new Request<void>(this.getVersionChange().then(storage => storage.deleteIndex(name)));
    }

}
