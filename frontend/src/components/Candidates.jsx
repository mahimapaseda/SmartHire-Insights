import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Code, 
  Star, 
  ChevronRight, 
  Clock, 
  X, 
  MapPin, 
  GraduationCap, 
  Link as LinkIcon,
  MessageSquare
} from 'lucide-react';

const Candidates = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const candidates = [
    { 
      id: 1, 
      name: 'Sarah Chen', 
      role: 'Full Stack Engineer', 
      match: '98%', 
      skills: ['React', 'Node.js', 'Neo4j', 'Python'], 
      experience: '5 years',
      location: 'San Francisco, CA',
      education: 'M.S. Computer Science, Stanford',
      email: 'sarah.chen@example.com',
      summary: 'Experienced engineer specializing in high-performance web applications and graph database modeling. Strong background in React ecosystems and distributed systems.',
      projects: ['FinTech Analytics Engine', 'Graph-based Social CRM']
    },
    { 
      id: 2, 
      name: 'James Wilson', 
      role: 'DevOps Lead', 
      match: '92%', 
      skills: ['AWS', 'Docker', 'Kubernetes', 'Python'], 
      experience: '8 years',
      location: 'Austin, TX',
      education: 'B.S. Information Technology, UT Austin',
      email: 'j.wilson@example.com',
      summary: 'Automation specialist focused on cloud infrastructure scalability and security. Expert in CI/CD pipeline optimization and container orchestration.',
      projects: ['Global CDN Migration', 'Zero-Downtime Deployment Suite']
    },
    { 
      id: 3, 
      name: 'Elena Rodriguez', 
      role: 'AI Researcher', 
      match: '95%', 
      skills: ['Python', 'PyTorch', 'NLP', 'TensorFlow'], 
      experience: '4 years',
      location: 'Boston, MA',
      education: 'Ph.D. Artificial Intelligence, MIT',
      email: 'elena.r@example.com',
      summary: 'Research scientist dedicated to advancing Natural Language Processing. Published author in major AI conferences with a focus on transformer architectures.',
      projects: ['Multi-modal LLM Evaluation', 'Sentiment Analysis at Scale']
    },
  ];

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="candidates-list animate-fade">
      {/* Header & Filter */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Candidate Intelligence Pool</h2>
          <p style={{ color: 'var(--text-muted)' }}>AI-driven profiling based on parsed CV metadata.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Filter by skill, name or role..." 
            className="glass"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              color: 'white',
              outline: 'none',
              background: 'rgba(255,255,255,0.02)',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredCandidates.length > 0 ? filteredCandidates.map(c => (
          <div key={c.id} onClick={() => setSelectedCandidate(c)} className="glass glass-hover" style={{
            padding: '1.5rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            cursor: 'pointer'
          }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '14px', 
              flexShrink: 0,
              background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.25rem', 
              fontWeight: '600' 
            }}>
              {c.name.charAt(0)}
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ marginBottom: '0.25rem' }}>{c.name}</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Briefcase size={14} /> {c.role}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {c.experience}</span>
              </div>
            </div>

            <div style={{ gap: '0.5rem', display: 'flex', flexWrap: 'wrap' }} className="skill-tags mobile-hidden">

              {c.skills.slice(0, 3).map(s => (
                <span key={s} style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px', 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)'
                }}>{s}</span>
              ))}
              {c.skills.length > 3 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{c.skills.length - 3}</span>}
            </div>

            <div style={{ textAlign: 'right', minWidth: '80px' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#22c55e' }}>{c.match}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match Score</p>
            </div>

            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        )) : (
          <div className="glass" style={{ padding: '4rem', borderRadius: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No candidates match your criteria.
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {selectedCandidate && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--modal-overlay)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setSelectedCandidate(null)}>
          <div className="glass animate-fade" style={{
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            borderRadius: '28px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700' }}>
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{selectedCandidate.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{selectedCandidate.role}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="glass-hover" style={{ padding: '0.5rem', borderRadius: '10px', background: 'transparent' }}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mobile-grid-1" style={{ padding: '2rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                    <Star size={18} /> Executive Summary
                  </h4>
                  <p style={{ lineHeight: '1.6', color: 'var(--text-main)' }}>{selectedCandidate.summary}</p>
                </section>

                <section>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                    <Briefcase size={18} /> Key Projects
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedCandidate.projects.map(p => (
                      <div key={p} className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}>{p}</div>
                    ))}
                  </div>
                </section>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                  <h4 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-main)', fontWeight: '600' }}>Intelligence Tags</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedCandidate.skills.map(s => (
                      <span key={s} style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.4rem 0.9rem', 
                        borderRadius: '20px', 
                        background: 'var(--primary)', 
                        color: 'white',
                        fontWeight: '500',
                        boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)'
                      }}>{s}</span>
                    ))}
                  </div>

                </section>

                <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <InfoRow icon={<MapPin size={16} />} label={selectedCandidate.location} />
                  <InfoRow icon={<GraduationCap size={16} />} label={selectedCandidate.education} />
                  <InfoRow icon={<Mail size={16} />} label={selectedCandidate.email} />
                </section>

                <button className="primary-btn" style={{ width: '100%', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} /> Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
    <div style={{ color: 'var(--primary)' }}>{icon}</div>
    <span>{label}</span>
  </div>
);

export default Candidates;
