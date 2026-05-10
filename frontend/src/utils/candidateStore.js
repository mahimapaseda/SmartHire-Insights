/**
 * Lightweight in-memory candidate store.
 * Shared between CVIngestion (writes) and Candidates (reads).
 * Uses a simple pub/sub so components re-render on change.
 */

/* ── Mock NLP extraction per filename ─────────────────────────── */
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

/* ── Seed data (always present) ───────────────────────────────── */
const SEED = [
  {
    id: 1, name: 'Sarah Chen', initials: 'SC',
    role: 'Full Stack Engineer', match: 98,
    skills: ['React','Node.js','Neo4j','Python','TypeScript'],
    experience: '5 years', location: 'San Francisco, CA',
    education: 'M.S. Computer Science, Stanford',
    email: 'sarah.chen@example.com',
    summary: 'Experienced engineer specialising in high-performance web applications and graph database modelling.',
    projects: ['FinTech Analytics Engine','Graph-based Social CRM'],
    gradient: 'linear-gradient(135deg,#1a5c38,#22c55e)',
    source: 'sarah_chen_cv.pdf', addedAt: '09:00 AM',
  },
  {
    id: 2, name: 'James Wilson', initials: 'JW',
    role: 'DevOps Lead', match: 92,
    skills: ['AWS','Docker','Kubernetes','Python','Terraform'],
    experience: '8 years', location: 'Austin, TX',
    education: 'B.S. Information Technology, UT Austin',
    email: 'j.wilson@example.com',
    summary: 'Automation specialist focused on cloud infrastructure scalability and security.',
    projects: ['Global CDN Migration','Zero-Downtime Deployment Suite'],
    gradient: 'linear-gradient(135deg,#0d3320,#1a5c38)',
    source: 'james_wilson_cv.pdf', addedAt: '09:15 AM',
  },
  {
    id: 3, name: 'Elena Rodriguez', initials: 'ER',
    role: 'AI Researcher', match: 95,
    skills: ['Python','PyTorch','NLP','TensorFlow','LLMs'],
    experience: '4 years', location: 'Boston, MA',
    education: 'Ph.D. Artificial Intelligence, MIT',
    email: 'elena.r@example.com',
    summary: 'Research scientist dedicated to advancing Natural Language Processing.',
    projects: ['Multi-modal LLM Evaluation','Sentiment Analysis at Scale'],
    gradient: 'linear-gradient(135deg,#166534,#4ade80)',
    source: 'elena_rodriguez_cv.pdf', addedAt: '09:30 AM',
  },
];

/* ── Store ─────────────────────────────────────────────────────── */
let _candidates = [...SEED];
const _listeners = new Set();

export const candidateStore = {
  getAll:  ()  => _candidates,
  add:     (c) => { _candidates = [..._candidates, c]; _listeners.forEach(fn => fn()); },
  addMany: (cs)=> { _candidates = [..._candidates, ...cs]; _listeners.forEach(fn => fn()); },
  remove:  (id)=> { _candidates = _candidates.filter(c => c.id !== id); _listeners.forEach(fn => fn()); },
  subscribe:   (fn) => { _listeners.add(fn);    return () => _listeners.delete(fn); },
};
