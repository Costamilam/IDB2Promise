import { RequestEvent } from './util/request-event';

export abstract class DatabaseConnection {

    abstract readonly objectStoreName: string;

    abstract readonly objectStoreOptions: IDBObjectStoreParameters;

    readonly dBName: string = 'AppDatabase';

    private dBVersion?: number = undefined;

    private dBConnection?: IDBDatabase = null;

    private versionChangeTransaction = Promise.resolve(void 0);

    private versionChangeTransactionResolve: any = () => {};

    constructor() { }

    private async getObjecStore(mode?: IDBTransactionMode): Promise<IDBObjectStore> {
        const database = await this.getDatabase();

        if (database.transaction instanceof IDBTransaction) {
            database.transaction.oncomplete = () => this.versionChangeTransactionResolve()

            return database.transaction.objectStore(this.objectStoreName);
        }

        return database.transaction([this.objectStoreName], mode).objectStore(this.objectStoreName);
    }

    protected getReadableOnly(): Promise<IDBObjectStore> {
        return this.getObjecStore('readonly');
    }

    protected async getReadableAndWritable(): Promise<IDBObjectStore> {
        return this.getObjecStore('readwrite');
    }

    protected async getVersionChange(): Promise<IDBObjectStore> {
        return this.updateDB().then(() => this.getObjecStore());
    }

    protected getDatabase(): Promise<IDBDatabase | IDBOpenDBRequest> {
        const self = this;

        if (self.dBConnection) {
            return self.versionChangeTransaction.then(async () => {
                self.dBVersion = self.dBConnection.version;

                if (!self.dBConnection.objectStoreNames.contains(self.objectStoreName)) {
                    return await self.updateDB().then(self.getDatabase);
                }

                return self.dBConnection;
            });
        }

        return new Promise((resolve, reject) => {
            let request = self.dBVersion && !Number.isNaN(self.dBVersion) ? indexedDB.open(self.dBName, self.dBVersion) : indexedDB.open(self.dBName);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                self.versionChangeTransaction = new Promise(resolve => self.versionChangeTransactionResolve = resolve);

                self.dBConnection = request.result;

                self.dBVersion = self.dBConnection.version;

                if (!self.dBConnection.objectStoreNames.contains(self.objectStoreName)) {
                    self.dBConnection.createObjectStore(self.objectStoreName, self.objectStoreOptions);
                }

                resolve(event.currentTarget as any);
            };

            request.onsuccess = (event: RequestEvent<IDBDatabase>) => {
                self.versionChangeTransaction.then(() => {
                    self.dBConnection = event.target.result;
    
                    self.dBVersion = self.dBConnection.version;
    
                    if (!self.dBConnection.objectStoreNames.contains(self.objectStoreName)) {
                        self.updateDB().then(async () => resolve(await self.getDatabase()));
                    }
    
                    resolve(self.dBConnection);
                });
            };

            request.onerror = event => {
                if (self.dBConnection instanceof IDBDatabase) {
                    self.dBConnection.close();

                    self.dBConnection = null;
                }

                reject(event);
            };
        });
    }

    private updateDB(): Promise<void> {
        if (this.dBConnection instanceof IDBDatabase) {
            this.dBVersion = this.dBConnection.version + 1;

            this.dBConnection.close();

            this.dBConnection = null;

            return Promise.resolve(void 0);
        }

        if (this.dBVersion) {
            this.dBVersion++;

            return Promise.resolve(void 0);
        }

        return this.getDatabase().then(database => {
            this.dBVersion = this.dBConnection.version + 1;

            this.dBConnection.close();

            this.dBConnection = null;

            return void 0;
        });
    }

}
