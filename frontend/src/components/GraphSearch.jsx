import React, { useEffect, useRef } from 'react';
import { Search, Zap, Share2, Filter } from 'lucide-react';

const GraphSearch = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const nodes = [];
    const links = [];
    const nodeCount = 15;

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        radius: Math.random() * 5 + 3,
        label: i === 0 ? 'Root Node' : `Entity ${i}`
      });
    }

    // Initialize links
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() > 0.8) links.push({ source: i, target: j });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw links
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      links.forEach(link => {
        const s = nodes[link.source];
        const t = nodes[link.target];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? 'var(--primary)' : 'rgba(59, 130, 246, 0.4)';
        ctx.fill();
        
        // Pulse effect for root
        if (i === 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + Math.sin(Date.now() / 200) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.stroke();
        }

        // Update positions
        node.x += node.vx;
        node.y += node.vy;

        // Bounce
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="graph-search animate-fade">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Knowledge Graph Search</h2>
          <p style={{ color: 'var(--text-muted)' }}>Explore relationship nodes between candidates, skills, and projects.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} />
            <span style={{ fontSize: '0.875rem' }}>Filters</span>
          </div>
          <button className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={16} /> Export Map
          </button>
        </div>
      </div>

      <div className="glass" style={{ 
        height: '500px', 
        borderRadius: '24px', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.2)'
      }}>
        {/* Search Bar Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: '2rem', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '90%', 
          maxWidth: '500px',
          zIndex: 10
        }}>
          <div className="glass" style={{ 
            padding: '0.75rem 1.5rem', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search entities (e.g., 'Neo4j Experts')..." 
              style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }}
            />
            <Zap size={18} color="var(--primary)" />
          </div>
        </div>

        {/* Graph Canvas */}
        <canvas 
          ref={canvasRef} 
          width={1000} 
          height={500} 
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <LegendItem color="var(--primary)" label="Candidates" />
          <LegendItem color="#8b5cf6" label="Skills" />
          <LegendItem color="#22c55e" label="Projects" />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}></div>
    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
  </div>
);

export default GraphSearch;
