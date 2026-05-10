import React, { useState, useRef, useMemo, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, Filter, Users, Layers, Zap, X, Plus, RefreshCcw } from 'lucide-react';
import { generateMacroData } from '../utils/mockGraphData';
import { candidateStore } from '../utils/candidateStore';

const MacroKnowledgeGraph = () => {
  const [query,         setQuery]    = useState('');
  const [selectedNodes, setSelected] = useState([]);
  const [data,          setData]     = useState(() => generateMacroData());
  const fgRef = useRef();

  // Rebuild graph when store changes (new CVs parsed)
  useEffect(() => {
    return candidateStore.subscribe(() => {
      setData(generateMacroData());
      setSelected([]);
    });
  }, []);

  const filteredData = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    const matchIds = new Set(
      data.nodes.filter(n => n.label.toLowerCase().includes(q)).map(n => n.id)
    );
    return {
      nodes: data.nodes.map(n => ({ ...n, _dim: !matchIds.has(n.id) })),
      links: data.links,
    };
  }, [data, query]);

  const handleNodeClick = (node) => {
    if (node.type !== 'Candidate') return;
    setSelected(prev =>
      prev.includes(node.id)
        ? prev.filter(id => id !== node.id)
        : [...prev.slice(-1), node.id]
    );
  };

  const nodeColor = (node) => {
    if (node._dim) return 'rgba(128,128,128,0.15)';
    if (selectedNodes.includes(node.id)) return '#ffffff';
    return node.color;
  };

  const candidateCount = data.nodes.filter(n => n.type === 'Candidate').length;
  const skillCount     = data.nodes.filter(n => n.type === 'Skill').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 200px)', minHeight: '500px' }}>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="input"
            type="text"
            placeholder="Search candidate or skill…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        <button className="btn-ghost" style={{ fontSize: '0.8rem' }}
          onClick={() => { setData(generateMacroData()); setSelected([]); fgRef.current?.zoomToFit(400, 40); }}>
          <RefreshCcw size={14} /> Refresh
        </button>

        {selectedNodes.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 0.875rem',
            borderRadius: 'var(--r-md)',
            background: 'var(--primary-subtle)',
            border: '1px solid rgba(26,92,56,0.2)',
            fontSize: '0.8rem', color: 'var(--primary)',
          }}>
            <Users size={13} />
            {selectedNodes.map(id => (
              <span key={id} style={{ fontWeight: '700' }}>
                {data.nodes.find(n => n.id === id)?.label}
              </span>
            ))}
            {selectedNodes.length === 1 && (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                <Plus size={11} style={{ display: 'inline' }} /> select another to compare
              </span>
            )}
            <button style={{ background: 'none', color: 'var(--text-muted)', padding: '0 2px' }} onClick={() => setSelected([])}>
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Graph + legend */}
      <div style={{ flex: 1, display: 'flex', gap: '1rem', minHeight: 0 }}>

        {/* Canvas */}
        <div className="card" style={{ flex: 1, overflow: 'hidden', position: 'relative', padding: 0 }}>
          <ForceGraph2D
            ref={fgRef}
            graphData={filteredData}
            nodeLabel="label"
            nodeColor={nodeColor}
            nodeCanvasObject={(node, ctx, scale) => {
              const r = Math.sqrt(node.val || 10) * 1.8;
              if (selectedNodes.includes(node.id)) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, r + 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fill();
              }
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
              ctx.fillStyle = nodeColor(node);
              ctx.fill();
              if (scale > 1.0) {
                const fs = Math.max(9, 11 / scale);
                ctx.font = `600 ${fs}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                ctx.fillText(node.label, node.x, node.y + r + fs * 1.1);
              }
            }}
            nodeRelSize={1}
            linkColor={() => 'rgba(128,128,128,0.15)'}
            linkWidth={1.5}
            linkDirectionalParticles={1}
            linkDirectionalParticleSpeed={0.004}
            onNodeClick={handleNodeClick}
            cooldownTicks={120}
            onEngineStop={() => fgRef.current?.zoomToFit(500, 40)}
            backgroundColor="transparent"
          />
        </div>

        {/* Legend */}
        <div className="card" style={{ width: '190px', padding: '1.25rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Legend
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <LegendItem color="#1a5c38" label="Candidates" count={candidateCount} />
            <LegendItem color="#22c55e" label="Skills"     count={skillCount} />
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>── HAS_SKILL</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>── WORKED_AT</p>
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <StatLine icon={<Zap size={12} />}    label="Nodes"   value={data.nodes.length} />
            <StatLine icon={<Layers size={12} />} label="Links"   value={data.links.length} />
          </div>

          <div className="divider" />

          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Click a candidate node to select. Select two to compare shared skills.
          </p>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}80`, flexShrink: 0 }} />
    <div>
      <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{label}</p>
      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{count} nodes</p>
    </div>
  </div>
);

const StatLine = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>{icon}{label}</span>
    <span style={{ fontWeight: '700' }}>{value}</span>
  </div>
);

export default MacroKnowledgeGraph;
