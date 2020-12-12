export function toPromise<T>(request: T | IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        if (request instanceof IDBRequest) {
            request.onsuccess = (event: Event & { target: { result: T } }) => resolve(event.target.result);

            request.onerror = event => reject(event);
        } else {
            resolve(request);
        }
    });
}

type toRecursivePromiseResult<T> = Promise<{ cursor: T, nextPromise: toRecursivePromiseResult<T> }>

function toRecursivePromise<T extends (IDBCursor | IDBCursorWithValue)>(request: IDBRequest<T | null>): toRecursivePromiseResult<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = (event: Event & { target: { result: T } }) => {
            let cursor = event.target.result;

            resolve({ cursor, nextPromise: toRecursivePromise(request) });
        };

        request.onerror = (error) => reject(error);
    });
}

export async function* toAsyncGenerator<T extends (IDBCursor | IDBCursorWithValue)>(request: Promise<IDBRequest<T | null>>): AsyncGenerator<T, null, void> {
    let promise = toRecursivePromise(await request);

    while (true) {
        const { cursor, nextPromise } = await promise;

        promise = nextPromise;

        if (cursor) {
            yield cursor;

            cursor.continue();
        } else {
            return null
        }
    }
}
