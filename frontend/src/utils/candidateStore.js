import { API_URL, getHeaders } from '../config';

/**
 * Lightweight in-memory candidate store.
 * Shared between CVIngestion (writes) and Candidates (reads).
 * Uses a simple pub/sub so components re-render on change.
 */

/* ── Store ─────────────────────────────────────────────────────── */
let _candidates  = [];
let _fetchError  = null;   // H-7: track fetch failures for error UI
const _listeners = new Set();

const _notify = () => _listeners.forEach(fn => fn());

const GRADIENTS = [
  'linear-gradient(135deg,#1a5c38,#22c55e)',
  'linear-gradient(135deg,#0d3320,#1a5c38)',
  'linear-gradient(135deg,#166534,#4ade80)',
];

export const candidateStore = {
  getAll:        () => _candidates,
  getFetchError: () => _fetchError,

  add: (c) => {
    const idx = _candidates.findIndex(item => item.id === c.id);
    if (idx > -1) {
      _candidates[idx] = { ..._candidates[idx], ...c };
      _candidates = [..._candidates];
    } else {
      _candidates = [..._candidates, c];
    }
    _notify();
  },

  addMany: (cs) => {
    cs.forEach(c => {
      const idx = _candidates.findIndex(item => item.id === c.id);
      if (idx > -1) {
        _candidates[idx] = { ..._candidates[idx], ...c };
      } else {
        _candidates.push(c);
      }
    });
    _candidates = [..._candidates];
    _notify();
  },

  // M-7: Roll back optimistic delete if server call fails
  remove: async (id) => {
    const backup = [..._candidates];
    _candidates  = _candidates.filter(c => c.id !== id);
    _notify();
    try {
      const res  = await fetch(`${API_URL}/api/candidates/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!data.success) {
        console.error('Failed to delete from server:', data.error);
        _candidates = backup;   // rollback
        _notify();
      }
    } catch (err) {
      console.error('Network error while deleting candidate:', err);
      _candidates = backup;     // rollback
      _notify();
    }
  },

  subscribe: (fn) => { _listeners.add(fn); return () => _listeners.delete(fn); },

  // H-7 + L-5: Surface errors, merge fetched records into existing state
  fetchFromNeo4j: async () => {
    _fetchError = null;
    try {
      const res = await fetch(`${API_URL}/api/candidates`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((c, idx) => {
          const initials = c.name && c.name !== 'Not Found'
            ? c.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
            : 'CV';
          return {
            id:         c.id || String(idx),
            name:       c.name,
            initials:   initials || 'CV',
            role:       c.experience?.length > 0 ? c.experience[0].title : 'Candidate',
            match:      c.match ?? 0,           // M-2: no random fallback
            skills:     c.skills || [],
            experience: c.experience?.length > 0
              ? `${c.experience[0].title} at ${c.experience[0].company}`
              : 'Not detected',
            location:   'Location not specified',
            education:  c.education?.length > 0 ? c.education[0].degree : 'Not detected',
            email:      c.email,
            summary:    c.summary,
            projects:   [],
            gradient:   GRADIENTS[idx % GRADIENTS.length],
            source:     'Neo4j Database',
            addedAt:    new Date().toLocaleTimeString(),
          };
        });
        // L-5: Full replace from DB (source of truth); local additions
        // persisted to Neo4j will appear here on the next fetch.
        _candidates = mapped;
        _notify();
      } else {
        throw new Error(data.error || 'Unknown server error');
      }
    } catch (err) {
      _fetchError = err.message;   // H-7: expose error to UI
      console.error('Error fetching candidates from Neo4j:', err);
      _notify();
    }
  },

  clearError: () => { _fetchError = null; _notify(); },
};
