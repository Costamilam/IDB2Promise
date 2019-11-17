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
import { ObjectStore } from 'IDB2Promise';

class Example {
    constructor(
        public name: string
    ) { }
}

class ExampleStorage extends ObjectStore<Example> {
    readonly objectStoreName: string = 'Example';

    readonly objectStoreOptions: IDBObjectStoreParameters = { autoIncrement: true };

    readonly dBName: string = 'AppDB';
}
```

> `dBName` property is optionally, if is not defined, the default value is `'AppDatabase'`

You can use a base class to set database name:

```typescript
import { ObjectStore } from 'IDB2Promise';
import { ExampleOne, ExampleTwo } from './path/to/models'

abstract class AppStorage<Type> extends ObjectStore<Type> {
    readonly dBName: string = 'AppDB';
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
    this.objectStoreName = 'Example';
    this.objectStoreOptions = { autoIncrement: true };
    this.dBName = 'AppDB';
}
ExampleStorage.prototype = IDB2Promise.ObjectStore;
```

> `dBName` property is optionally, if is not defined, the default value is `'AppDatabase'`

You can use a base class to set database name:

```javascript
function AppStorage() {
    this.dBName = 'AppDB';
}
AppStorage.prototype = IDB2Promise.ObjectStore;

function ExampleStorageOne() {
    this.objectStoreName = 'ExampleStorageOne';
    this.objectStoreOptions = { autoIncrement: true };
}
ExampleStorageOne.prototype = AppStorage;

function ExampleStorageTwo() {
    this.objectStoreName = 'ExampleStorageTwo';
    this.objectStoreOptions = { keyPath: 'name' };
}
ExampleStorageTwo.prototype = AppStorage;
```

After you instance the super class of `ObjectStore` and call your functions to manage database

## ObjecStore API (JavaScript and TypeScript)

First, instance your `ObjectStore` super class

```JavaScript
var storage = new ExampleStorage();
/* var or let or const */
```

All methods, except iterators, has very semelhance with [native API](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore), the parameters is equal but returns `IDBRequest.result` as a `Promise`

### Indexes manager methods

```JavaScript
storage.createIndex(name, keyPath, options);

storage.index(name);

storage.deleteIndex(name);
```

Equivalent of property `IDBObjecStore.indexNames`:

```JavaScript
storage.getIndexNames();
```

### Writers methods

```JavaScript
storage.add(data, key);

storage.put(data, key);

storage.delete(key);

storage.clear();
```

### Readers methods

```JavaScript
storage.count();

storage.get(key);

storage.getAll(query, count);

storage.getAllKeys(query, count);

storage.getKey(query);
```

### Iterators methods

Equivalent of method `IDBObjecStore.openCursor()`:

```JavaScript
storage.iterate(range, direction, readableOnly);
```

> `readableOnly` is a boolean, if `true` you can't call writers methods of iterator item. Default is `false`

Equivalent of method `IDBObjecStore.openKeyCursor()`:

```JavaScript
storage.iterateKeys(query, direction);
```

Two methods return a `AsyncCursor` with 3 methods:

 - `each`: push one success callback, you can add multiples callbacks to called in order in all iterations

 - `catch`: push one error callback, you can add multiples callbacks to called in order

 - `finally`: push one finally callback, it is called after all iterations and/or errors

Example:

```javascript
storage.iterate()
    .each(function(item) {
        return isOld(item.value) ? item.delete() && false : item
    })
    .each(function(item) {
        if (item !== false) pushItemInDOMList(item);
    })
    .catch(function(eventError) {
        showErrorMessage('Load failed');
    })
    .finally(function() {
        showInfoMessage('All data loaded');
    })
```

The writers methods in the iteration item don't use Promises, they are the native API
