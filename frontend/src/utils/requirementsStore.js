import { API_URL, getHeaders } from '../config';

/**
 * Store for recruiter requirements (Job Descriptions).
 * Full CRUD: create, read, update, delete — synced with Neo4j via backend.
 */

let _requirements = [];
let _error        = null;
const _listeners  = new Set();

const _notify = () => _listeners.forEach(fn => fn());

export const requirementsStore = {
  getAll:   () => _requirements,
  getError: () => _error,

  /** CREATE — POST /api/requirements */
  add: async (req) => {
    try {
      const res  = await fetch(`${API_URL}/api/requirements`, {
        method:  'POST',
        headers: getHeaders(),
        body:    JSON.stringify(req),
      });
      const data = await res.json();
      if (data.success) {
        _requirements = [data.data, ..._requirements];
        _notify();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to save requirement');
      }
    } catch (err) {
      _error = err.message;
      console.error('Failed to add requirement:', err);
      _notify();
    }
  },

  /** UPDATE — PUT /api/requirements/:id */
  update: async (id, updates) => {
    const backup = [..._requirements];
    // Optimistic update in UI
    _requirements = _requirements.map(r => r.id === id ? { ...r, ...updates } : r);
    _notify();
    try {
      const res  = await fetch(`${API_URL}/api/requirements/${id}`, {
        method:  'PUT',
        headers: getHeaders(),
        body:    JSON.stringify(updates),
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Server error response:', text);
        throw new Error(`Server returned ${res.status}: ${text.slice(0, 100)}`);
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        console.error('Failed to parse JSON. Response text:', text);
        throw new Error('Server returned invalid JSON. Check console for details.');
      }

      if (!data.success) {
        _requirements = backup;   // rollback
        _error = data.error || 'Update failed';
        _notify();
        throw new Error(_error);
      }
      // Reconcile with server response
      _requirements = _requirements.map(r => r.id === id ? { ...r, ...data.data } : r);
      _notify();
      return data.data;
    } catch (err) {
      _requirements = backup;
      _error = err.message;
      console.error('Failed to update requirement:', err);
      _notify();
    }
  },

  /** DELETE — DELETE /api/requirements/:id */
  remove: async (id) => {
    const backup = [..._requirements];
    _requirements = _requirements.filter(r => r.id !== id);
    _notify();
    try {
      const res  = await fetch(`${API_URL}/api/requirements/${id}`, {
        method:  'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!data.success) {
        _requirements = backup;   // rollback
        _error = data.error || 'Delete failed';
        console.error('Failed to delete requirement:', data.error);
        _notify();
      }
    } catch (err) {
      _requirements = backup;
      _error = err.message;
      console.error('Network error while deleting requirement:', err);
      _notify();
    }
  },

  /** READ ALL — GET /api/requirements */
  fetchFromBackend: async () => {
    _error = null;
    try {
      const res  = await fetch(`${API_URL}/api/requirements`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.success) {
        _requirements = data.data;
        _notify();
      } else {
        throw new Error(data.error || 'Fetch failed');
      }
    } catch (err) {
      _error = err.message;
      console.error('Failed to fetch requirements:', err);
      _notify();
    }
  },

  clearError: () => { _error = null; _notify(); },

  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
