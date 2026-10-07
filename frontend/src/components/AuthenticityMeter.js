import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const HISTORICAL_KEYWORDS = ['chola', 'mughal', 'maurya', 'gupta', 'maratha', 'ashoka', 'akbar', 'vijayanagara', 'british raj', 'partition', 'gandhi', 'rajput', 'vedic', 'harappan', 'pala', 'chera', 'pandya', 'satavahana'];

export default function AuthenticityMeter({ content = '', tags = [] }) {
  const matchedKeywords = useMemo(() => {
    const text = (content + ' ' + tags.join(' ')).toLowerCase();
    return HISTORICAL_KEYWORDS.filter(kw => text.includes(kw));
  }, [content, tags]);

  const level = useMemo(() => {
    if (matchedKeywords.length >= 2 || (tags.length >= 2 && matchedKeywords.length >= 1)) {
      return { label: 'Extensive Heritage References', badge: 'High Depth', color: 'var(--jade)' };
    }
    if (matchedKeywords.length === 1 || tags.length >= 1) {
      return { label: 'Regional Oral Context Present', badge: 'Regional Match', color: 'var(--gold)' };
    }
    return { label: 'Community Folk Tale', badge: 'Community Archive', color: 'var(--terracotta)' };
  }, [matchedKeywords, tags]);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: 6, color: level.color }} />
          Heritage Context & Archival Grounding
        </h3>
        <span className="badge" style={{ background: `${level.color}22`, color: level.color, border: `1px solid ${level.color}44`, fontWeight: 600 }}>
          {level.badge}
        </span>
      </div>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <strong>{level.label}:</strong> Story analyzed for regional terminology and traditional cultural markers.
      </p>
      {matchedKeywords.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Identified traditions:</span>
          {matchedKeywords.map(kw => (
            <span key={kw} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', textTransform: 'capitalize' }}>
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
