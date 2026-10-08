import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faClock, faVolumeUp, faSparkles } from '@fortawesome/free-solid-svg-icons';

/**
 * FeaturedStoryCard
 * Large immersive storytelling showcase card:
 * Left: Peaceful cultural illustration / 3D river-banyan scene with subtle floating particles.
 * Right: Editorial metadata, storyteller attribution, reading time, and "Read Now" CTA.
 */
export default function FeaturedStoryCard() {
  const navigate = useNavigate();

  return (
    <section style={{ marginBottom: '4.5rem' }}>
      <div
        className="editorial-card-3d"
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* ─────────────────────────────────────────────────────────────
            LEFT PANE: Large Cultural Illustration / 3D Scenic Diorama
        ────────────────────────────────────────────────────────────── */}
        <div
          style={{
            minHeight: 360,
            background: 'linear-gradient(145deg, #12281d 0%, #1b3b2b 65%, #2a523d 100%)',
            position: 'relative',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            color: '#ffffff'
          }}
        >
          {/* Subtle Layered Sacred Banyan / River Motif */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* Background River Moon */}
            <div
              style={{
                position: 'absolute',
                top: 36,
                right: 36,
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ffeed3 20%, rgba(201,151,56,0.3) 70%, transparent 100%)',
                boxShadow: '0 0 32px rgba(255,238,211,0.4)',
                opacity: 0.9
              }}
            />

            {/* Sacred Banyan Canopy Silhouettes */}
            <svg
              style={{
                position: 'absolute',
                bottom: -10,
                left: -10,
                width: '115%',
                height: '75%',
                opacity: 0.28
              }}
              viewBox="0 0 300 200"
              preserveAspectRatio="none"
            >
              <path
                d="M150 180 C150 120 120 90 90 70 C40 40 10 90 0 140 L0 200 L300 200 L300 130 C270 80 230 60 200 90 C170 120 150 140 150 180 Z"
                fill="#ffffff"
              />
              <path d="M90 70 C80 110 75 140 70 200" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
              <path d="M110 80 C105 120 100 150 95 200" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
              <path d="M210 90 C215 130 220 160 225 200" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            </svg>

            {/* Floating Golden Fireflies / Particles */}
            {[
              { top: '35%', left: '30%', size: 5, delay: '0s' },
              { top: '55%', left: '60%', size: 4, delay: '1.2s' },
              { top: '25%', left: '75%', size: 6, delay: '2.4s' },
              { top: '70%', left: '40%', size: 3, delay: '3.6s' }
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: p.top,
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  background: 'var(--gold-light)',
                  boxShadow: '0 0 12px var(--gold)',
                  animation: `pulseGlow 4.5s ease-in-out infinite ${p.delay}`
                }}
              />
            ))}
          </div>

          {/* Diorama Header */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--gold-light)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 600
              }}
            >
              • FEATURED ARCHIVE NARRATIVE
            </span>
            <div
              style={{
                marginTop: '0.65rem',
                fontFamily: 'var(--font-editorial)',
                fontStyle: 'italic',
                fontSize: '1.25rem',
                color: 'rgba(255, 255, 255, 0.92)'
              }}
            >
              Living Oral Tradition of the Western Ghats
            </div>
          </div>

          {/* Central Stylized Sacred Diya on River Ghat Steps */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(201, 151, 56, 0.25) 0%, rgba(27, 59, 43, 0.1) 70%, transparent 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 32px rgba(201, 151, 56, 0.2)'
              }}
            >
              <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="42" stroke="var(--gold-light)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <circle cx="50" cy="50" r="34" fill="rgba(201,151,56,0.12)" stroke="#e5b869" strokeWidth="1.2" />
                {/* Diya Clay Bowl */}
                <ellipse cx="50" cy="64" rx="24" ry="9" fill="#b85d34" stroke="#924420" strokeWidth="1.2" />
                {/* Sacred Flame */}
                <path d="M50 24C54 34 57 42 54 50C52 54 48 54 46 50C43 42 46 34 50 24Z" fill="#ff9900" />
                <path d="M50 30C52 36 54 42 52 46C51 48 49 48 48 46C46 42 48 36 50 30Z" fill="#ffe066" />
                <circle cx="50" cy="40" r="3" fill="#ffffff" />
              </svg>
            </div>
          </div>

          {/* Diorama Footer Info */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              opacity: 0.85,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FontAwesomeIcon icon={faVolumeUp} size="xs" style={{ color: 'var(--gold-light)' }} />
            <span>Master Acoustic Quality: 96 kHz Field Capture</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT PANE: Editorial Narrative Details & CTA
        ────────────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '2.8rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Geographic Region & Teller Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--terracotta)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Malabar Coast, Kerala
            </span>
            <span style={{ color: 'var(--charcoal-faint)' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--charcoal-muted)', fontFamily: 'var(--font-body)' }}>
              Recorded with Devaki Amma (7th Gen Custodian)
            </span>
          </div>

          {/* Story Title */}
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.7rem, 2.5vw, 2.2rem)',
              color: 'var(--forest-green)',
              lineHeight: 1.25,
              marginBottom: '1rem',
              fontWeight: 700
            }}
          >
            The Whispering Banyan of Malabar
          </h3>

          {/* Short Introduction */}
          <p
            style={{
              color: 'var(--charcoal-muted)',
              fontSize: '0.98rem',
              lineHeight: 1.75,
              marginBottom: '1.8rem',
              fontFamily: 'var(--font-body)'
            }}
          >
            Passed down through seven generations of boatmen and spice gatherers, this oral chronicle recounts how the sacred banyan trees along the Periyar river shielded a coastal hamlet from devastating monsoon tidal storms, speaking in murmurs only the eldest could decipher.
          </p>

          {/* Meta & Button Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/listener')}
              className="btn btn-primary btn-lg"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                boxShadow: '0 4px 16px rgba(184, 93, 52, 0.25)'
              }}
            >
              <FontAwesomeIcon icon={faBookOpen} /> Read Now
            </button>

            <span
              style={{
                fontSize: '0.88rem',
                color: 'var(--charcoal-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <FontAwesomeIcon icon={faClock} size="xs" style={{ color: 'var(--gold)' }} />
              7 min listen & read
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
