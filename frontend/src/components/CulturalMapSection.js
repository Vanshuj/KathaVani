import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBookOpen, faCompass } from '@fortawesome/free-solid-svg-icons';

/**
 * CulturalMapSection
 * Interactive 3D-inspired cultural map section:
 * - Shows stories by region across warm parchment cartography
 * - Subtle glowing warm markers
 * - Hover / select displays Region name, Number of stories, Featured story
 * - Warm 3D illustration of open book + handwritten pages + cultural objects (diya, marigold, quill)
 */
export default function CulturalMapSection() {
  const navigate = useNavigate();

  const regions = [
    {
      id: 'himalayan',
      name: 'Himalayan & Trans-Himalayan Belt',
      subtext: 'Kinnaur, Spiti, Kashmir & Garhwal',
      storiesCount: 48,
      featuredTitle: 'Kinnaur Kinship Ballads',
      tradition: 'Folk Ballad',
      keeper: 'Preserved by Kinnauri Elders Council',
      x: 38,
      y: 18,
      color: '#b85d34'
    },
    {
      id: 'gangetic',
      name: 'Indo-Gangetic Heartland',
      subtext: 'Braj, Bundelkhand, Awadh & Magadh',
      storiesCount: 84,
      featuredTitle: "Rani Lakshmibai's Sacred Flame",
      tradition: 'Oral Resistance Ballad',
      keeper: 'Bundelkhand Women Collective',
      x: 48,
      y: 35,
      color: '#c99738'
    },
    {
      id: 'western',
      name: 'Western Deserts & Aravalli',
      subtext: 'Thar, Marwar, Kutch & Shekhawati',
      storiesCount: 62,
      featuredTitle: 'Desert Manganiyar Chronicles',
      tradition: 'Genealogical Songline',
      keeper: 'Manganiyar Heritage Custodians',
      x: 25,
      y: 40,
      color: '#b85d34'
    },
    {
      id: 'deccan',
      name: 'Deccan Plateau & Central Forests',
      subtext: 'Gondwana, Warli & Western Ghats',
      storiesCount: 56,
      featuredTitle: "The Warli Painter's Ancestral Map",
      tradition: 'Tribal Lore',
      keeper: 'Sundari Bai & Forest Keepers',
      x: 36,
      y: 58,
      color: '#5c7a67'
    },
    {
      id: 'malabar',
      name: 'Malabar & Southern Coastlines',
      subtext: 'Kaveri Delta, Malabar Coast & Tanjore',
      storiesCount: 72,
      featuredTitle: "The Chola Emperor's Last Monsoon",
      tradition: 'Maritime Oral History',
      keeper: 'Kaveri River Boatmen',
      x: 42,
      y: 82,
      color: '#b85d34'
    },
    {
      id: 'eastern',
      name: 'Eastern Rivers & Brahmaputra',
      subtext: 'Kalinga, Assam, Sundarbans & Manipur',
      storiesCount: 51,
      featuredTitle: 'Dharmavijaya River Edicts',
      tradition: 'Historical Folklore',
      keeper: 'Mahanadi Oral Keepers',
      x: 68,
      y: 48,
      color: '#5c7a67'
    }
  ];

  const [activeRegion, setActiveRegion] = useState(regions[4]); // Default to Malabar

  return (
    <section style={{ marginBottom: '4.5rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
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
            • REGIONAL LIVING ARCHIVE
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              color: 'var(--forest-green)',
              margin: '0.4rem 0 0',
              fontWeight: 700
            }}
          >
            Explore India’s Cultural Map
          </h2>
          <p
            style={{
              color: 'var(--charcoal-muted)',
              fontSize: '0.96rem',
              maxWidth: 580,
              marginTop: '0.4rem',
              lineHeight: 1.6
            }}
          >
            Select any cultural region to discover geographical folklore, songlines, and community-preserved histories.
          </p>
        </div>

        <button
          onClick={() => navigate('/listener')}
          className="btn btn-secondary btn-sm"
        >
          <FontAwesomeIcon icon={faCompass} /> Open Full Geographic Archive
        </button>
      </div>

      {/* Main Map & Detail Container */}
      <div
        className="editorial-card-3d"
        style={{
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          background: 'var(--bg-card)',
          alignItems: 'center'
        }}
      >
        {/* ─────────────────────────────────────────────────────────────
            LEFT: Interactive Warm Parchment Relief Map
        ────────────────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            height: 380,
            background: 'linear-gradient(135deg, var(--parchment-subtle) 0%, var(--parchment-warm) 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--clay-border)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-clay-inset)'
          }}
        >
          {/* Subtle Topographical Contour Waves */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.16 }}
            viewBox="0 0 400 400"
            fill="none"
          >
            <path d="M50 80 Q 150 40 250 90 T 380 120" stroke="var(--forest-green)" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M30 180 Q 180 140 280 200 T 390 220" stroke="var(--forest-green)" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M40 280 Q 200 240 300 300 T 370 320" stroke="var(--forest-green)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="140" stroke="var(--gold)" strokeWidth="0.8" strokeDasharray="2 4" />
          </svg>

          {/* Compass Rose Ornament */}
          <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.4 }}>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="16" stroke="var(--forest-green)" strokeWidth="1" />
              <polygon points="20,6 23,20 20,18 17,20" fill="var(--terracotta)" />
              <polygon points="20,34 23,20 20,22 17,20" fill="var(--forest-green)" />
            </svg>
          </div>

          {/* Interactive Glowing Region Markers */}
          {regions.map((reg) => {
            const isSelected = activeRegion.id === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setActiveRegion(reg)}
                onMouseEnter={() => setActiveRegion(reg)}
                style={{
                  position: 'absolute',
                  top: `${reg.y}%`,
                  left: `${reg.x}%`,
                  transform: 'translate(-50%, -50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 8,
                  zIndex: isSelected ? 10 : 3
                }}
                aria-label={`Select region ${reg.name}`}
              >
                {/* Marker Outer Glow Ring */}
                <div
                  style={{
                    width: isSelected ? 34 : 22,
                    height: isSelected ? 34 : 22,
                    borderRadius: '50%',
                    background: isSelected ? 'rgba(184, 93, 52, 0.2)' : 'rgba(201, 151, 56, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isSelected ? '0 0 16px rgba(184, 93, 52, 0.45)' : 'none'
                  }}
                >
                  {/* Central Core Bead */}
                  <div
                    style={{
                      width: isSelected ? 14 : 9,
                      height: isSelected ? 14 : 9,
                      borderRadius: '50%',
                      background: isSelected ? 'var(--terracotta)' : reg.color,
                      border: '2px solid #ffffff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>

                {/* Region Label Pill */}
                {isSelected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '105%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      background: 'var(--clay-bg-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--clay-border)',
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-pill)',
                      boxShadow: 'var(--shadow-clay-sm)',
                      pointerEvents: 'none'
                    }}
                  >
                    {reg.subtext.split(',')[0]}
                  </span>
                )}
              </button>
            );
          })}

          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              fontSize: '0.72rem',
              color: 'var(--charcoal-faint)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ✦ Click or hover markers to inspect regional lore
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT: Active Region Card & Warm 3D Book Illustration
        ────────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--terracotta)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                {activeRegion.subtext}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--gold-dark)',
                  fontWeight: 700
                }}
              >
                {activeRegion.storiesCount} Recorded Tales
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                color: 'var(--forest-green)',
                lineHeight: 1.25,
                marginBottom: '1rem',
                fontWeight: 700
              }}
            >
              {activeRegion.name}
            </h3>

            {/* Featured Tradition Box */}
            <div
              style={{
                background: 'var(--parchment-subtle)',
                border: '1px solid var(--border-delicate)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.4rem',
                marginBottom: '1.5rem'
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--charcoal-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.35rem'
                }}
              >
                FEATURED TRADITION • {activeRegion.tradition}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  color: 'var(--forest-green)',
                  fontWeight: 600,
                  marginBottom: '0.35rem'
                }}
              >
                {activeRegion.featuredTitle}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--charcoal-muted)' }}>
                📖 {activeRegion.keeper}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              WARM 3D ILLUSTRATION: Open Book + Pages + Cultural Objects
          ────────────────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(201,151,56,0.08) 0%, rgba(184,93,52,0.05) 100%)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(201,151,56,0.2)',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Miniature 3D Open Book + Diya + Quill SVG */}
              <svg width="56" height="42" viewBox="0 0 60 45" fill="none">
                {/* Miniature Open Book */}
                <path d="M6 35C16 32 28 32 28 35L28 15C28 15 16 12 6 15Z" fill="#faf6f0" stroke="#1b3b2b" strokeWidth="1" />
                <path d="M50 35C40 32 28 32 28 35L28 15C28 15 40 12 50 15Z" fill="#faf6f0" stroke="#1b3b2b" strokeWidth="1" />
                {/* Handwritten Lines */}
                <line x1="10" y1="19" x2="24" y2="19" stroke="rgba(27,59,43,0.3)" strokeWidth="0.8" />
                <line x1="10" y1="23" x2="22" y2="23" stroke="rgba(27,59,43,0.3)" strokeWidth="0.8" />
                <line x1="32" y1="19" x2="46" y2="19" stroke="rgba(27,59,43,0.3)" strokeWidth="0.8" />
                <line x1="32" y1="23" x2="44" y2="23" stroke="rgba(27,59,43,0.3)" strokeWidth="0.8" />
                {/* Little Brass Diya beside book */}
                <ellipse cx="53" cy="28" rx="5" ry="2" fill="#c99738" />
                <path d="M53 22C54 24 55 26 54 27C53 28 52 28 52 27C51 26 52 24 53 22Z" fill="#e8760a" />
                {/* Reed Quill */}
                <path d="M22 6Q24 16 28 22Q25 15 22 6Z" fill="#b85d34" />
              </svg>

              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--forest-green)', fontFamily: 'var(--font-sans)' }}>
                  Hand-notated Oral Records
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--charcoal-muted)' }}>
                  Field recordings archived under Open Heritage License
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            onClick={() => navigate(`/listener?region=${encodeURIComponent(activeRegion.name)}`)}
            className="btn btn-primary btn-md"
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem 1.4rem' }}
          >
            Discover {activeRegion.name.split('&')[0]} Tales →
          </button>
        </div>
      </div>
    </section>
  );
}
