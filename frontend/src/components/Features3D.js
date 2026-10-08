import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Features3D
 * Represents each platform feature using a small elegant 3D object / abstract cultural symbol.
 * On hover:
 * - object gently rotates with 3D depth
 * - background subtly changes to warm parchment glow
 * - feature title becomes highlighted with terracotta/forest accent
 */
export default function Features3D() {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const features = [
    {
      title: 'Tell Your Story',
      desc: 'Voice-driven oral preservation with narrative node suggestions and branching storylines.',
      to: '/storyteller',
      tag: 'Acoustic Archive',
      symbol: (isHovered) => (
        <svg
          width="44"
          height="44"
          viewBox="0 0 50 50"
          fill="none"
          style={{
            transform: isHovered ? 'rotate(8deg) scale(1.08)' : 'rotate(0deg) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Brass Diya Base */}
          <ellipse cx="25" cy="38" rx="16" ry="6" fill="#c99738" stroke="#a07525" strokeWidth="1" />
          <path d="M12 36C12 30 25 24 25 24C25 24 38 30 38 36Z" fill="#b85d34" opacity="0.9" />
          {/* Flickering Flame */}
          <path
            d="M25 10C27 16 30 19 28 24C26 26 24 26 22 24C20 19 23 16 25 10Z"
            fill="#e8760a"
            style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}
          />
          <circle cx="25" cy="18" r="3" fill="#ffdf79" />
          {/* Subtle Acoustic Voice Waves */}
          <path d="M38 18C41 21 41 27 38 30" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" opacity={isHovered ? 1 : 0.4} />
          <path d="M43 14C48 19 48 29 43 34" stroke="var(--terracotta)" strokeWidth="1.5" strokeLinecap="round" opacity={isHovered ? 0.9 : 0.25} />
        </svg>
      )
    },
    {
      title: 'Listen & Explore',
      desc: 'Multilingual oral narration across 12 Indian languages with synchronized text and emotion synthesis.',
      to: '/listener',
      tag: '12 Languages',
      symbol: (isHovered) => (
        <svg
          width="44"
          height="44"
          viewBox="0 0 50 50"
          fill="none"
          style={{
            transform: isHovered ? 'rotate(-6deg) scale(1.08)' : 'rotate(0deg) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Open Manuscript Book */}
          <path d="M10 36C16 33 24 33 24 36L24 16C24 16 16 13 10 16Z" fill="#fdfaf3" stroke="var(--forest-green)" strokeWidth="1.2" />
          <path d="M40 36C34 33 26 33 26 36L26 16C26 16 34 13 40 16Z" fill="#fdfaf3" stroke="var(--forest-green)" strokeWidth="1.2" />
          {/* Gold Bookmark */}
          <line x1="25" y1="14" x2="25" y2="38" stroke="var(--gold)" strokeWidth="2" />
          {/* Audio Wave Arc Above Book */}
          <path d="M15 12C20 8 30 8 35 12" stroke="var(--terracotta)" strokeWidth="1.5" strokeLinecap="round" opacity={isHovered ? 1 : 0.5} />
        </svg>
      )
    },
    {
      title: 'Story Trails',
      desc: 'Geo-tagged geographical folklore, songlines, and regional legends from every corner of India.',
      to: '/listener',
      tag: 'Living Geography',
      symbol: (isHovered) => (
        <svg
          width="44"
          height="44"
          viewBox="0 0 50 50"
          fill="none"
          style={{
            transform: isHovered ? 'rotate(12deg) scale(1.08)' : 'rotate(0deg) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Vintage Compass Outer Ring */}
          <circle cx="25" cy="25" r="16" stroke="var(--forest-green)" strokeWidth="1.5" fill="rgba(201, 151, 56, 0.08)" />
          <circle cx="25" cy="25" r="12" stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 2" />
          {/* Compass Pointer Needle */}
          <polygon points="25,12 28,25 25,23 22,25" fill="var(--terracotta)" />
          <polygon points="25,38 28,25 25,27 22,25" fill="var(--sage)" />
          <circle cx="25" cy="25" r="2.5" fill="#ffffff" stroke="var(--forest-green)" strokeWidth="1" />
        </svg>
      )
    },
    {
      title: 'Community Vault',
      desc: 'A living archive of mythology, resistance memoirs, migration diaries, and indigenous oral lore.',
      to: '/vault',
      tag: 'Sacred Archive',
      symbol: (isHovered) => (
        <svg
          width="44"
          height="44"
          viewBox="0 0 50 50"
          fill="none"
          style={{
            transform: isHovered ? 'translateY(-2px) scale(1.06)' : 'none',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Handcrafted Heritage Archive Chest */}
          <rect x="10" y="20" width="30" height="20" rx="3" fill="#1b3b2b" stroke="#0e2017" strokeWidth="1" />
          <path d="M10 20C10 14 40 14 40 20Z" fill="#b85d34" stroke="#924420" strokeWidth="1" />
          {/* Brass Filigree Brackets */}
          <circle cx="25" cy="28" r="3.5" fill="#c99738" stroke="#a07525" strokeWidth="1" />
          <line x1="25" y1="28" x2="25" y2="33" stroke="#a07525" strokeWidth="1.5" />
          <line x1="12" y1="20" x2="38" y2="20" stroke="#c99738" strokeWidth="1" />
        </svg>
      )
    },
    {
      title: 'Quests & Badges',
      desc: 'Earn karma, test cultural heritage knowledge, unlock badges, and become a recognized archivist.',
      to: '/gamification',
      tag: 'Cultural Custodianship',
      symbol: (isHovered) => (
        <svg
          width="44"
          height="44"
          viewBox="0 0 50 50"
          fill="none"
          style={{
            transform: isHovered ? 'rotate(10deg) scale(1.08)' : 'rotate(0deg) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Temple Laurel / Medallion */}
          <circle cx="25" cy="22" r="14" fill="rgba(201, 151, 56, 0.15)" stroke="var(--gold)" strokeWidth="1.5" />
          <circle cx="25" cy="22" r="10" fill="none" stroke="var(--gold-dark)" strokeWidth="1" strokeDasharray="3 2" />
          <polygon points="25,14 27.5,19 33,19.5 29,23.5 30,29 25,26 20,29 21,23.5 17,19.5 22.5,19" fill="var(--gold)" />
          {/* Hanging Ribbon Tails */}
          <path d="M21 34L17 44L23 41L25 44" fill="var(--terracotta)" />
          <path d="M29 34L33 44L27 41L25 44" fill="var(--forest-green)" />
        </svg>
      )
    },
    {
      title: 'Offline Heritage Packs',
      desc: 'Download regional audio story packs for internet-free listening, syncing seamlessly when online.',
      to: '/vault',
      tag: 'Zero Connectivity',
      symbol: (isHovered) => (
        <svg
          width="44"
          height="44"
          viewBox="0 0 50 50"
          fill="none"
          style={{
            transform: isHovered ? 'rotate(-6deg) scale(1.08)' : 'rotate(0deg) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Tied Palm Leaf Manuscript Bundle */}
          <rect x="11" y="16" width="28" height="7" rx="2" fill="#faf0da" stroke="var(--sage)" strokeWidth="1" />
          <rect x="11" y="23" width="28" height="7" rx="2" fill="#f5e8cc" stroke="var(--sage)" strokeWidth="1" />
          <rect x="11" y="30" width="28" height="7" rx="2" fill="#eeddb8" stroke="var(--sage)" strokeWidth="1" />
          {/* Silk Tie Cord */}
          <line x1="20" y1="13" x2="20" y2="40" stroke="var(--terracotta)" strokeWidth="1.5" />
          <line x1="30" y1="13" x2="30" y2="40" stroke="var(--terracotta)" strokeWidth="1.5" />
        </svg>
      )
    }
  ];

  return (
    <section style={{ marginBottom: '4.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            color: 'var(--terracotta)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 600
          }}
        >
          • LIVING ARCHIVE ARCHITECTURE
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
            color: 'var(--forest-green)',
            marginTop: '0.4rem',
            marginBottom: '0.5rem',
            fontWeight: 700
          }}
        >
          Features for Storytellers and Listeners
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--charcoal-muted)',
            maxWidth: 600,
            margin: '0 auto',
            fontFamily: 'var(--font-editorial)',
            fontStyle: 'italic'
          }}
        >
          Each feature is crafted as a quiet, sacred vessel for safeguarding India's oral memories.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {features.map((f, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={f.title}
              onClick={() => navigate(f.to)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="editorial-card-3d"
              style={{
                cursor: 'pointer',
                background: isHovered
                  ? 'linear-gradient(135deg, var(--parchment-card) 0%, var(--parchment-warm) 100%)'
                  : 'var(--bg-card)',
                borderColor: isHovered ? 'var(--terracotta)' : 'var(--border)',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.75rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  {/* 3D Culturally Inspired Object */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 'var(--radius-md)',
                      background: isHovered ? 'var(--bg-elevated)' : 'var(--bg)',
                      border: '1px solid var(--border-delicate)',
                      boxShadow: isHovered ? 'var(--shadow-md)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.35s ease'
                    }}
                  >
                    {f.symbol(isHovered)}
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      color: isHovered ? 'var(--terracotta)' : 'var(--charcoal-faint)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      background: 'var(--parchment-subtle)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '12px'
                    }}
                  >
                    {f.tag}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.28rem',
                    color: isHovered ? 'var(--terracotta)' : 'var(--forest-green)',
                    marginBottom: '0.55rem',
                    fontWeight: 700,
                    transition: 'color 0.25s ease'
                  }}
                >
                  {f.title}
                </h3>

                <p
                  style={{
                    color: 'var(--charcoal-muted)',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    margin: 0
                  }}
                >
                  {f.desc}
                </p>
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-delicate)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: isHovered ? 'var(--terracotta)' : 'var(--charcoal-faint)',
                  transition: 'color 0.2s ease'
                }}
              >
                <span>Explore Feature →</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
