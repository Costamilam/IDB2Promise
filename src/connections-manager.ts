import { Connection } from "./connection";

export class ConnectionsManager {

    private connections: Connection[] = [];

    constructor() { }

    getConnection(name: string): Connection {
        const index = this.connections.findIndex(connections => connections.name === name);

        return index !== -1 ? this.connections[index] : this.createConnection(name);
    }

    private createConnection(name: string): Connection {
        const length = this.connections.push(new Connection(name));

        return this.connections[length - 1];
    }

}
