import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-page" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1e293b, #020617)'
    }}>
      <div className="glass animate-fade" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '3rem',
        borderRadius: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'var(--primary)',
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 30px var(--primary-glow)'
        }}>
          <Shield size={32} color="white" />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>SmartHire Insights</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
          Intelligent CV & Interview Analysis Platform
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>
              Corporate Email
            </label>
            <input 
              type="email" 
              placeholder="mahima@smarthire.ai" 
              className="glass"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                color: 'white',
                outline: 'none',
                background: 'rgba(255,255,255,0.02)'
              }}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>
              Access Key
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="glass"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                color: 'white',
                outline: 'none',
                background: 'rgba(255,255,255,0.02)'
              }}
              required
            />
          </div>

          <button type="submit" className="primary-btn" style={{ 
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            Authorize System <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Backend secured by Anuruddha • v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Login;
