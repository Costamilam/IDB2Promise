# IDB2Promise

TypeScript library to manage IndexedDB Storage

## Install

```
npm i idb2promise
```

## CDN

```html
<script defer src="https://unpkg.com/idb2promise@<version>/dist/idb2promise.js"></script>
```

Or minified and uglified

```html
<script defer src="https://unpkg.com/idb2promise@<version>/dist/idb2promise.min.js"></script>
```

## Use with TypeScript

```typescript
import { ObjectStore, IndexDefinition } from 'IDB2Promise';

class Example {
    constructor(
        public name: string
    ) { }
}

class ExampleStorage extends ObjectStore<Example> {
    readonly databaseName: string = 'AppDB';

    readonly objectStoreName: string = 'Example';

    readonly objectStoreOptions: IDBObjectStoreParameters = { autoIncrement: true };

    indexes: IndexDefinition[] = [{
        name: 'byName',
        keyPath: 'name'
    }];
}
```

> `databaseName` property is optionally, if is not defined, the default value is `'AppDatabase'`

You can use a base class to set database name:

```typescript
import { ObjectStore } from 'IDB2Promise';
import { ExampleOne, ExampleTwo } from './path/to/models'

abstract class AppStorage<T> extends ObjectStore<T> {
    readonly databaseName: string = 'AppDB';
}

class ExampleStorageOne extends AppStorage<ExampleOne> {
    readonly objectStoreName: string = 'ExampleOne';

    readonly objectStoreOptions: IDBObjectStoreParameters = { autoIncrement: true };
}

class ExampleStorageTwo extends AppStorage<ExampleTwo> {
    readonly objectStoreName: string = 'ExampleTwo';

    readonly objectStoreOptions: IDBObjectStoreParameters = { keyPath: 'name' };
}
```

After you instance the super class of `ObjectStore` and call your functions to manage database (skip next session)

## Use with JavaScript (EcmaScript 5)

Import script

```html
<script defer src="./file/to/idb2promise.js"></script>
```

```javascript
function Example(name) {
    this.name = name;
}

function ExampleStorage() {
    IDB2Promise.ObjectStore.apply(this, arguments);

    this.databaseName = 'AppDB';
    this.objectStoreName = 'Example';
    this.objectStoreOptions = { autoIncrement: true };

    this.indexes = [{
        name: 'byName',
        keyPath: 'name'
    }];
}
ExampleStorage.prototype = Object.create(IDB2Promise.ObjectStore.prototype);
ExampleStorage.prototype.constructor = ExampleStorage;
```

> `databaseName` property is optionally, if is not defined, the default value is `'AppDatabase'`

You can use a base class to set database name:

```javascript
function AppStorage() {
    this.databaseName = 'AppDB';
}
AppStorage.prototype = IDB2Promise.ObjectStore;

function ExampleStorageOne() {
    IDB2Promise.ObjectStore.apply(this, arguments);

    this.objectStoreName = 'ExampleStorageOne';
    this.objectStoreOptions = { autoIncrement: true };
}
ExampleStorageOne.prototype = Object.create(IDB2Promise.ObjectStore.prototype);
ExampleStorageOne.prototype.constructor = ExampleStorageOne;

function ExampleStorageTwo() {
    IDB2Promise.ObjectStore.apply(this, arguments);

    this.objectStoreName = 'ExampleStorageTwo';
    this.objectStoreOptions = { keyPath: 'name' };
}
ExampleStorageTwo.prototype = Object.create(IDB2Promise.ObjectStore.prototype);
ExampleStorageTwo.prototype.constructor = ExampleStorageTwo;
```

After you instance the super class of `ObjectStore` and call your functions to manage database

## ObjecStore API (JavaScript and TypeScript)

First, instance your `ObjectStore` super class

```javascript
var storage = new ExampleStorage();
```

All methods, except iterators, has very semelhance with [native API](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore), the parameters is equal but returns `IDBRequest.result` as a `Promise`

### Indexes manager

The creation, modification and deletion of the index are orchestrated internally, just change the `storage.indexes` property and call` storage.updateDB()` to execute the changes. if `storage.indexes` is an empty array, all indexes will be deleted. if `storage.indexes` is not an array (or is not defined), change checks are ignored and no indexes are created, modified or deleted 

### Indexes methods

```javascript
storage.index(name);
```

The methods in the index don't use Promises, they are the native API

Equivalent of property `IDBObjecStore.indexNames`, but returns as a Promise:

```javascript
storage.indexNames();
```

### Writers methods

```javascript
storage.add(data, key);

storage.put(data, key);

storage.delete(key);

storage.clear();
```

### Readers methods

```javascript
storage.count();

storage.get(key);

storage.getAll(query, count);

storage.getAllKeys(query, count);

storage.getKey(query);
```

### Iterators methods

Equivalent of method `IDBObjecStore.openCursor()`:

```javascript
storage.iterate(range, direction, readableOnly);
```

> `readableOnly` is a boolean, if `true` you can't call writers methods of iterator item. Default is `false`

Equivalent of method `IDBObjecStore.openKeyCursor()`:

```javascript
storage.iterateKeys(query, direction);
```

Two methods return an `AsyncGenerator`, you can use with `for await...of` syntax:

```javascript
for await (const cursor of storage.iterate())
    console.log(cursor);
```

Or recursion and promises:

```javascript
function asyncForeach(iterator, callback) {
    iterator.next().then(function(cursor) {
        if (!cursor.done) {
            callback(cursor.value)

            asyncForeach(iterator, callback);
        }
    });
}

asyncForeach(storage.iterate(), function(cursor) {
    console.log(cursor);
});
```

The methods in the iteration item don't use Promises, they are the native API

### Cutom methods

Methost for manipulating storage using an filter of type [`Partial<T>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype) or an function that receive the item and return an boolean, where `T` is same of `ObjectStore<T>`:

```javascript
/**
 * @constructor
 * @param {string} name
 * @param {boolean} active
*/
function Example(name, active) {
    this.name = name;
    this.active = active;
}

/**
 * @type Partial<Example>
 * Equal to { name?: string, active?: boolean }
*/
var partialFilter = { active: true };

/**
 * @type (data: Example) => boolean
*/
var functionFilter = function(data) {
    return data.active;
};
```

Returns an `AsyncGenerator` with matched items, the same as in the [Iterators methods](#iterators-methods) section:

```javascript
storage.find(filter);
```

Returns the first occurrence of `storage.find()` or null:

```javascript
storage.findFirst(filter);
```

Update one or more items, passing the data or an function that returns the data to put:

```javascript
storage.update(filter, data);

storage.update(filter, function(currentData) {
    return Object.assign(newData, currentData);
});

storage.updateFirst(filter, data);

storage.updateFirst(filter, function(currentData) {
    return Object.assign(newData, currentData);
});
```

Exclude one or more items:

```javascript
storage.exclude(filter);

storage.excludeFirst(filter);
```
