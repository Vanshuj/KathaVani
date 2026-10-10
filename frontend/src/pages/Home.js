import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone, faBookOpen, faTrophy, faStar, faArrowRight, faClock, faBookmark
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getFeaturedStories, getLeaderboard, getStories } from '../services/api';
import logo from '../assets/logo.png';
import Features3D from '../components/Features3D';
import FeaturedStoryCard from '../components/FeaturedStoryCard';
import CulturalMapSection from '../components/CulturalMapSection';

// Curated peaceful editorial stories for discovery
const EDITORIAL_DISCOVERY_STORIES = [
  {
    _id: 'chola-monsoon',
    title: "The Chola Emperor's Last Monsoon",
    region: 'Kaveri Delta, Tamil Nadu',
    category: 'Mythology',
    readingTime: '6 min read',
    authorName: 'Ramanathan Pillai',
    content: 'When Rajendra Chola steered his navy to the sacred northern river, the temple bells along Thanjavur rang with celestial devotion. An oral chronicle preserved by river boatmen for a millennium.',
    votes: 48,
    coverPattern: 'linear-gradient(135deg, #1b3b2b 0%, #29543e 100%)'
  },
  {
    _id: 'rani-flame',
    title: "Rani Lakshmibai's Sacred Flame",
    region: 'Bundelkhand, Central India',
    category: 'Oral History',
    readingTime: '8 min read',
    authorName: 'Bundelkhand Women Collective',
    content: 'Clad in ceremonial saffron armor with her child bound safely to her back, she rode under moonlit ramparts. The ballad sung by village women across Madhya Pradesh during the harvest.',
    votes: 62,
    coverPattern: 'linear-gradient(135deg, #b85d34 0%, #d17549 100%)'
  },
  {
    _id: 'kaveri-secrets',
    title: "Kaveri's Whispering Waters",
    region: 'Srirangapatna, Karnataka',
    category: 'Folklore',
    readingTime: '5 min read',
    authorName: 'Muniswamy Boatman',
    content: 'Old Muniswamy could read the river currents like Sanskrit verses. At midnight, when the temple torches dimmed, the waters began recounting ancient tales of sages and hidden kingdoms.',
    votes: 39,
    coverPattern: 'linear-gradient(135deg, #5c7a67 0%, #7b9c87 100%)'
  }
];

export default function Home() {
  const { user } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [savedBookmarked, setSavedBookmarked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kv_bookmarked') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    getFeaturedStories()
      .then((data) => {
        if (data && data.length > 0) setFeatured(data);
        else {
          getStories({ limit: 3 })
            .then(res => {
              if (res.stories && res.stories.length > 0) setFeatured(res.stories);
              else setFeatured(EDITORIAL_DISCOVERY_STORIES);
            })
            .catch(() => setFeatured(EDITORIAL_DISCOVERY_STORIES));
        }
      })
      .catch(() => setFeatured(EDITORIAL_DISCOVERY_STORIES));

    getLeaderboard()
      .then(setLeaders)
      .catch(() => {});
  }, []);

  const toggleBookmark = (e, storyId) => {
    e.stopPropagation();
    let updated;
    if (savedBookmarked.includes(storyId)) {
      updated = savedBookmarked.filter(id => id !== storyId);
      if (showNotification) showNotification('Story removed from saved shelf', 'info');
    } else {
      updated = [...savedBookmarked, storyId];
      if (showNotification) showNotification('Story saved to your private library', 'success');
    }
    setSavedBookmarked(updated);
    try {
      localStorage.setItem('kv_bookmarked', JSON.stringify(updated));
    } catch {}
  };

  const displayStories = featured.length > 0 ? featured.slice(0, 3) : EDITORIAL_DISCOVERY_STORIES;

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>

      {/* ─────────────────────────────────────────────────────────────
          1. EDITORIAL HERO SECTION
      ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: '3.5rem 1.25rem 2.5rem',
          marginBottom: '3.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Foreground Content with High Contrast & Readability */}
        <div className="hero-content-protection">
          {/* Living Cultural Archive Badge */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.35rem 1.1rem',
                background: 'var(--terracotta-subtle)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(184, 93, 52, 0.32)',
                color: 'var(--terracotta)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: 'var(--shadow-clay-sm)'
              }}
            >
              <span style={{ color: 'var(--gold)' }}>❖</span>
              <span>LIVING ORAL ARCHIVE</span>
              <span style={{ color: 'var(--gold)' }}>❖</span>
            </div>
          </div>

          {/* Primary Headline */}
          <h1 className="hero-headline">
            Preserving India's Cultural Narratives & Living Heritage
          </h1>

          <p className="hero-description">
            An open, community-driven digital archive dedicated to documenting, transcribing, and safeguarding folk tales, regional oral histories, and community memories across India.
          </p>

          {/* Peaceful Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <button
                onClick={() => navigate('/storyteller')}
                className="btn btn-primary btn-lg"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
              >
                <FontAwesomeIcon icon={faMicrophone} /> Contribute a Story
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="btn btn-primary btn-lg"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
              >
                <FontAwesomeIcon icon={faStar} /> Join the Archive
              </button>
            )}

            <button
              onClick={() => navigate('/listener')}
              className="btn btn-secondary btn-lg"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '1rem'
              }}
            >
              <FontAwesomeIcon icon={faBookOpen} /> Browse Story Archive
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PLATFORM PILLARS
      ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '4.5rem'
        }}
      >
        {[
          { value: '12', label: 'Indian Languages Supported' },
          { value: 'Oral & Written', label: 'Folk Traditions Preserved' },
          { value: 'CC BY-NC 4.0', label: 'Open Cultural Licensing' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="editorial-card-3d"
            style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-card)' }}
          >
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--forest-green)',
                fontFamily: 'var(--font-display)'
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--charcoal-muted)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: '0.35rem'
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURES FOR STORYTELLERS AND LISTENERS (3D Cultural Objects)
      ────────────────────────────────────────────────────────────── */}
      <Features3D />

      {/* ─────────────────────────────────────────────────────────────
          3. FEATURED STORY (Large Immersive Card with 3D Diorama)
      ────────────────────────────────────────────────────────────── */}
      <FeaturedStoryCard />

      {/* ─────────────────────────────────────────────────────────────
          4. CULTURAL MAP (Interactive 3D-inspired Regional Map)
      ────────────────────────────────────────────────────────────── */}
      <CulturalMapSection />

      {/* ─────────────────────────────────────────────────────────────
          5. HANDPICKED STORY TREASURY (Tactile Floating Story Cards)
      ────────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.25rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--terracotta)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
              • HANDPICKED TREASURY
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--forest-green)', margin: '0.35rem 0 0', fontWeight: 700 }}>
              Stories waiting to be discovered
            </h2>
          </div>
          <button
            onClick={() => navigate('/listener')}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--charcoal)', borderColor: 'var(--border-delicate)' }}
          >
            Browse All Tales <FontAwesomeIcon icon={faArrowRight} size="xs" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.75rem' }}>
          {displayStories.map((story) => {
            const isBookmarked = savedBookmarked.includes(story._id);
            const categoryName = (story.tags && story.tags[0]) || story.category || 'Folklore';
            const regionName = story.region || 'Indian Subcontinent';
            const readTime = story.readingTime || `${Math.max(3, Math.round((story.content || '').split(' ').length / 140))} min read`;

            return (
              <div
                key={story._id}
                className="editorial-card-3d"
                onClick={() => navigate(`/stories/${story._id}`)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              >
                {/* Story Cover Header Motif */}
                <div
                  style={{
                    height: 140,
                    margin: '-1.75rem -1.75rem 1.25rem -1.75rem',
                    background: story.coverPattern || 'linear-gradient(135deg, #1b3b2b 0%, #254d39 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '1rem 1.25rem'
                  }}
                >
                  <svg
                    style={{ position: 'absolute', top: -10, right: -10, width: 90, height: 90, opacity: 0.18 }}
                    viewBox="0 0 100 100"
                  >
                    <circle cx="50" cy="50" r="40" stroke="#ffffff" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                    <polygon points="50,15 60,40 85,50 60,60 50,85 40,60 15,50 40,40" fill="#ffffff" />
                  </svg>

                  <span
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      boxShadow: 'var(--shadow-clay-sm)'
                    }}
                  >
                    {categoryName}
                  </span>

                  <button
                    onClick={(e) => toggleBookmark(e, story._id)}
                    aria-label="Bookmark story"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'var(--clay-bg-card)',
                      border: '1px solid var(--clay-border)',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: isBookmarked ? 'var(--terracotta)' : 'var(--charcoal-muted)',
                      boxShadow: 'var(--shadow-clay-sm)'
                    }}
                  >
                    <FontAwesomeIcon icon={faBookmark} size="sm" />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--charcoal-muted)', marginBottom: '0.5rem' }}>
                  <span>{regionName}</span>
                  <span>•</span>
                  <span><FontAwesomeIcon icon={faClock} size="xs" style={{ marginRight: 4 }} />{readTime}</span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    color: 'var(--forest-green)',
                    lineHeight: 1.3,
                    marginBottom: '0.65rem',
                    fontWeight: 700
                  }}
                >
                  {story.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--charcoal-muted)',
                    lineHeight: 1.6,
                    margin: 0,
                    flex: 1,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {story.content}
                </p>

                <div
                  style={{
                    borderTop: '1px solid var(--border-delicate)',
                    paddingTop: '0.85rem',
                    marginTop: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--charcoal-faint)', fontStyle: 'italic' }}>
                    {story.authorName || 'Anonymous Custodian'}
                  </span>

                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      color: 'var(--terracotta)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    Read Story →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. TOP COMMUNITY CONTRIBUTORS LEADERBOARD
      ────────────────────────────────────────────────────────────── */}
      {leaders.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--gold)', fontSize: '1.2rem' }} />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--forest-green)' }}>
              Cultural Custodians Leaderboard
            </h3>
          </div>
          <div className="editorial-card-3d" style={{ padding: '0.5rem 1.5rem' }}>
            {leaders.slice(0, 5).map((l, i) => (
              <div
                key={l.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 0',
                  borderBottom: i < 4 ? '1px solid var(--border-delicate)' : 'none'
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: i < 3 ? 'var(--gold)' : 'var(--charcoal-muted)', width: 28, fontSize: '0.9rem' }}>
                  #{i + 1}
                </span>
                <span style={{ flex: 1, fontWeight: 600, color: 'var(--charcoal)', fontSize: '0.95rem' }}>
                  {l.name}
                </span>
                <span
                  style={{
                    background: 'var(--gold-subtle)',
                    color: 'var(--gold-dark)',
                    borderRadius: '12px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700
                  }}
                >
                  <FontAwesomeIcon icon={faStar} size="xs" style={{ marginRight: 4 }} />
                  {l.karma} Karma
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {l.badges?.slice(0, 2).map(b => (
                    <span key={b} className="badge" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: 'var(--sage-subtle)', color: 'var(--forest-green)' }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
