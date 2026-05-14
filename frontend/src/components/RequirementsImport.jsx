import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Upload, Plus, X, CheckCircle2, 
  Loader2, Briefcase, Zap, Search, ArrowRight,
  ClipboardList, AlertCircle
} from 'lucide-react';
import { requirementsStore } from '../utils/requirementsStore';
import { API_URL, getHeaders } from '../config';

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'AWS', 'Neo4j', 'PostgreSQL', 
  'TypeScript', 'Docker', 'Kubernetes', 'NLP', 'LLMs', 'Java', 'Go'
];

const RequirementsImport = ({ onComplete }) => {
  const [step, setStep] = useState('input'); // 'input' | 'extracting' | 'review'
  const [text, setText] = useState('');
  const [extracted, setExtracted] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    requirementsStore.fetchFromBackend();
    return requirementsStore.subscribe(() => setExtracted(null)); // Refresh on store change
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a full implementation, you'd extract text from the file first.
    // For now, we'll use the file name as a hint.
    startExtraction(`Job Description for ${file.name.replace(/\.[^/.]+$/, "")}`, `Requirements for ${file.name}`);
  };

  const startExtraction = async (titleHint = '', customText = '') => {
    const inputText = customText || text;
    if (!inputText && !titleHint) return;
    setStep('extracting');
    
    try {
      const res = await fetch(`${API_URL}/api/requirements`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text: inputText, title: titleHint })
      });
      const data = await res.json();
      if (data.success) {
        setExtracted(data.data);
        setStep('review');
      }
    } catch (err) {
      console.error("Extraction failed:", err);
      setStep('input');
    }
  };

  const saveRequirement = async () => {
    await requirementsStore.add(extracted);
    if (onComplete) onComplete();
  };

  const addSkill = (skill) => {
    if (!skill || extracted.skills.includes(skill)) return;
    setExtracted({ ...extracted, skills: [...extracted.skills, skill] });
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        
        {/* ── Main Input Area ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {step === 'input' && (
            <div className="card animate-scale-in" style={{ padding: '1.5rem' }}>
              <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Paste Job Description or Requirements
              </p>
              <textarea 
                className="input"
                placeholder="Example: We are looking for a Senior Frontend Developer with 5+ years of experience in React and TypeScript..."
                style={{ 
                  width: '100%', minHeight: '240px', resize: 'none', 
                  fontSize: '0.875rem', lineHeight: '1.6', padding: '1rem' 
                }}
                value={text}
                onChange={e => setText(e.target.value)}
              />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                <button 
                  className="btn-primary" 
                  disabled={!text.trim()}
                  onClick={() => startExtraction()}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Zap size={15} /> Extract Requirements
                </button>
                <button 
                  className="btn-outline" 
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={15} /> Upload JD
                </button>
                <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
              </div>
            </div>
          )}

          {step === 'extracting' && (
            <div className="card" style={{ 
              height: '400px', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center', gap: '1.5rem' 
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  border: '3px solid var(--primary-subtle)', borderTopColor: 'var(--primary)',
                  animation: 'spin 1.2s linear infinite'
                }} />
                <Zap size={32} color="var(--primary)" style={{ 
                  position: 'absolute', top: '50%', left: '50%', 
                  transform: 'translate(-50%, -50%)', animation: 'pulse-dot 2s ease-in-out infinite' 
                }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>AI is Analysing</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Identifying key skills, roles, and experience levels...</p>
              </div>
            </div>
          )}

          {step === 'review' && extracted && (
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem' }}>Review Requirements</h3>
                  <button className="btn-ghost" onClick={() => setStep('input')} style={{ fontSize: '0.75rem' }}>
                    <X size={14} /> Start over
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <InputGroup label="Job Title" value={extracted.title} onChange={v => setExtracted({...extracted, title: v})} icon={<Briefcase size={14} />} />
                  <InputGroup label="Core Role" value={extracted.role} onChange={v => setExtracted({...extracted, role: v})} icon={<Search size={14} />} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Required Skills
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {extracted.skills.map(skill => (
                      <span key={skill} className="badge badge-green" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        {skill} <X size={12} style={{ marginLeft: '4px', cursor: 'pointer' }} onClick={() => setExtracted({...extracted, skills: extracted.skills.filter(s => s !== skill)})} />
                      </span>
                    ))}
                    <button 
                      className="skill-tag" 
                      style={{ borderStyle: 'dashed' }}
                      onClick={() => {
                        const s = prompt("Enter skill name:");
                        if (s) addSkill(s);
                      }}
                    >
                      <Plus size={12} /> Add Skill
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    AI Summary
                  </p>
                  <textarea 
                    className="input" 
                    value={extracted.summary}
                    onChange={e => setExtracted({...extracted, summary: e.target.value})}
                    style={{ width: '100%', minHeight: '80px', resize: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} onClick={saveRequirement}>
                  <CheckCircle2 size={16} /> Finalise & Match Candidates
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar: Tips & History ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
              <AlertCircle size={18} color="var(--primary)" />
              <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>Pro Tips</p>
            </div>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Include specific tech stacks for better matching.</li>
              <li style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Mention seniority levels (e.g., Senior, Lead).</li>
              <li style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Highlight non-negotiable certifications.</li>
            </ul>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Recent Requirements
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requirementsStore.getAll().map(req => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: 'var(--r-sm)', 
                    background: 'var(--primary-subtle)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center' 
                  }}>
                    <ClipboardList size={14} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.title}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{req.addedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

const InputGroup = ({ label, value, onChange, icon }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      {icon} {label}
    </p>
    <input 
      className="input"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ fontSize: '0.85rem' }}
    />
  </div>
);

export default RequirementsImport;
