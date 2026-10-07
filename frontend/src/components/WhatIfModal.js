import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { generateWhatIf } from '../services/mockAI';

export default function WhatIfModal({ content, onClose, onApply }) {
  const alternates = generateWhatIf(content);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="alternate-arcs-title">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 id="alternate-arcs-title" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faRandom} style={{ marginRight: 8, color: 'var(--terracotta)' }} />
            Alternate Narrative Arcs
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close modal">✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Explore alternate historical turns and narrative pathways. Select a path to append it to your story canvas.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {alternates.map((alt, i) => (
            <div key={i} className={`card card-interactive slide-in stagger-${i + 1}`} style={{ border: '1.5px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--terracotta)', display: 'flex', alignItems: 'center' }}>
                  <FontAwesomeIcon icon={faCodeBranch} style={{ marginRight: 6, fontSize: '0.9rem' }} />
                  {alt.title}
                </h3>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                {alt.text}
              </p>
              <button onClick={() => onApply(alt.text)} className="btn btn-primary btn-sm">
                Apply This Path
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
