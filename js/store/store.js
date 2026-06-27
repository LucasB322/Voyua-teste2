import { storageLoad, storageSave, storageClear } from '../storage/storage.js';
import { buildSeedData } from '../storage/seed.js';

let _state = null;
const _subscribers = new Set();

export const Store = {
  init() {
    _state = storageLoad() ?? buildSeedData();
  },

  getState() {
    return _state;
  },

  setState(updater) {
    const patch = typeof updater === 'function' ? updater(_state) : updater;
    _state = { ..._state, ...patch };
    storageSave(_state);
    _subscribers.forEach(fn => fn(_state));
  },

  subscribe(fn) {
    _subscribers.add(fn);
    return () => _subscribers.delete(fn);
  },

  reset() {
    storageClear();
    _state = buildSeedData();
    storageSave(_state);
    _subscribers.forEach(fn => fn(_state));
  },
};
