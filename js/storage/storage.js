const STORAGE_KEY = 'vouya_state_v1';
let _memoryFallback = null;

function isAvailable() {
  try {
    const k = '__vouya_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch { return false; }
}

export function storageLoad() {
  if (isAvailable()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Vouya: failed to parse saved state.', e);
      return null;
    }
  }
  return _memoryFallback;
}

export function storageSave(data) {
  if (isAvailable()) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return; }
    catch (e) { console.warn('Vouya: localStorage write failed, falling back to memory.', e); }
  }
  _memoryFallback = data;
}

export function storageClear() {
  if (isAvailable()) {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
  }
  _memoryFallback = null;
}
