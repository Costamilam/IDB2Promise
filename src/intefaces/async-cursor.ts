export interface AsyncCursor {

    new(request: Promise<IDBRequest<IDBCursor>>): AsyncCursor;

    then(callblack: Function): AsyncCursor;

    catch(callblack: Function): AsyncCursor;

    finally(callblack: Function): AsyncCursor;

}
