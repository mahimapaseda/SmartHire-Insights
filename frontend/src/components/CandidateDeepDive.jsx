import React, { useState, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  ArrowLeft, CheckCircle2, RefreshCcw, FileText,
  Briefcase, GraduationCap, Mail, Phone, X, Info,
} from 'lucide-react';
import { generateCandidateData } from '../utils/mockGraphData';

const CandidateDeepDive = ({ candidate, onBack }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData]                     = useState(() => generateCandidateData(candidate?.id));
  const fgRef = useRef();

  useEffect(() => {
    const t = setTimeout(() => {
      fgRef.current?.zoomToFit(400, 60);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={onBack} style={{ padding: '0.5rem 0.75rem' }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div className="divider" style={{ width: '1px', height: '24px' }} />
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: '700' }}>{candidate?.name || 'Candidate'}</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>CV graph extraction · deep-dive view</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-success">
            <CheckCircle2 size={11} /> 95% confidence
          </span>
          <button className="btn-ghost" style={{ fontSize: '0.8rem' }}>
            <RefreshCcw size={13} /> Re-run
          </button>
          <button className="btn-primary" style={{ fontSize: '0.8rem' }}>
            <CheckCircle2 size={13} /> Verify
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: '1rem', minHeight: 0 }}>

        {/* Document preview */}
        <div className="card" style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.8rem', fontWeight: '600',
          }}>
            <FileText size={14} color="var(--primary-light)" />
            Resume_Analysis_v1.pdf
          </div>
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', gap: '1rem',
            background: 'var(--bg-elevated)',
          }}>
            <FileText size={40} color="var(--text-tertiary)" style={{ opacity: 0.3 }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              Document preview interface
            </p>
            {/* Skeleton lines */}
            {[80, 65, 75, 55, 70].map((w, i) => (
              <div key={i} style={{
                width: `${w}%`, height: '6px',
                borderRadius: '99px',
                background: 'var(--bg-overlay)',
              }} />
            ))}
          </div>
        </div>

        {/* Graph */}
        <div className="card" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0 }}>
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="label"
            nodeColor={n => n.color}
            nodeRelSize={6}
            nodeCanvasObject={(node, ctx, scale) => {
              const r = Math.sqrt(node.val || 10) * 1.6;
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
              ctx.fillStyle = node.color;
              ctx.fill();
              if (scale > 1) {
                const fs = Math.max(9, 11 / scale);
                ctx.font = `500 ${fs}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.fillText(node.label, node.x, node.y + r + fs);
              }
            }}
            linkColor={() => 'rgba(255,255,255,0.1)'}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={n => setSelectedNode(n)}
            backgroundColor="transparent"
          />

          {/* Node info drawer */}
          {selectedNode && (
            <div
              className="animate-fade"
              style={{
                position: 'absolute', top: '1rem', right: '1rem', bottom: '1rem',
                width: '260px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedNode.type === 'Candidate' ? 'var(--primary-subtle)' : 'rgba(34,197,94,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Info size={18} color={selectedNode.type === 'Candidate' ? 'var(--primary)' : 'var(--success)'} />
                </div>
                <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => setSelectedNode(null)}>
                  <X size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{selectedNode.label}</h3>
              <span className={`badge ${selectedNode.type === 'Candidate' ? 'badge-green' : selectedNode.type === 'Skill' ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
                {selectedNode.type}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                <InfoItem icon={<Briefcase size={13} />} label="Experience" value="5+ Years" />
                <InfoItem icon={<Mail size={13} />}      label="Email"      value="s.chen@example.com" />
                <InfoItem icon={<Phone size={13} />}     label="Phone"      value="+1 (555) 0123" />
                <InfoItem icon={<GraduationCap size={13} />} label="Specialisation" value="Full-Stack Dev" />
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  Raw Metadata
                </p>
                <div style={{
                  background: 'var(--bg-base)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: '#10b981',
                  lineHeight: '1.7',
                  border: '1px solid var(--border)',
                }}>
                  "{selectedNode.type.toLowerCase()}_id": "{selectedNode.id}",<br />
                  "extracted": "2026-05-10",<br />
                  "confidence": 0.982
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
    padding: '0.5rem 0.625rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-elevated)',
  }}>
    <span style={{ color: 'var(--text-tertiary)', marginTop: '1px', flexShrink: 0 }}>{icon}</span>
    <div>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{value}</p>
    </div>
  </div>
);

export default CandidateDeepDive;
