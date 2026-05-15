import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { API_URL, getHeaders } from '../config';

const EvaluationMetrics = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/eval/metrics`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setReport(data.data);
      else throw new Error(data.error || 'Eval failed');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="card animate-fade-up" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Extraction Evaluation (P/R/F1)</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              NLTK-enhanced pipeline vs labeled fixtures
            </p>
          </div>
        </div>
        <button className="btn-outline" type="button" onClick={load} disabled={loading} style={{ fontSize: '0.8rem' }}>
          {loading ? <Loader2 size={14} /> : <RefreshCw size={14} />}
          Run evaluation
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
      )}

      {report && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-elevated)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Skills F1</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(report.skills.f1 * 100).toFixed(1)}%</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                P {(report.skills.precision * 100).toFixed(1)}% · R {(report.skills.recall * 100).toFixed(1)}%
              </p>
            </div>
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-elevated)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Email accuracy</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(report.email.accuracy * 100).toFixed(0)}%</p>
            </div>
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-elevated)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Macro F1</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(report.macroF1 * 100).toFixed(1)}%</p>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Per-sample ({report.samples} fixtures)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {report.perSample.map(s => (
              <div key={s.id} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', minWidth: '80px' }}>{s.id}</span>
                <span style={{ fontSize: '0.78rem' }}>Skills F1 {(s.skills.f1 * 100).toFixed(0)}%</span>
                {s.emailCorrect && <CheckCircle2 size={14} color="var(--success)" />}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Exp {s.experienceCorrect ? '✓' : '✗'} · Edu {s.educationCorrect ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluationMetrics;
