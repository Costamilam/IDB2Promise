import { IndexDefinition } from './intefaces/index-definition';
import { Connection } from './connection';
import { ConnectionsManager } from './connections-manager';

export class Transaction {

    private connection: Connection;

    constructor(
        private readonly databaseName: string,
        private readonly objectStoreName: string,
        private readonly objectStoreOptions?: IDBObjectStoreParameters,
        private indexes?: IndexDefinition[]
    ) {
        this.connection = ConnectionsManager.getInstance().getConnection(this.databaseName);

        this.connection.onUpgradeNeeded((openDBRequest: IDBOpenDBRequest) => {
            const objectStore = openDBRequest.result.objectStoreNames.contains(this.objectStoreName)
                ? openDBRequest.transaction.objectStore(this.objectStoreName)
                : openDBRequest.result.createObjectStore(this.objectStoreName, this.objectStoreOptions);

            if (Array.isArray(this.indexes)) {
                for (const index of Array.from(objectStore.indexNames))
                    if (this.indexes.findIndex(_index => _index.name === index) === -1)
                        objectStore.deleteIndex(index);

                for (const index of this.indexes) {
                    let need = 'none';

                    try {
                        const idbIndex = objectStore.index(index.name);

                        const keyPaths = [
                            typeof idbIndex.keyPath === 'string' ? idbIndex.keyPath : idbIndex.keyPath.join('.'),
                            typeof index.keyPath === 'string' ? index.keyPath : index.keyPath.join('.')
                        ];

                        if (
                            keyPaths[0] !== keyPaths[1] ||
                            idbIndex.unique != (index.options ? index.options.unique : false) ||
                            idbIndex.multiEntry != (index.options ? index.options.multiEntry : false)
                        )
                            need = 'update';
                    } catch (error) {
                        if (error.message === `Failed to execute 'index' on 'IDBObjectStore': The specified index was not found.`)
                            need = 'create';
                    } finally {
                        if (need == 'update') {
                            objectStore.deleteIndex(index.name);

                            need = 'create';
                        }

                        if (need == 'create')
                            objectStore.createIndex(index.name, index.keyPath, index.options);
                    }
                }
            }
        });
    }

    updateDB(): Promise<void> {
        return this.connection.updateDB().then(() => void 0);
    }

    getReadOnly(): Promise<IDBObjectStore> {
        return this.getObjecStore('readonly');
    }

    getReadWrite(): Promise<IDBObjectStore> {
        return this.getObjecStore('readwrite');
    }

    private async getObjecStore(mode?: IDBTransactionMode): Promise<IDBObjectStore> {
        const database = await this.connection.getDatabase();

        return database.objectStoreNames.contains(this.objectStoreName)
            ? database.transaction([this.objectStoreName], mode).objectStore(this.objectStoreName)
            : this.updateDB().then(() => this.getObjecStore(mode));
    }

}
