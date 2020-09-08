export interface IndexDefinition {

    name: string;

    keyPath: string | string[];

    options?: IDBIndexParameters;

}