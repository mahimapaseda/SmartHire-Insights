import React, { useState, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  ArrowLeft, CheckCircle2, RefreshCcw, FileText,
  Briefcase, GraduationCap, Mail, MapPin, X, Info,
} from 'lucide-react';
import { generateCandidateData } from '../utils/graphDataUtils';

const CandidateDeepDive = ({ candidate, onBack }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData]                     = useState(() => generateCandidateData(candidate?.id));
  const fgRef = useRef();

  useEffect(() => {
    const t = setTimeout(() => fgRef.current?.zoomToFit(400, 60), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: '500px', gap: '1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={onBack} style={{ padding: '0.5rem 0.75rem' }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div className="divider" style={{ width: '1px', height: '24px' }} />
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: '700' }}>{candidate?.name || 'Candidate'}</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              CV graph extraction · {candidate?.skills?.length || 0} skills · {candidate?.experience}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-success"><CheckCircle2 size={11} /> {candidate?.match || 95}% match</span>
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

        {/* Left: candidate info panel */}
        <div className="card" style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: 'var(--r-md)',
              background: candidate?.gradient || 'linear-gradient(135deg,#1a5c38,#22c55e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: '800', color: '#fff', flexShrink: 0,
            }}>
              {candidate?.initials || candidate?.name?.charAt(0) || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: '700', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {candidate?.name}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{candidate?.role}</p>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
            <InfoItem icon={<Briefcase size={13} />}    label="Experience"  value={candidate?.experience || '—'} />
            <InfoItem icon={<MapPin size={13} />}       label="Location"    value={candidate?.location || '—'} />
            <InfoItem icon={<GraduationCap size={13} />} label="Education"  value={candidate?.education || '—'} />
            <InfoItem icon={<Mail size={13} />}         label="Email"       value={candidate?.email || '—'} />

            {/* Skills */}
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                Skills
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {(candidate?.skills || []).map(s => (
                  <span key={s} className="badge badge-green" style={{ fontSize: '0.65rem' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Projects */}
            {candidate?.projects?.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                  Projects
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {candidate.projects.map(p => (
                    <div key={p} style={{
                      padding: '0.4rem 0.625rem',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      fontSize: '0.75rem', color: 'var(--text-secondary)',
                    }}>{p}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {candidate?.summary && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
                  AI Summary
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>{candidate.summary}</p>
              </div>
            )}
          </div>

          {/* Source file */}
          {candidate?.source && (
            <div style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.75rem', color: 'var(--text-muted)',
            }}>
              <FileText size={13} color="var(--primary)" />
              {candidate.source}
            </div>
          )}
        </div>

        {/* Right: graph */}
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
              if (scale > 0.8) {
                const fs = Math.max(9, 11 / scale);
                ctx.font = `500 ${fs}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                ctx.fillText(node.label, node.x, node.y + r + fs * 1.1);
              }
            }}
            linkColor={() => 'rgba(128,128,128,0.2)'}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={n => setSelectedNode(n)}
            backgroundColor="transparent"
          />

          {/* Node info drawer */}
          {selectedNode && (
            <div className="animate-fade" style={{
              position: 'absolute', top: '1rem', right: '1rem', bottom: '1rem',
              width: '240px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '1.25rem',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  width: '38px', height: '38px',
                  borderRadius: 'var(--r-md)',
                  background: selectedNode.type === 'Candidate' ? 'var(--primary-subtle)' : 'rgba(34,197,94,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Info size={17} color={selectedNode.type === 'Candidate' ? 'var(--primary)' : 'var(--success)'} />
                </div>
                <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => setSelectedNode(null)}>
                  <X size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>{selectedNode.label}</h3>
              <span className={`badge ${
                selectedNode.type === 'Candidate' ? 'badge-green' :
                selectedNode.type === 'Skill'     ? 'badge-success' :
                selectedNode.type === 'Education' ? 'badge-warning' : 'badge-info'
              }`} style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                {selectedNode.type}
              </span>

              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--r-md)',
                padding: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#22c55e',
                lineHeight: '1.7',
                border: '1px solid var(--border)',
                marginTop: '0.75rem',
              }}>
                "type": "{selectedNode.type}",<br />
                "id": "{selectedNode.id}",<br />
                "extracted": "2026-05-10",<br />
                "confidence": 0.982
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
    <span style={{ color: 'var(--text-muted)', marginTop: '1px', flexShrink: 0 }}>{icon}</span>
    <div>
      <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '500', lineHeight: '1.4' }}>{value}</p>
    </div>
  </div>
);

export default CandidateDeepDive;
