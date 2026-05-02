const DB_NAME = "eduportal-live-test-vault";
const STORE_NAME = "test_states";
const DB_VERSION = 1;

type VaultRecord<T> = {
  key: string;
  state: T;
  savedAt: string;
};

function openVault() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available on this device."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open live test vault."));
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
) {
  return new Promise<T>(async (resolve, reject) => {
    let db: IDBDatabase | null = null;
    try {
      db = await openVault();
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Live test vault request failed."));
      tx.oncomplete = () => db?.close();
      tx.onerror = () => {
        db?.close();
        reject(tx.error ?? new Error("Live test vault transaction failed."));
      };
    } catch (error) {
      db?.close();
      reject(error);
    }
  });
}

export async function saveLiveTestState<T>(key: string, state: T) {
  await withStore("readwrite", (store) =>
    store.put({
      key,
      state,
      savedAt: new Date().toISOString(),
    } satisfies VaultRecord<T>)
  );
}

export async function loadLiveTestState<T>(key: string) {
  const record = await withStore<VaultRecord<T> | undefined>("readonly", (store) => store.get(key));
  return record?.state ?? null;
}

export async function loadLiveTestStatesByPrefix<T>(prefix: string) {
  const range = IDBKeyRange.bound(prefix, `${prefix}\uffff`);
  const records = await withStore<VaultRecord<T>[]>("readonly", (store) => store.getAll(range));
  return records.map((record) => record.state);
}
