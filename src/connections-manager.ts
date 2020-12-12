import { Connection } from "./connection";

export class ConnectionsManager {

    private connections: Connection[] = [];

    private constructor() { }

    static instance = null;

    static getInstance() {
        if (this.instance === null)
            this.instance = new ConnectionsManager();

        return this.instance
    }

    getConnection(name: string): Connection {
        const index = this.connections.findIndex(connections => connections.name === name);

        return index !== -1 ? this.connections[index] : this.createConnection(name);
    }

    private createConnection(name: string): Connection {
        const length = this.connections.push(new Connection(name));

        return this.connections[length - 1];
    }

}
