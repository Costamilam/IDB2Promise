export interface RequestEvent<Type> extends Event {

    srcElement: IDBRequest<Type>;

    target: IDBRequest<Type>;

}
