import React from 'react';
import { generateWhatIf } from '../services/mockAI';

export default function WhatIfModal({ content, onClose, onApply }) {
  const alternates = generateWhatIf(content);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>🌀 What If? Alternate History</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Explore alternate paths your story could have taken. Choose one to append to your narrative.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {alternates.map((alt, i) => (
            <div key={i} className={`card card-interactive slide-in stagger-${i + 1}`} style={{ border: '1.5px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--terracotta)' }}>
                  {i === 0 ? '☮️' : '💔'} {alt.title}
                </h3>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                {alt.text}
              </p>
              <button onClick={() => onApply(alt.text)} className="btn btn-primary btn-sm">
                Apply This Ending
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
