/**
 * Store for recruiter requirements (Job Descriptions).
 * Used to match candidates against specific criteria.
 */

const SEED_REQUIREMENTS = [
  {
    id: 'req-1',
    title: 'Senior Full Stack Engineer',
    role: 'Full Stack Engineer',
    skills: ['React', 'Node.js', 'Neo4j', 'TypeScript', 'AWS'],
    minExperience: 5,
    description: 'We are looking for a Senior Full Stack Engineer to lead our core platform team. Experience with graph databases is a plus.',
    addedAt: new Date().toLocaleTimeString(),
  }
];

let _requirements = [];
const _listeners = new Set();

export const requirementsStore = {
  getAll: () => _requirements,
  add: async (req) => {
    try {
      const res = await fetch('http://localhost:5000/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    
    // In a real app, you'd add DELETE /api/requirements/<id>
  },
  fetchFromBackend: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/requirements');
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
