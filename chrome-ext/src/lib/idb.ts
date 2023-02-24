export class IDBExport {
    private _indexedDB: IDBFactory;

    constructor(indexedDB: IDBFactory) {
        this._indexedDB = indexedDB;
    }

    async expDb(idbDatabase: IDBDatabase) {
        return new Promise((
            resolve,
            reject,
        ) => {
            const exportObject: { [key: string]: any[] } = {};
            const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
            const size = objectStoreNamesSet.size;
            if (size === 0) {
                resolve(JSON.stringify(exportObject));

                return;
            }

            const objectStoreNames = Array.from(objectStoreNamesSet);

            const transaction = idbDatabase.transaction(
                objectStoreNames,
                'readonly',
            );

            transaction.onerror = (event) => reject(event);

            objectStoreNames.forEach((storeName) => {
                const out: any[] = [];

                transaction.objectStore(storeName)
                           .openCursor()
                    .onsuccess =
                    (event) => {
                        const cursor = event.target?.result ?? null;

                        if (!cursor) {
                            exportObject[storeName] = out;
                            if (
                                objectStoreNames.length ===
                                Object.keys(exportObject).length
                            ) {
                                resolve(JSON.stringify(exportObject));
                            }
                            return;
                        }

                        out.push(cursor.value);

                        cursor.continue();
                    };
            });
        });
    }

    importDb(
        idbDatabase: IDBDatabase,
        data: string,
    ) {
        return new Promise((
            resolve,
            reject,
        ) => {
            const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
            const size = objectStoreNamesSet.size;

            if (size === 0) {
                resolve();
                return;
            }

            const objectStoreNames = Array.from(objectStoreNamesSet);

            const transaction = idbDatabase.transaction(
                objectStoreNames,
                'readwrite',
            );

            transaction.onerror = event => reject(event);

            const importObject = JSON.parse(data);

            Object.keys(importObject)
                  .forEach(storeName => {
                      if (!objectStoreNames.includes(storeName)) {
                          delete importObject[storeName];
                      }
                  });

            if (Object.keys(importObject).length === 0) {
                resolve();
                return;
            }

            objectStoreNames.forEach(storeName => {
                let count = 0;

                const aux = Array.from(importObject[storeName] || []);

                if (importObject[storeName] && aux.length > 0) {
                    aux.forEach((toAdd: unknown) => {
                        const request =
                            transaction
                                .objectStore(storeName)
                                .add(toAdd);

                        request.onsuccess = () => {
                            count++;

                            if (count === importObject[storeName].length) {
                                delete importObject[storeName];

                                if (Object.keys(importObject).length === 0) {
                                    resolve();
                                    return;
                                }
                            }
                        };
                        request.onerror = (event) => {
                            console.log(event);
                        };
                    });

                    return;
                }

                if (importObject[storeName]) {
                    delete importObject[storeName];

                    if (Object.keys(importObject).length === 0) {
                        resolve();
                        return;
                    }
                }
            });
        });
    }


    async listDb() {
        return this._indexedDB.databases()
                   .then((dbs) =>
                       dbs.map((db) =>
                           db.name,
                       ),
                   );
    }

    async openDb(dbName: string) {
        return new Promise<IDBDatabase>((
            resolve,
            reject,
        ) => {
            const request = this._indexedDB.open(dbName);

            request.onerror = (event) => reject(event);

            request.onsuccess = (event) => {
                const idbDatabase = (event.target as IDBOpenDBRequest).result;

                resolve(idbDatabase);
            };
        });
    }

    async openAllDbs() {
        return this.listDb()
                   .then((dbNames) =>
                       Promise.all(dbNames.map((dbName) =>
                           this.openDb(dbName!),
                       )),
                   );
    }

    async dumpAllDbs() {
        return this.openAllDbs()
                   .then((dbs) =>
                       Promise.all(dbs.map((db) =>
                           this.expDb(db),
                       )),
                   );
    }
}


export const IDBExportInstance = new IDBExport(window.indexedDB);