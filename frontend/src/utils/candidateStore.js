import { API_URL, getHeaders } from '../config';

/**
 * Lightweight in-memory candidate store.
 * Shared between CVIngestion (writes) and Candidates (reads).
 * Uses a simple pub/sub so components re-render on change.
 */

/* ── Store ─────────────────────────────────────────────────────── */
let _candidates = [];
const _listeners = new Set();

export const candidateStore = {
  getAll:  ()  => _candidates,
  add: (c) => { 
    const idx = _candidates.findIndex(item => item.id === c.id);
    if (idx > -1) {
      _candidates[idx] = { ..._candidates[idx], ...c };
      _candidates = [..._candidates];
    } else {
      _candidates = [..._candidates, c];
    }
    _listeners.forEach(fn => fn()); 
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
    _listeners.forEach(fn => fn()); 
  },
  remove:  async (id)=> { 
    // UI optimistic update
    _candidates = _candidates.filter(c => c.id !== id); 
    _listeners.forEach(fn => fn()); 
    
    // Server sync
    try {
      const res = await fetch(`${API_URL}/api/candidates/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!data.success) {
        console.error("Failed to delete from server:", data.error);
      }
    } catch (err) {
      console.error("Network error while deleting candidate:", err);
    }
  },
  subscribe:   (fn) => { _listeners.add(fn);    return () => _listeners.delete(fn); },
  fetchFromNeo4j: async () => {
    try {
      const res = await fetch(`${API_URL}/api/candidates`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((c, idx) => {
          const initials = c.name && c.name !== "Not Found" ? c.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : 'CV';
          return {
            id: c.id || idx,
            name: c.name,
            initials: initials || 'CV',
            role: c.experience && c.experience.length > 0 ? c.experience[0].title : 'Candidate',
            match: c.match || 70,
            skills: c.skills || [],
            experience: c.experience && c.experience.length > 0 ? `${c.experience[0].title} at ${c.experience[0].company}` : 'Not detected',
            location: 'Location not specified',
            education: c.education && c.education.length > 0 ? c.education[0].degree : 'Not detected',
            email: c.email,
            summary: c.summary,
            projects: [],
            gradient: ['linear-gradient(135deg,#1a5c38,#22c55e)','linear-gradient(135deg,#0d3320,#1a5c38)','linear-gradient(135deg,#166534,#4ade80)'][Math.floor(Math.random()*3)],
            source: 'Neo4j Database',
            addedAt: new Date().toLocaleTimeString(),
          };
        });
        _candidates = mapped;
        _listeners.forEach(fn => fn());
      }
    } catch (err) {
      console.error("Error fetching candidates from Neo4j:", err);
    }
  }
};
