export class Connection {

    private version: number;

    private connection: Promise<IDBDatabase>;

    private onUpgradeNeededHandlers: ((target: IDBOpenDBRequest) => void)[] = [];

    constructor(
        public readonly name: string
    ) { }

    onUpgradeNeeded(handler: (target: IDBOpenDBRequest) => void): void {
        this.onUpgradeNeededHandlers.push(handler);
    }

    getDatabase(): Promise<IDBDatabase> {
        if (this.connection) {
            return this.connection;
        }

        this.connection = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);

            request.onupgradeneeded = (event: IDBVersionChangeEvent & { target: IDBOpenDBRequest }) => {
                for (const handler of this.onUpgradeNeededHandlers) {
                    handler(event.target);
                }

                event.target.transaction.oncomplete = () => this.getDatabase().then(resolve);

                this.version = event.target.result.version;
            };

            request.onsuccess = (event: Event & { target: { result: IDBDatabase } }) => {
                this.version = event.target.result.version;

                resolve(event.target.result);
            };

            request.onblocked = (e) => {
                console.log('onblocked')
            }

            request.onerror = event => {
                if (this.connection) {
                    this.connection
                        .then(connection => connection.close())
                        .then(() => this.connection = null);
                }

                reject(event);
            };
        });

        return this.connection;
    }

    updateDB(): Promise<IDBDatabase> {
        return (this.connection || this.getDatabase())
            .then(connection => {
                this.version = connection.version + 1;

                connection.close();
            })
            .then(() => this.connection = null)
            .then(() => this.getDatabase());
    }

}
