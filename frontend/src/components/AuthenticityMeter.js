import React, { useMemo } from 'react';

const HISTORICAL_KEYWORDS = ['chola', 'mughal', 'maurya', 'gupta', 'maratha', 'ashoka', 'akbar', 'vijayanagara', 'british raj', 'partition', 'gandhi', 'rajput', 'vedic', 'harappan', 'pala', 'chera', 'pandya', 'satavahana'];

export default function AuthenticityMeter({ content = '', tags = [] }) {
  const score = useMemo(() => {
    const text = (content + ' ' + tags.join(' ')).toLowerCase();
    let base = 55;
    if (content.length > 100) base += 5;
    if (content.length > 500) base += 5;
    HISTORICAL_KEYWORDS.forEach(kw => { if (text.includes(kw)) base += 3; });
    if (tags.length > 0) base += 2;
    if (tags.length > 2) base += 3;
    return Math.min(99, base);
  }, [content, tags]);

  const getColor = (s) => {
    if (s >= 85) return 'var(--jade)';
    if (s >= 70) return 'var(--gold)';
    return 'var(--terracotta)';
  };

  const getLabel = (s) => {
    if (s >= 90) return 'Highly Authentic';
    if (s >= 80) return 'Well Researched';
    if (s >= 70) return 'Reasonably Authentic';
    if (s >= 60) return 'Needs More Context';
    return 'Add Historical Details';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>🏺 Cultural Authenticity</h3>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.4rem', color: getColor(score) }}>
          {score}
        </span>
      </div>
      <div className="authenticity-bar" style={{ marginBottom: '0.5rem' }}>
        <div 
          className={`authenticity-fill ${score >= 80 ? 'shimmer-active' : ''}`} 
          style={{ 
            width: `${score}%`, 
            transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', 
            background: `linear-gradient(90deg, var(--jade), ${getColor(score)})` 
          }} 
        />
      </div>
      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        {getLabel(score)} · Include historical terms & regional details to improve score
      </p>
    </div>
  );
}
