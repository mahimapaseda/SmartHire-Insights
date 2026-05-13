/**
 * Store for recruiter requirements (Job Descriptions).
 * Used to match candidates against specific criteria.
 */
import apiFetch from './api';

let _requirements = [];
const _listeners = new Set();

export const requirementsStore = {
  getAll: () => _requirements,

  add: async (req) => {
    try {
      const data = await apiFetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (data.success) {
        _requirements = [data.data, ..._requirements];
        _listeners.forEach(fn => fn());
        return data.data;
      }
    } catch (err) {
      console.error('Failed to add requirement:', err.message);
    }
  },

  remove: async (id) => {
    // Optimistic UI update
    _requirements = _requirements.filter(r => r.id !== id);
    _listeners.forEach(fn => fn());

    try {
      await apiFetch(`/api/requirements/${id}`, { method: 'DELETE' });
    } catch (err) {
      // Endpoint may not exist yet — log but don't crash
      console.warn('Server-side requirement delete not available:', err.message);
    }
  },

  fetchFromBackend: async () => {
    try {
      const data = await apiFetch('/api/requirements');
      if (data.success) {
        _requirements = data.data;
        _listeners.forEach(fn => fn());
      }
    } catch (err) {
      console.error('Failed to fetch requirements:', err.message);
    }
  },

  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
