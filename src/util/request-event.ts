export class RequestEvent<Type> extends Event {

    get srcElement(): IDBRequest<Type> {
        return this.srcElement as unknown as IDBRequest<Type>;
    }

    get target(): IDBRequest<Type> {
        return this.target as unknown as IDBRequest<Type>;
    }

}    
