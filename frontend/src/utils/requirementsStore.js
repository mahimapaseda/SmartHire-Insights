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

let _requirements = [...SEED_REQUIREMENTS];
const _listeners = new Set();

export const requirementsStore = {
  getAll: () => _requirements,
  add: (req) => {
    const newReq = {
      id: crypto.randomUUID(),
      addedAt: new Date().toLocaleTimeString(),
      ...req
    };
    _requirements = [newReq, ..._requirements];
    _listeners.forEach(fn => fn());
  },
  remove: (id) => {
    _requirements = _requirements.filter(r => r.id !== id);
    _listeners.forEach(fn => fn());
  },
  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
