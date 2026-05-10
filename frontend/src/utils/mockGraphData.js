// ── Per-candidate deep-dive graph ────────────────────────────────────────────
const CANDIDATE_GRAPHS = {
  1: { // Sarah Chen
    nodes: [
      { id: 'c',    label: 'Sarah Chen',       type: 'Candidate',  color: '#1a5c38', val: 20 },
      { id: 's1',   label: 'React',            type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 's2',   label: 'Neo4j',            type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 's3',   label: 'Python',           type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 's4',   label: 'Node.js',          type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 'co1',  label: 'Google',           type: 'Company',    color: '#ef4444', val: 14 },
      { id: 'edu1', label: 'Stanford',         type: 'Education',  color: '#f59e0b', val: 12 },
    ],
    links: [
      { source: 'c', target: 's1',  type: 'HAS_SKILL' },
      { source: 'c', target: 's2',  type: 'HAS_SKILL' },
      { source: 'c', target: 's3',  type: 'HAS_SKILL' },
      { source: 'c', target: 's4',  type: 'HAS_SKILL' },
      { source: 'c', target: 'co1', type: 'WORKED_AT' },
      { source: 'c', target: 'edu1',type: 'STUDIED_AT' },
    ],
  },
  2: { // James Wilson
    nodes: [
      { id: 'c',    label: 'James Wilson',     type: 'Candidate',  color: '#1a5c38', val: 20 },
      { id: 's1',   label: 'AWS',              type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 's2',   label: 'Docker',           type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 's3',   label: 'Kubernetes',       type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 's4',   label: 'Terraform',        type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 'co1',  label: 'Amazon',           type: 'Company',    color: '#ef4444', val: 14 },
      { id: 'edu1', label: 'UT Austin',        type: 'Education',  color: '#f59e0b', val: 12 },
    ],
    links: [
      { source: 'c', target: 's1',  type: 'HAS_SKILL' },
      { source: 'c', target: 's2',  type: 'HAS_SKILL' },
      { source: 'c', target: 's3',  type: 'HAS_SKILL' },
      { source: 'c', target: 's4',  type: 'HAS_SKILL' },
      { source: 'c', target: 'co1', type: 'WORKED_AT' },
      { source: 'c', target: 'edu1',type: 'STUDIED_AT' },
    ],
  },
  3: { // Elena Rodriguez
    nodes: [
      { id: 'c',    label: 'Elena Rodriguez',  type: 'Candidate',  color: '#1a5c38', val: 20 },
      { id: 's1',   label: 'Python',           type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 's2',   label: 'PyTorch',          type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 's3',   label: 'NLP',              type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 's4',   label: 'TensorFlow',       type: 'Skill',      color: '#22c55e', val: 10 },
      { id: 'co1',  label: 'OpenAI',           type: 'Company',    color: '#ef4444', val: 14 },
      { id: 'edu1', label: 'MIT',              type: 'Education',  color: '#f59e0b', val: 12 },
    ],
    links: [
      { source: 'c', target: 's1',  type: 'HAS_SKILL' },
      { source: 'c', target: 's2',  type: 'HAS_SKILL' },
      { source: 'c', target: 's3',  type: 'HAS_SKILL' },
      { source: 'c', target: 's4',  type: 'HAS_SKILL' },
      { source: 'c', target: 'co1', type: 'WORKED_AT' },
      { source: 'c', target: 'edu1',type: 'STUDIED_AT' },
    ],
  },
};

export const generateCandidateData = (candidateId) => {
  return CANDIDATE_GRAPHS[candidateId] || CANDIDATE_GRAPHS[1];
};

// ── Macro graph (all candidates) ─────────────────────────────────────────────
export const generateMacroData = () => ({
  nodes: [
    { id: 'c1',  label: 'Sarah Chen',      type: 'Candidate', color: '#1a5c38', val: 15 },
    { id: 'c2',  label: 'James Wilson',    type: 'Candidate', color: '#1a5c38', val: 15 },
    { id: 'c3',  label: 'Elena Rodriguez', type: 'Candidate', color: '#1a5c38', val: 15 },
    { id: 's1',  label: 'React',           type: 'Skill',     color: '#22c55e', val: 10 },
    { id: 's2',  label: 'Python',          type: 'Skill',     color: '#22c55e', val: 10 },
    { id: 's3',  label: 'AWS',             type: 'Skill',     color: '#22c55e', val: 10 },
    { id: 'co1', label: 'Google',          type: 'Company',   color: '#ef4444', val: 12 },
    { id: 'co2', label: 'Meta',            type: 'Company',   color: '#ef4444', val: 12 },
  ],
  links: [
    { source: 'c1', target: 's1',  type: 'HAS_SKILL' },
    { source: 'c1', target: 's2',  type: 'HAS_SKILL' },
    { source: 'c1', target: 'co1', type: 'WORKED_AT' },
    { source: 'c2', target: 's1',  type: 'HAS_SKILL' },
    { source: 'c2', target: 's3',  type: 'HAS_SKILL' },
    { source: 'c2', target: 'co1', type: 'WORKED_AT' },
    { source: 'c3', target: 's2',  type: 'HAS_SKILL' },
    { source: 'c3', target: 's3',  type: 'HAS_SKILL' },
    { source: 'c3', target: 'co2', type: 'WORKED_AT' },
  ],
});
