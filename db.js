/* Kleine IndexedDB-laag. Bewaart de hele appstatus (vangsten, plekken, vissers)
   als één document, zodat het net zo simpel blijft als localStorage maar met
   veel meer opslagruimte voor foto's en geen synchrone blokkade. */

const DB_NAME = 'visteller';
const DB_VERSION = 1;
const STORE = 'staat';
const DOC_ID = 'hoofd';

function openDb(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function laadStaat(){
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(DOC_ID);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return null;
  }
}

async function bewaarStaat(data){
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ id: DOC_ID, data });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    /* opslag vol of niet beschikbaar: vangst blijft in het geheugen van deze sessie */
  }
}

/* Vraag de browser om de opslag niet automatisch op te ruimen bij ruimtegebrek. */
async function vraagBlijvendeOpslag(){
  try {
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
    }
  } catch (e) {}
}

function exportBestandsnaam(){
  const d = new Date();
  return 'visteller-backup-' + d.toISOString().slice(0,10) + '.json';
}

async function exporteerBackup(){
  const data = await laadStaat();
  const blob = new Blob([JSON.stringify(data || {}, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = exportBestandsnaam(); a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function importeerBackup(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = async () => {
      try {
        const data = JSON.parse(r.result);
        await bewaarStaat(data);
        resolve(data);
      } catch (e) { reject(e); }
    };
    r.readAsText(file);
  });
}
