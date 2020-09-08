export function toPromise<Type>(request: Type | IDBRequest<Type>): Promise<Type> {
    return new Promise((resolve, reject) => {
        if (request instanceof IDBRequest) {
            request.onsuccess = (event: Event & { target: { result: Type } }) => resolve(event.target.result);

            request.onerror = event => reject(event);
        } else {
            resolve(request);
        }
    });
}

type toRecursivePromiseResult<Type> = Promise<{ cursor: Type, nextPromise: toRecursivePromiseResult<Type> }>

function toRecursivePromise<Type extends (IDBCursor | IDBCursorWithValue)>(request: IDBRequest<Type | null>): toRecursivePromiseResult<Type> {
    return new Promise((resolve, reject) => {
        request.onsuccess = (event: Event & { target: { result: Type } }) => {
            let cursor = event.target.result;

            resolve({ cursor, nextPromise: toRecursivePromise(request) });
        };

        request.onerror = (error) => reject(error);
    });
}

export async function* toAsyncGenerator<Type extends (IDBCursor | IDBCursorWithValue)>(request: Promise<IDBRequest<Type | null>>): AsyncGenerator<Type, null, void> {
    let promise = toRecursivePromise(await request);

    while (true) {
        const { cursor, nextPromise } = await promise;

        promise = nextPromise;

        if (cursor) {
            cursor.continue();

            yield cursor;
        } else {
            return null
        }
    }
}
