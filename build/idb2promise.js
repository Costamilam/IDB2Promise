(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.IDB2Promise = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    var DatabaseConnection = function DatabaseConnection() {
        this.dBName = 'AppDatabase';
        this.dBVersion = undefined;
        this.dBConnection = null;
        this.versionChangeTransaction = Promise.resolve(void 0);
        this.versionChangeTransactionResolve = function () { };
    };
    DatabaseConnection.prototype.getObjecStore = function getObjecStore (mode) {
        return __awaiter(this, void 0, void 0, function* () {
                var this$1 = this;

            var database = yield this.getDatabase();
            if (database.transaction instanceof IDBTransaction) {
                database.transaction.oncomplete = function () { return this$1.versionChangeTransactionResolve(); };
                return database.transaction.objectStore(this.objectStoreName);
            }
            return database.transaction([this.objectStoreName], mode).objectStore(this.objectStoreName);
        });
    };
    DatabaseConnection.prototype.getReadableOnly = function getReadableOnly () {
        return this.getObjecStore('readonly');
    };
    DatabaseConnection.prototype.getReadableAndWritable = function getReadableAndWritable () {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getObjecStore('readwrite');
        });
    };
    DatabaseConnection.prototype.getVersionChange = function getVersionChange () {
        return __awaiter(this, void 0, void 0, function* () {
                var this$1 = this;

            return this.updateDB().then(function () { return this$1.getObjecStore(); });
        });
    };
    DatabaseConnection.prototype.getDatabase = function getDatabase () {
            var this$1 = this;

        var self = this;
        if (self.dBConnection) {
            return self.versionChangeTransaction.then(function () { return __awaiter(this$1, void 0, void 0, function* () {
                self.dBVersion = self.dBConnection.version;
                if (!self.dBConnection.objectStoreNames.contains(self.objectStoreName)) {
                    return yield self.updateDB().then(self.getDatabase);
                }
                return self.dBConnection;
            }); });
        }
        return new Promise(function (resolve, reject) {
            var request = self.dBVersion && !Number.isNaN(self.dBVersion) ? indexedDB.open(self.dBName, self.dBVersion) : indexedDB.open(self.dBName);
            request.onupgradeneeded = function (event) {
                self.versionChangeTransaction = new Promise(function (resolve) { return self.versionChangeTransactionResolve = resolve; });
                self.dBConnection = request.result;
                self.dBVersion = self.dBConnection.version;
                if (!self.dBConnection.objectStoreNames.contains(self.objectStoreName)) {
                    self.dBConnection.createObjectStore(self.objectStoreName, self.objectStoreOptions);
                }
                resolve(event.currentTarget);
            };
            request.onsuccess = function (event) {
                self.versionChangeTransaction.then(function () {
                    self.dBConnection = event.target.result;
                    self.dBVersion = self.dBConnection.version;
                    if (!self.dBConnection.objectStoreNames.contains(self.objectStoreName)) {
                        self.updateDB().then(function () { return __awaiter(this$1, void 0, void 0, function* () { return resolve(yield self.getDatabase()); }); });
                    }
                    resolve(self.dBConnection);
                });
            };
            request.onerror = function (event) {
                if (self.dBConnection instanceof IDBDatabase) {
                    self.dBConnection.close();
                    self.dBConnection = null;
                }
                reject(event);
            };
        });
    };
    DatabaseConnection.prototype.updateDB = function updateDB () {
            var this$1 = this;

        if (this.dBConnection instanceof IDBDatabase) {
            this.dBVersion = this.dBConnection.version + 1;
            this.dBConnection.close();
            this.dBConnection = null;
            return Promise.resolve(void 0);
        }
        if (this.dBVersion) {
            this.dBVersion++;
            return Promise.resolve(void 0);
        }
        return this.getDatabase().then(function (database) {
            this$1.dBVersion = this$1.dBConnection.version + 1;
            this$1.dBConnection.close();
            this$1.dBConnection = null;
            return void 0;
        });
    };

    var Request = /*@__PURE__*/(function (Promise) {
        function Request(request) {
            Promise.call(this, function (resolve, reject) {
                if (request instanceof Function) {
                    request(resolve, reject);
                }
                else {
                    request.then(function (request) {
                        if (request instanceof IDBRequest) {
                            request.onsuccess = function (event) { return resolve(event.target.result); };
                            request.onerror = function (event) { return reject(event); };
                        }
                        else {
                            resolve(request);
                        }
                    });
                }
            });
        }

        if ( Promise ) Request.__proto__ = Promise;
        Request.prototype = Object.create( Promise && Promise.prototype );
        Request.prototype.constructor = Request;

        return Request;
    }(Promise));

    var AsyncCursor = function AsyncCursor(request) {
        var this$1 = this;

        this.request = request;
        this.errorHandlers = [];
        this.successHandlers = [];
        this.finallyHandlers = [];
        this.successRequestEvent = null;
        this.errorRequestEvent = null;
        if (request instanceof Function) ;
        else {
            request.then(function (request) {
                request.addEventListener('success', this$1.createListener(this$1.successHandlers));
                request.addEventListener('error', this$1.createListener(this$1.errorHandlers));
            });
        }
    };
    AsyncCursor.prototype.createListener = function createListener (handlers) {
        var self = this;
        return function (event) {
            var selfRequestEventName = event.type === 'success' ? 'successRequestEvent' : 'errorRequestEvent';
            if (self[selfRequestEventName] === null) {
                self[selfRequestEventName] = event;
            }
            var parameter = event.target.result;
            if (parameter) {
                for (var handler of handlers) {
                    parameter = handler.call(parameter, parameter);
                }
                event.target.result.continue();
            }
            else {
                for (var handler$1 of self.finallyHandlers) {
                    handler$1.call(undefined);
                }
            }
        };
    };
    AsyncCursor.prototype.each = function each (callblack) {
        this.successHandlers.push(callblack);
        if (this.successRequestEvent !== null) {
            this.createListener(this.successHandlers)(this.successRequestEvent);
        }
        return this;
    };
    AsyncCursor.prototype.catch = function catch$1 (callblack) {
        this.errorHandlers.push(callblack);
        if (this.errorRequestEvent !== null) {
            this.createListener(this.successHandlers)(this.errorRequestEvent);
        }
        return this;
    };
    AsyncCursor.prototype.finally = function finally$1 (callblack) {
        this.finallyHandlers.push(callblack);
        if (this.successRequestEvent !== null || this.errorRequestEvent !== null) {
            this.createListener([])(undefined);
        }
        return this;
    };

    var ObjectStore = /*@__PURE__*/(function (DatabaseConnection) {
        function ObjectStore() {
            DatabaseConnection.call(this);
        }

        if ( DatabaseConnection ) ObjectStore.__proto__ = DatabaseConnection;
        ObjectStore.prototype = Object.create( DatabaseConnection && DatabaseConnection.prototype );
        ObjectStore.prototype.constructor = ObjectStore;
        ObjectStore.prototype.count = function count () {
            return new Request(this.getReadableOnly().then(function (storage) { return storage.count(); }));
        };
        ObjectStore.prototype.get = function get (key) {
            return new Request(this.getReadableOnly().then(function (storage) { return storage.get(key); }));
        };
        ObjectStore.prototype.getAll = function getAll (query, count) {
            return new Request(this.getReadableOnly().then(function (storage) { return storage.getAll(query, count); }));
        };
        ObjectStore.prototype.getAllKeys = function getAllKeys (query, count) {
            return new Request(this.getReadableOnly().then(function (storage) { return storage.getAllKeys(query, count); }));
        };
        ObjectStore.prototype.getKey = function getKey (query) {
            return new Request(this.getReadableOnly().then(function (storage) { return storage.getKey(query); }));
        };
        ObjectStore.prototype.iterate = function iterate (range, direction, readableOnly) {
            if ( readableOnly === void 0 ) readableOnly = false;

            return new AsyncCursor(this[readableOnly ? 'getReadableOnly' : 'getReadableAndWritable']().then(function (storage) { return storage.openCursor(range, direction); }));
        };
        ObjectStore.prototype.iterateKeys = function iterateKeys (query, direction) {
            return new AsyncCursor(this.getReadableOnly().then(function (storage) { return storage.openKeyCursor(query, direction); }));
        };
        ObjectStore.prototype.add = function add (data, key) {
            return new Request(this.getReadableAndWritable().then(function (storage) { return storage.add(data, key); }));
        };
        ObjectStore.prototype.put = function put (data, key) {
            return new Request(this.getReadableAndWritable().then(function (storage) { return storage.put(JSON.parse(JSON.stringify(data)), key); }));
        };
        ObjectStore.prototype.delete = function delete$1 (key) {
            return new Request(this.getReadableAndWritable().then(function (storage) { return storage.delete(key); }));
        };
        ObjectStore.prototype.clear = function clear () {
            return new Request(this.getReadableAndWritable().then(function (storage) { return storage.clear(); }));
        };
        ObjectStore.prototype.index = function index (name) {
            return new Request(this.getReadableOnly().then(function (storage) { return storage.index(name); }));
        };
        ObjectStore.prototype.getIndexNames = function getIndexNames () {
            return new Request(this.getReadableOnly().then(function (storage) { return storage.indexNames; }))
                .then(function (list) { return Array.from(list); });
        };
        ObjectStore.prototype.createIndex = function createIndex (name, keyPath, options) {
            return new Request(this.getVersionChange().then(function (storage) { return storage.createIndex(name, keyPath, options); }));
        };
        ObjectStore.prototype.deleteIndex = function deleteIndex (name) {
            return new Request(this.getVersionChange().then(function (storage) { return storage.deleteIndex(name); }));
        };

        return ObjectStore;
    }(DatabaseConnection));

    exports.ObjectStore = ObjectStore;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
