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
  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  const addNode = (id, label, type, color, val) => {
    if (!nodeMap.has(id)) {
      const node = { id, label, type, color, val };
      nodes.push(node);
      nodeMap.set(id, node);
      return node;
    }
    return nodeMap.get(id);
  };

  candidates.forEach(c => {
    const cId = `c_${c.id}`;
    addNode(cId, c.name, 'Candidate', '#1a5c38', 18);

    // Skills
    c.skills.forEach(s => {
      const sId = `s_${s}`;
      addNode(sId, s, 'Skill', '#22c55e', 10);
      links.push({ source: cId, target: sId, type: 'HAS_SKILL' });
    });

    // Education
    if (c.education) {
      const parts = c.education.split(',');
      const degreeName = parts[0]?.trim();
      const instName = parts[1]?.trim();

      if (degreeName) {
        const dId = `d_${degreeName}`;
        addNode(dId, degreeName, 'Degree', '#8b5cf6', 12);
        links.push({ source: cId, target: dId, type: 'HAS_EDUCATION' });

        if (instName) {
          const iId = `i_${instName}`;
          addNode(iId, instName, 'Institution', '#f59e0b', 14);
          links.push({ source: dId, target: iId, type: 'STUDIED_AT' });
        }
      }
    }
  });

  return { nodes, links };
};
