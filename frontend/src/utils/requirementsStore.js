import { API_URL, getHeaders } from '../config';

/**
 * Store for recruiter requirements (Job Descriptions).
 * Used to match candidates against specific criteria.
 */

let _requirements = [];
const _listeners = new Set();

export const requirementsStore = {
  getAll: () => _requirements,
  add: async (req) => {
    try {
      const res = await fetch(`${API_URL}/api/requirements`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(req)
      });
      const data = await res.json();
      if (data.success) {
        _requirements = [data.data, ..._requirements];
        _listeners.forEach(fn => fn());
        return data.data;
      }
    } catch (err) {
      console.error("Failed to add requirement:", err);
    }
  },
  remove: async (id) => {
    // UI optimistic update
    _requirements = _requirements.filter(r => r.id !== id);
    _listeners.forEach(fn => fn());
    
    try {
      const res = await fetch(`${API_URL}/api/requirements/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!data.success) {
        console.error("Failed to delete requirement from server:", data.error);
      }
    } catch (err) {
      console.error("Network error while deleting requirement:", err);
    }
  },
  fetchFromBackend: async () => {
    try {
      const res = await fetch(`${API_URL}/api/requirements`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        _requirements = data.data;
        _listeners.forEach(fn => fn());
      }
    } catch (err) {
      console.error("Failed to fetch requirements:", err);
    }
  },
  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
