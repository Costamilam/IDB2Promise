import { RequestEvent } from './request-event';

export class AsyncCursor {

    private errorHandlers: Function[] = [];

    private successHandlers: Function[] = [];

    private finallyHandlers: Function[] = [];

    private successRequestEvent?: RequestEvent<any> = null;

    private errorRequestEvent?: RequestEvent<any> = null;

    // private promiseResolve: Function;

    // private promiseReject: Function;

    constructor(
        protected request: Promise<IDBRequest>
    ) {
        if (request instanceof Function) {
            // new Promise(request as any);
        } else {
            // new Promise((resolve, reject) => {
            //     this.promiseResolve = resolve;
    
            //     this.promiseReject = reject;
            // });

            request.then(request => {
                request.addEventListener('success', this.createListener(this.successHandlers));
    
                request.addEventListener('error', this.createListener(this.errorHandlers));
            });
        }
    }

    private createListener(handlers: Function[]): EventListener {
        const self = this;

        return (event?: RequestEvent<IDBCursor>) => {
            const selfRequestEventName = event.type === 'success' ? 'successRequestEvent' : 'errorRequestEvent';

            if (self[selfRequestEventName] === null) {
                self[selfRequestEventName] = event;
            }

            // self[event.type === 'success' ? 'promiseResolve' : 'promiseReject'](undefined);

            let parameter: any = event.target.result;

            if (parameter) {
                for (const handler of handlers) {
                    parameter = handler.call(parameter, parameter);
                }

                event.target.result.continue();
            } else {
                for (const handler of self.finallyHandlers) {
                    handler.call(undefined);
                }
            }
        }
    }

    each(callblack: Function): AsyncCursor {
        this.successHandlers.push(callblack);

        if (this.successRequestEvent !== null) {
            this.createListener(this.successHandlers)(this.successRequestEvent);
        }

        return this;
    }

    catch(callblack: Function): AsyncCursor {
        this.errorHandlers.push(callblack);

        if (this.errorRequestEvent !== null) {
            this.createListener(this.successHandlers)(this.errorRequestEvent);
        }

        return this;
    }

    finally(callblack: Function): AsyncCursor {
        this.finallyHandlers.push(callblack);

        if (this.successRequestEvent !== null || this.errorRequestEvent !== null) {
            this.createListener([])(undefined);
        }

        return this;
    }

}
