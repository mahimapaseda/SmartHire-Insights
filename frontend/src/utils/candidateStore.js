/**
 * Lightweight in-memory candidate store.
 * Shared between CVIngestion (writes) and Candidates (reads).
 * Uses a simple pub/sub so components re-render on change.
 */
import apiFetch from './api';

/* ── Per-candidate deep-dive graph ─────────────────────────────── */
const ROLE_POOL   = ['Full Stack Engineer','Backend Developer','Frontend Developer','DevOps Lead','AI Researcher','Data Scientist','Product Manager','ML Engineer','Cloud Architect','Security Engineer'];
const SKILL_POOL  = ['React','Node.js','Python','AWS','Docker','Kubernetes','TypeScript','Neo4j','PyTorch','TensorFlow','NLP','GraphQL','PostgreSQL','Redis','Terraform','Java','Go','Rust','Vue.js','FastAPI'];
const LOC_POOL    = ['San Francisco, CA','Austin, TX','Boston, MA','New York, NY','Seattle, WA','London, UK','Toronto, CA','Berlin, DE','Singapore','Remote'];
const EDU_POOL    = ['B.S. Computer Science, MIT','M.S. Computer Science, Stanford','Ph.D. AI, Carnegie Mellon','B.Eng. Software, UT Austin','M.Sc. Data Science, UCL','B.S. Information Systems, Georgia Tech'];
const PROJ_POOL   = ['E-Commerce Platform Rebuild','Real-time Analytics Dashboard','Graph-based Recommendation Engine','CI/CD Pipeline Automation','NLP Document Classifier','Microservices Migration','Fraud Detection System','Mobile App Backend','Cloud Cost Optimiser','Semantic Search Engine'];
const GRAD_POOL   = ['linear-gradient(135deg,#1a5c38,#22c55e)','linear-gradient(135deg,#0d3320,#1a5c38)','linear-gradient(135deg,#166534,#4ade80)','linear-gradient(135deg,#14532d,#22c55e)','linear-gradient(135deg,#052e16,#16a34a)'];

const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

let _nextId = 100;

export function extractFromFile(file) {
  const name = file.name.replace(/\.(pdf|docx)$/i, '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'CV';
  const skills   = pickN(SKILL_POOL, Math.floor(Math.random() * 4) + 3);
  const exp      = `${Math.floor(Math.random() * 8) + 1} year${Math.random() > 0.3 ? 's' : ''}`;
  const match    = Math.floor(Math.random() * 25) + 72;

  return {
    id:        _nextId++,
    name,
    initials,
    role:      pick(ROLE_POOL),
    match,
    skills,
    experience: exp,
    location:  pick(LOC_POOL),
    education: pick(EDU_POOL),
    email:     `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    summary:   `Experienced professional with ${exp} in ${skills.slice(0,2).join(' and ')}. Demonstrated ability to deliver high-quality solutions in fast-paced environments.`,
    projects:  pickN(PROJ_POOL, 2),
    gradient:  pick(GRAD_POOL),
    source:    file.name,
    addedAt:   new Date().toLocaleTimeString(),
  };
}

/* ── Store ─────────────────────────────────────────────────────── */
let _candidates = [];
const _listeners = new Set();

export const candidateStore = {
  getAll:  ()  => _candidates,
  add:     (c) => { _candidates = [..._candidates, c]; _listeners.forEach(fn => fn()); },
  addMany: (cs)=> { _candidates = [..._candidates, ...cs]; _listeners.forEach(fn => fn()); },

  remove: async (id) => {
    // Optimistic UI update
    _candidates = _candidates.filter(c => c.id !== id);
    _listeners.forEach(fn => fn());

    // Server sync
    try {
      await apiFetch(`/api/candidates/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete candidate from server:', err.message);
    }
  },

  subscribe: (fn) => { _listeners.add(fn); return () => _listeners.delete(fn); },

  fetchFromNeo4j: async () => {
    try {
      const data = await apiFetch('/api/candidates');
      if (data.success) {
        const mapped = data.data.map((c, idx) => {
          const initials = c.name && c.name !== 'Not Found'
            ? c.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
            : 'CV';
          return {
            id:        c.id || idx,
            name:      c.name,
            initials:  initials || 'CV',
            role:      c.experience?.length > 0 ? c.experience[0].title : 'Candidate',
            match:     c.match || 70,
            skills:    c.skills || [],
            experience: c.experience?.length > 0
              ? `${c.experience[0].title} at ${c.experience[0].company}`
              : 'Not detected',
            location:  'Location not specified',
            education: c.education?.length > 0 ? c.education[0].degree : 'Not detected',
            email:     c.email,
            summary:   c.summary,
            projects:  [],
            gradient:  ['linear-gradient(135deg,#1a5c38,#22c55e)','linear-gradient(135deg,#0d3320,#1a5c38)','linear-gradient(135deg,#166534,#4ade80)'][Math.floor(Math.random()*3)],
            source:    'Neo4j Database',
            addedAt:   new Date().toLocaleTimeString(),
          };
        });
        _candidates = mapped;
        _listeners.forEach(fn => fn());
      }
    } catch (err) {
      console.error('Failed to fetch candidates from Neo4j:', err.message);
    }
  },
};
