import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Users, Brain, Share2, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

import { DEMO_CREDENTIALS } from '../config';

/* ── Logo mark ─────────────────────────────────────────────── */
const LogoMark = ({ size = 40, dark = false }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill={dark ? 'rgba(255,255,255,0.12)' : '#1a5c38'} />
    <circle cx="20" cy="20" r="12" stroke={dark ? '#fff' : '#fff'} strokeWidth="2" fill="none" />
    <circle cx="20" cy="20" r="5.5" fill={dark ? '#fff' : '#fff'} />
    <path d="M20 8 Q24.5 14 20 20 Q15.5 14 20 8Z" fill="#4ade80" opacity="0.85" />
  </svg>
);

/* ── Feature pill shown on left panel ──────────────────────── */
const FeaturePill = ({ icon: Icon, label }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.625rem',
    padding: '0.6rem 1rem',
    borderRadius: '99px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    width: 'fit-content',
  }}>
    <div style={{
      width: '26px', height: '26px', borderRadius: '50%',
      background: 'rgba(74,222,128,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={13} color="#4ade80" />
    </div>
    <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  </div>
);

/* ── Stat bubble shown on left panel ────────────────────────── */
const StatBubble = ({ value, label }) => (
  <div style={{
    padding: '1rem 1.25rem',
    borderRadius: 'var(--r-lg)',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(8px)',
    textAlign: 'center',
    minWidth: '90px',
  }}>
    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.3rem', fontWeight: '500' }}>{label}</p>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════════ */
const Login = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.key) {
        sessionStorage.setItem('sh_auth', '1');
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Use the demo account below.');
        setLoading(false);
      }
    }, 750);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-page)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Theme toggle (top-right) ── */}
      <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 50 }}>
        <ThemeToggle />
      </div>

      {/* ════════════════════════════════
          LEFT PANEL — dark green brand
      ════════════════════════════════ */}
      <div
        className="login-left"
        style={{
          width: '48%',
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #1a5c38 0%, #0d3320 55%, #071a10 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(34,197,94,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(34,197,94,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        {/* Top: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <div className="animate-float">
            <LogoMark size={38} dark />
          </div>
          <div>
            <p style={{ fontWeight: '800', fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>SmartHire</p>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>Insights Platform</p>
          </div>
        </div>

        {/* Middle: headline + features */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2rem', padding: '2rem 0' }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: '800',
              color: '#fff',
              lineHeight: '1.15',
              letterSpacing: '-0.04em',
              marginBottom: '1rem',
            }}>
              Hire smarter<br />
              with <span style={{ color: '#4ade80' }}>AI-powered</span><br />
              intelligence.
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.65', maxWidth: '340px' }}>
              Parse CVs, map knowledge graphs, and surface the best candidates — all in one platform.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }} className="stagger">
            <FeaturePill icon={Brain}       label="AI-powered CV parsing & scoring" />
            <FeaturePill icon={Share2}      label="Neo4j knowledge graph extraction" />
            <FeaturePill icon={Users}       label="Candidate intelligence pool" />
            <FeaturePill icon={CheckCircle2} label="Real-time match confidence" />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }} className="stagger">
            <StatBubble value="128+"  label="CVs Parsed" />
            <StatBubble value="94%"   label="Match Rate" />
            <StatBubble value="2.4k"  label="Graph Nodes" />
          </div>
        </div>

        {/* Bottom: testimonial */}
        <div style={{
          position: 'relative',
          padding: '1.25rem',
          borderRadius: 'var(--r-lg)',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '0.875rem', fontStyle: 'italic' }}>
            "SmartHire cut our screening time by 60%. The graph view alone is worth it."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: '800', color: '#fff',
            }}>M</div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff' }}>Mahima</p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>Lead Recruiter, SmartHire</p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          RIGHT PANEL — form
      ════════════════════════════════ */}
      <div
        className="login-right"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          background: 'var(--bg-surface)',
          position: 'relative',
        }}
      >
        {/* Subtle top-right glow */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(26,92,56,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="animate-fade-up" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>

          {/* Heading */}
          <div style={{ marginBottom: '2.25rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Sign in to your recruiter workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: '600',
                color: 'var(--text-secondary)', marginBottom: '0.45rem',
              }}>
                Corporate Email
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@smarthire.ai"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Access Key
                </label>
                <button
                  type="button"
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', fontWeight: '600' }}
                >
                  Forgot key?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', color: 'var(--text-muted)', padding: '0.2rem',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--r-sm)',
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: 'var(--danger)',
                fontSize: '0.8rem',
              }}>
                <span style={{ fontSize: '1rem' }}>⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%', justifyContent: 'center',
                padding: '0.8rem', marginTop: '0.25rem',
                fontSize: '0.9rem', fontWeight: '700',
                opacity: loading ? 0.75 : 1,
                borderRadius: 'var(--r-md)',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.9s linear infinite',
                  }} />
                  Authorizing…
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', margin: '1.75rem 0' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Demo access
            </span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          {/* Demo credentials card */}
          <div style={{
            padding: '1.125rem',
            borderRadius: 'var(--r-lg)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                  Demo Credentials
                </p>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                  <p>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Email  </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{DEMO_CREDENTIALS.email}</span>
                  </p>
                  <p>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Key  </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{DEMO_CREDENTIALS.key}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setEmail(DEMO_CREDENTIALS.email); setPassword(DEMO_CREDENTIALS.key); setError(''); }}
                style={{
                  flexShrink: 0,
                  padding: '0.45rem 0.875rem',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--primary-subtle)',
                  border: '1px solid rgba(26,92,56,0.2)',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,92,56,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-subtle)'}
              >
                Use Demo
              </button>
            </div>
          </div>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            SmartHire Insights · v1.0.0
          </p>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 860px) {
          .login-left  { display: none !important; }
          .login-right { background: var(--bg-page) !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
