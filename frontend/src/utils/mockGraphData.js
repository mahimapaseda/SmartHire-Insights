import { candidateStore } from './candidateStore';

// ── Per-candidate deep-dive graph ─────────────────────────────────────────────
// Generates a graph from a candidate object (works for any candidate, not just seed data)
export const generateCandidateData = (candidateId) => {
  const all = candidateStore.getAll();
  const candidate = all.find(c => c.id === candidateId) || all[0];
  if (!candidate) return { nodes: [], links: [] };

  const nodes = [
    { id: 'c', label: candidate.name, type: 'Candidate', color: '#1a5c38', val: 20 },
    ...candidate.skills.map((s, i) => ({
      id: `s${i}`, label: s, type: 'Skill', color: '#22c55e', val: 10,
    })),
    { id: 'co1', label: candidate.education?.split(',')[1]?.trim() || 'Company', type: 'Company', color: '#ef4444', val: 14 },
    { id: 'edu1', label: candidate.education?.split(',')[0]?.trim() || 'University', type: 'Education', color: '#f59e0b', val: 12 },
  ];

  const links = [
    ...candidate.skills.map((_, i) => ({ source: 'c', target: `s${i}`, type: 'HAS_SKILL' })),
    { source: 'c', target: 'co1',  type: 'WORKED_AT' },
    { source: 'c', target: 'edu1', type: 'STUDIED_AT' },
  ];

  return { nodes, links };
};

// ── Macro graph — built from live candidate store ─────────────────────────────
export const generateMacroData = () => {
  const candidates = candidateStore.getAll();

  // Collect all unique skills across all candidates
  const skillMap = new Map();
  candidates.forEach(c => {
    c.skills.forEach(s => {
      if (!skillMap.has(s)) skillMap.set(s, `skill_${skillMap.size}`);
    });
  });

  // Limit to top 8 skills by frequency
  const skillFreq = new Map();
  candidates.forEach(c => c.skills.forEach(s => skillFreq.set(s, (skillFreq.get(s) || 0) + 1)));
  const topSkills = [...skillFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([s]) => s);

  const skillNodes = topSkills.map((s, i) => ({
    id: `s_${i}`, label: s, type: 'Skill', color: '#22c55e', val: 10,
  }));

  const candidateNodes = candidates.map(c => ({
    id: `c_${c.id}`, label: c.name, type: 'Candidate', color: '#1a5c38', val: 15,
  }));

  const links = [];
  candidates.forEach(c => {
    c.skills.forEach(s => {
      const skillNode = skillNodes.find(n => n.label === s);
      if (skillNode) {
        links.push({ source: `c_${c.id}`, target: skillNode.id, type: 'HAS_SKILL' });
      }
    });
  });

  return { nodes: [...candidateNodes, ...skillNodes], links };
};
