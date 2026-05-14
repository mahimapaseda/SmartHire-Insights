/**
 * In-memory store for the CV Ingestion processing queue.
 * Persists the state of uploaded files and their parsing status
 * even when the user navigates away from the Ingestion page.
 */

let _files = [];
let _parsing = false;
const _listeners = new Set();

const _notify = () => _listeners.forEach(fn => fn());

export const ingestionStore = {
  getFiles:  () => _files,
  isParsing: () => _parsing,

  setFiles: (files) => {
    _files = files;
    _notify();
  },

  addFiles: (newFiles) => {
    _files = [..._files, ...newFiles];
    _notify();
  },

  updateFile: (id, updates) => {
    _files = _files.map(f => (f.id === id ? { ...f, ...updates } : f));
    _notify();
  },

  removeFile: (id) => {
    _files = _files.filter(f => f.id !== id);
    _notify();
  },

  clearDone: () => {
    _files = _files.filter(f => f.status !== 'completed');
    _notify();
  },

  setParsing: (val) => {
    _parsing = val;
    _notify();
  },

  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
