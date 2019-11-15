import { RequestEvent } from "./request-event";

export class Request<Type> extends Promise<Type> {

    constructor(
        request: Promise<IDBRequest<Type> | Type>
    ) {
        super((resolve, reject) => {
            if (request instanceof Function) {
                request(resolve, reject);
            } else {
                request.then(request => {
                    if (request instanceof IDBRequest) {
                        request.onsuccess = (event: RequestEvent<Type>) => resolve(event.target.result);

                        request.onerror = event => reject(event);
                    } else {
                        resolve(request);
                    }
                });
            }
        });
    }

}
