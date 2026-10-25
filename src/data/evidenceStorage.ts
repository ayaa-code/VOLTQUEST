const DB = 'voltquest.circuit-evidence.v1'
export function evidenceStorage(
  key: string,
  mode: 'read' | 'write' | 'delete',
  blob?: Blob,
): Promise<Blob | undefined> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1)
    open.onupgradeneeded = () => open.result.createObjectStore('images')
    open.onerror = () => reject(open.error)
    open.onblocked = () =>
      reject(new Error('Penyimpanan gambar sedang digunakan tab lain.'))
    open.onsuccess = () => {
      const db = open.result
      try {
        const tx = db.transaction(
          'images',
          mode === 'read' ? 'readonly' : 'readwrite',
        )
        const store = tx.objectStore('images')
        const request =
          mode === 'read'
            ? store.get(key)
            : mode === 'write'
              ? store.put(blob, key)
              : store.delete(key)
        tx.oncomplete = () => {
          db.close()
          resolve(
            mode === 'read' ? (request.result as Blob | undefined) : undefined,
          )
        }
        tx.onerror = tx.onabort = () => {
          db.close()
          reject(tx.error ?? new Error('Penyimpanan gagal.'))
        }
      } catch (error) {
        db.close()
        reject(error)
      }
    }
  })
}
