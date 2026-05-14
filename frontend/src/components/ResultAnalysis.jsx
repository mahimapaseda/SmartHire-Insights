import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Smile, Mic, TrendingUp, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp,
  Download, Star, Brain,
} from 'lucide-react';
import { candidateStore } from '../utils/candidateStore';

/* ── Deterministic mock scores from candidate data ───────────────
   In production these come from the FER / Voice APIs.
   Here we derive them from the candidate's match score so they
   look consistent rather than random on every render.
─────────────────────────────────────────────────────────────── */
const EMOTIONS   = ['Confident', 'Focused', 'Neutral', 'Nervous', 'Happy'];
const STRESS_LVL = ['Low', 'Moderate', 'High'];

function mockScores(candidate) {
  const seed = candidate.match; // deterministic from match %
  const emotionIdx   = seed % EMOTIONS.length;
  const emotionScore = 55 + (seed % 40);
  const stressScore  = Math.max(5, 80 - seed);
  const stressIdx    = stressScore < 35 ? 0 : stressScore < 65 ? 1 : 2;
  const overall      = Math.round((candidate.match * 0.5) + (emotionScore * 0.25) + ((100 - stressScore) * 0.25));

  const EMOTION_COLORS = { Confident: '#3b82f6', Focused: '#1a5c38', Neutral: '#8b949e', Nervous: '#f59e0b', Happy: '#22c55e' };
  const STRESS_COLORS  = ['#22c55e', '#f59e0b', '#ef4444'];

  return {
    emotion: { dominant: EMOTIONS[emotionIdx], score: emotionScore, color: EMOTION_COLORS[EMOTIONS[emotionIdx]] },
    voice:   { stress: STRESS_LVL[stressIdx],  score: stressScore,  color: STRESS_COLORS[stressIdx] },
    overall,
    verdict:      overall >= 88 ? 'Highly Recommended' : overall >= 78 ? 'Recommended' : 'Consider',
    verdictColor: overall >= 88 ? '#22c55e' : overall >= 78 ? '#1a5c38' : '#f59e0b',
    verdictBg:    overall >= 88 ? 'rgba(34,197,94,0.1)' : overall >= 78 ? 'rgba(26,92,56,0.1)' : 'rgba(245,158,11,0.1)',
    strengths: candidate.skills.slice(0, 2).map(s => `Strong ${s} expertise`).concat(['Clear communication']),
    concerns:  stressScore > 50 ? ['Elevated stress indicators detected'] : [],
  };
}

/* ── Score ring ───────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 52, stroke = 5, color = 'var(--primary)' }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-strong)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '-0.04em', color }}>{score}</span>
      </div>
    </div>
  );
};

/* ── Radar chart ──────────────────────────────────────────────── */
const RadarChart = ({ data }) => {
  const cx = 100, cy = 100, r = 70;
  const keys = Object.keys(data);
  const n = keys.length;
  const angle = (i) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt = (i, scale) => ({
    x: cx + r * scale * Math.cos(angle(i)),
    y: cy + r * scale * Math.sin(angle(i)),
  });
  const gridPts = (s) => keys.map((_, i) => `${pt(i, s).x},${pt(i, s).y}`).join(' ');
  const dataPts = keys.map((k, i) => {
    const p = pt(i, data[k] / 100);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: '180px' }}>
      {[0.25, 0.5, 0.75, 1].map(s => (
        <polygon key={s} points={gridPts(s)} fill="none" stroke="var(--border)" strokeWidth="0.8" />
      ))}
      {keys.map((_, i) => {
        const p = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth="0.8" />;
      })}
      <polygon points={dataPts} fill="rgba(26,92,56,0.18)" stroke="var(--primary)" strokeWidth="1.5" />
      {keys.map((k, i) => {
        const p = pt(i, data[k] / 100);
        const lp = pt(i, 1.18);
        return (
          <g key={k}>
            <circle cx={p.x} cy={p.y} r="3" fill="var(--primary)" />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: '8px', fill: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
              {k}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ══════════════════════════════════════════════════════════════
   RESULT ANALYSIS
══════════════════════════════════════════════════════════════ */
const ResultAnalysis = () => {
  const [candidates, setCandidates] = useState(candidateStore.getAll());
  const [expanded,   setExpanded]   = useState(null);
  const [sortBy,     setSortBy]     = useState('overall');

  useEffect(() => {
    return candidateStore.subscribe(() => setCandidates(candidateStore.getAll()));
  }, []);

  // Attach mock scores to each candidate (deterministic)
  const results = useMemo(() =>
    candidates.map(c => ({ ...c, ...mockScores(c) })),
    [candidates]
  );

  const sorted = useMemo(() =>
    [...results].sort((a, b) =>
      sortBy === 'overall' ? b.overall - a.overall :
      sortBy === 'cvScore' ? b.match - a.match :
      a.name.localeCompare(b.name)
    ),
    [results, sortBy]
  );

  const avgEmotion = results.length
    ? Math.round(results.reduce((s, r) => s + r.emotion.score, 0) / results.length)
    : 0;
  const avgVoice = results.length
    ? Math.round(results.reduce((s, r) => s + (100 - r.voice.score), 0) / results.length)
    : 0;
  const recommended = results.filter(r => r.overall >= 78).length;
  const topScore = results.length ? Math.max(...results.map(r => r.overall)) : 0;

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sort:</span>
          {[['overall','Overall'],['cvScore','CV Score'],['name','Name']].map(([k, l]) => (
            <button key={k} onClick={() => setSortBy(k)} style={{
              padding: '0.35rem 0.75rem', borderRadius: 'var(--r-sm)',
              fontSize: '0.78rem', fontWeight: '600',
              background: sortBy === k ? 'var(--primary)' : 'var(--bg-elevated)',
              color: sortBy === k ? '#fff' : 'var(--text-secondary)',
              border: sortBy === k ? 'none' : '1px solid var(--border)',
              transition: 'var(--transition)',
            }}>{l}</button>
          ))}
          <button className="btn-ghost" style={{ fontSize: '0.8rem' }}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <SummaryCard icon={Users}    label="Candidates"      value={results.length}  color="var(--primary)" />
        <SummaryCard icon={Star}     label="Top Score"       value={`${topScore}%`}  color="#22c55e" />
        <SummaryCard icon={Smile}    label="Avg Emotion"     value={`${avgEmotion}%`} color="#3b82f6" />
        <SummaryCard icon={Mic}      label="Avg Voice Calm"  value={`${avgVoice}%`}  color="#f59e0b" />
        <SummaryCard icon={Brain}    label="Recommended"     value={recommended}     color="var(--primary)" />
      </div>

      {/* Empty state */}
      {results.length === 0 && (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No candidates yet. Upload and parse CVs to see results here.
          </p>
        </div>
      )}

      {/* Result cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {sorted.map((r, rank) => (
          <ResultCard
            key={r.id}
            result={r}
            rank={rank + 1}
            expanded={expanded === r.id}
            onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
          />
        ))}
      </div>

      {/* Radar comparison */}
      {results.length > 0 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>Candidate Comparison</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {sorted.slice(0, 6).map(r => (
              <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
                <RadarChart data={{
                  CV:      r.match,
                  Emotion: r.emotion.score,
                  Voice:   100 - r.voice.score,
                  Overall: r.overall,
                  Fit:     Math.round((r.match + r.overall) / 2),
                }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: '700' }}>{r.name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Summary card ─────────────────────────────────────────────── */
const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className="card card-lift" style={{ padding: '1rem 1.25rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</p>
      <div style={{ width: '28px', height: '28px', borderRadius: 'var(--r-sm)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={14} color={color} />
      </div>
    </div>
    <p style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1, color }}>{value}</p>
  </div>
);

/* ── Result card ──────────────────────────────────────────────── */
const ResultCard = ({ result: r, rank, expanded, onToggle }) => (
  <div className="card card-interactive" style={{ overflow: 'hidden' }}>
    <div onClick={onToggle} style={{
      padding: '1.1rem 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      cursor: 'pointer', flexWrap: 'wrap',
    }}>
      {/* Rank */}
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%',
        background: rank === 1 ? 'var(--primary)' : 'var(--bg-elevated)',
        border: rank === 1 ? 'none' : '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.68rem', fontWeight: '800',
        color: rank === 1 ? '#fff' : 'var(--text-muted)', flexShrink: 0,
      }}>#{rank}</div>

      {/* Avatar */}
      <div style={{
        width: '40px', height: '40px', borderRadius: 'var(--r-md)',
        background: r.gradient || 'linear-gradient(135deg,#1a5c38,#22c55e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.78rem', fontWeight: '800', color: '#fff', flexShrink: 0,
      }}>{r.initials}</div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: '140px' }}>
        <p style={{ fontWeight: '700', fontSize: '0.88rem' }}>{r.name}</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.role} · {r.experience}</p>
      </div>

      {/* Score pills */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="hide-mobile">
        <ScorePill label="CV"      score={r.match}          color="var(--primary)" />
        <ScorePill label="Emotion" score={r.emotion.score}  color={r.emotion.color} />
        <ScorePill label="Voice"   score={100-r.voice.score} color={r.voice.color} />
      </div>

      {/* Overall ring */}
      <ScoreRing score={r.overall} size={48} stroke={5}
        color={r.overall >= 88 ? '#22c55e' : r.overall >= 78 ? 'var(--primary)' : '#f59e0b'} />

      {/* Verdict */}
      <span className="badge hide-mobile" style={{ background: r.verdictBg, color: r.verdictColor, border: `1px solid ${r.verdictColor}30` }}>
        {r.verdict}
      </span>

      <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </div>
    </div>

    {/* Expanded */}
    {expanded && (
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '1.25rem 1.5rem',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: '1.5rem',
        background: 'var(--bg-elevated)',
      }}>
        {/* Score breakdown */}
        <div>
          <SectionLabel>Score Breakdown</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { label: 'CV Match',      score: r.match,           color: 'var(--primary)' },
              { label: 'Emotion',       score: r.emotion.score,   color: r.emotion.color },
              { label: 'Voice Calm',    score: 100-r.voice.score, color: r.voice.color },
              { label: 'Overall',       score: r.overall,         color: r.overall >= 88 ? '#22c55e' : 'var(--primary)' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.78rem' }}>{s.label}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: s.color }}>{s.score}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill-enter" style={{ width: `${s.score}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & concerns */}
        <div>
          <SectionLabel>Strengths</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
            {r.strengths.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s}</span>
              </div>
            ))}
          </div>
          {r.concerns.length > 0 && (
            <>
              <SectionLabel>Concerns</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {r.concerns.map(c => (
                  <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <AlertTriangle size={13} color="var(--warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Behavioural */}
        <div>
          <SectionLabel>Behavioural Summary</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <BRow label="Dominant Emotion" value={r.emotion.dominant} color={r.emotion.color} />
            <BRow label="Voice Stress"     value={r.voice.stress}    color={r.voice.color} />
            <BRow label="Experience"       value={r.experience}      color="var(--text-secondary)" />
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.45rem 0.875rem', borderRadius: 'var(--r-md)',
            background: r.verdictBg, color: r.verdictColor,
            border: `1px solid ${r.verdictColor}30`,
            fontSize: '0.8rem', fontWeight: '700',
          }}>
            {r.overall >= 88 ? <CheckCircle2 size={13} /> : <TrendingUp size={13} />}
            {r.verdict}
          </span>
        </div>
      </div>
    )}
  </div>
);

const SectionLabel = ({ children }) => (
  <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
    {children}
  </p>
);

const ScorePill = ({ label, score, color }) => (
  <div style={{ textAlign: 'center' }}>
    <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '1px' }}>{label}</p>
    <p style={{ fontSize: '0.88rem', fontWeight: '800', color, letterSpacing: '-0.03em' }}>{score}%</p>
  </div>
);

const BRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontSize: '0.78rem', fontWeight: '700', color }}>{value}</span>
  </div>
);

export default ResultAnalysis;
