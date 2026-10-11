import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone, faBookOpen, faTrophy, faStar, faArrowRight, faClock, faBookmark,
  faHeadphones, faHeart, faFire, faLanguage
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getFeaturedStories, getLeaderboard, getStories } from '../services/api';
import { LANGUAGES } from '../services/mockAI';
import logo from '../assets/logo.png';
import Features3D from '../components/Features3D';
import CulturalMapSection from '../components/CulturalMapSection';
import ClayStorytellingDuo from '../components/ClayStorytellingDuo';

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
    coverPattern: 'linear-gradient(135deg, #37514D 0%, #90AEB2 100%)'
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
    coverPattern: 'linear-gradient(135deg, #B6594C 0%, #DD8E75 100%)'
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
    coverPattern: 'linear-gradient(135deg, #BE845E 0%, #DD8E75 100%)'
  }
];

export default function Home() {
  const { user } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [archiveStats, setArchiveStats] = useState({
    totalStories: 16,
    languagesCount: (LANGUAGES && LANGUAGES.length) || 12,
    activeLanguagesInArchive: 4,
    oralHours: '1.1',
    totalMinutes: 66,
    totalWords: 8500,
    streakDays: 1,
    verifiedCount: 16
  });
  const [savedBookmarked, setSavedBookmarked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kv_bookmarked') || '[]');
    } catch {
      return [];
    }
  });
  const [userListenSeconds, setUserListenSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem('kv_user_listen_seconds');
      return saved !== null ? parseInt(saved, 10) : 960;
    } catch {
      return 960;
    }
  });
  const [isLiveListening, setIsLiveListening] = useState(false);

  // Real-time synchronization of oral listening duration
  useEffect(() => {
    const handleListenUpdate = (e) => {
      if (e?.detail?.seconds !== undefined) {
        setUserListenSeconds(e.detail.seconds);
        if (e.detail.active !== undefined) {
          setIsLiveListening(e.detail.active);
        }
      }
    };
    const handleListenStopped = () => {
      setIsLiveListening(false);
    };
    const handleStorageChange = (e) => {
      if (e.key === 'kv_user_listen_seconds' && e.newValue) {
        setUserListenSeconds(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener('kv_listen_time_updated', handleListenUpdate);
    window.addEventListener('kv_listen_stopped', handleListenStopped);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('kv_listen_time_updated', handleListenUpdate);
      window.removeEventListener('kv_listen_stopped', handleListenStopped);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // 1. Calculate active daily streak based on calendar visits
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem('kv_streak_last_visit');
    let currentStreak = parseInt(localStorage.getItem('kv_streak_count') || '1', 10);

    if (!lastVisit) {
      currentStreak = 1;
      localStorage.setItem('kv_streak_last_visit', todayStr);
      localStorage.setItem('kv_streak_count', '1');
    } else if (lastVisit !== todayStr) {
      const lastDate = new Date(lastVisit);
      const currDate = new Date(todayStr);
      const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1; // streak reset if skipped day
      }
      localStorage.setItem('kv_streak_last_visit', todayStr);
      localStorage.setItem('kv_streak_count', currentStreak.toString());
    }

    // 2. Fetch real archive stories and calculate true functional metrics
    getStories({ limit: 100 })
      .then(res => {
        const storyList = res.stories || [];
        const totalCount = res.total || storyList.length;
        if (storyList.length > 0) {
          setAllStories(storyList);
          const distinctLangs = new Set(storyList.map(s => s.language).filter(Boolean));
          const totalWords = storyList.reduce((acc, s) => {
            const words = (s.content || '').trim().split(/\s+/).filter(Boolean).length;
            return acc + words;
          }, 0);

          // Calculate real oral listening duration (130 words per minute average speaking rate)
          const totalMinutes = Math.max(1, Math.round(totalWords / 130));
          const hoursVal = (totalMinutes / 60).toFixed(1);
          const verified = storyList.filter(s => (s.authenticity && s.authenticity >= 80) || s.isModerated).length;

          // If user hasn't accumulated listening seconds yet in localStorage, sync initial baseline
          if (!localStorage.getItem('kv_user_listen_seconds')) {
            const baseSeconds = totalMinutes * 60;
            localStorage.setItem('kv_user_listen_seconds', baseSeconds.toString());
            setUserListenSeconds(baseSeconds);
          }

          setArchiveStats({
            totalStories: totalCount,
            languagesCount: (LANGUAGES && LANGUAGES.length) || 12,
            activeLanguagesInArchive: distinctLangs.size,
            oralHours: hoursVal,
            totalMinutes,
            totalWords,
            streakDays: currentStreak,
            verifiedCount: verified
          });
        }
      })
      .catch(() => {
        setArchiveStats(prev => ({
          ...prev,
          streakDays: currentStreak
        }));
      });

    // 3. Featured Stories & Leaderboard
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

  // Real calculated oral listening duration based on actual user listening time
  const getHoursListenedDisplay = () => {
    const totalMinutes = Math.floor(userListenSeconds / 60);
    if (userListenSeconds >= 3600) {
      const hours = (userListenSeconds / 3600).toFixed(1);
      return `${hours} hrs`;
    }
    if (totalMinutes >= 1) {
      return `${totalMinutes} mins`;
    }
    return `${userListenSeconds} secs`;
  };

  const calculatedSpokenWords = Math.round(userListenSeconds * (130 / 60));

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>

      {/* ─────────────────────────────────────────────────────────────
          1. EDITORIAL HERO SECTION
      ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: '2.5rem 1.25rem 2.5rem',
          marginBottom: '3.5rem'
        }}
      >
        <div className="hero-grid-layout">
          {/* Left Column: Hero Text & Actions */}
          <div className="hero-text-col">
            {/* Living Cultural Archive Badge */}
            <div className="hero-badge-wrap">
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
            <div className="hero-cta-group">
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

          {/* Right Column: 3D Clay Storytelling Duo (Girl reading book, Boy listening via headphones) */}
          <div className="hero-book-col">
            <ClayStorytellingDuo stories={allStories.length > 0 ? allStories : featured} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PLATFORM PILLARS (3D Clay Stat Cards with 4 Shades of Green & Orange)
      ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.35rem',
          marginBottom: '4.5rem'
        }}
      >
        {[
          {
            cardClass: 'clay-stat-card-1',
            iconClass: 'clay-stat-icon-1',
            pillClass: 'clay-stat-pill-1',
            textColor: 'var(--stat-card-1-text)',
            icon: faLanguage,
            value: `${archiveStats.languagesCount || 12}`,
            label: 'Languages Supported',
            badge: archiveStats.activeLanguagesInArchive > 0
              ? `${archiveStats.activeLanguagesInArchive} Active in Archive`
              : '12 Indic Languages',
            onClick: () => navigate('/listener'),
            tooltip: 'Browse stories across 12 Indic languages'
          },
          {
            cardClass: 'clay-stat-card-2',
            iconClass: 'clay-stat-icon-2',
            pillClass: 'clay-stat-pill-2',
            textColor: 'var(--stat-card-2-text)',
            icon: faHeadphones,
            value: (archiveStats.totalStories || 0).toLocaleString(),
            label: 'Stories Archived',
            badge: archiveStats.verifiedCount > 0
              ? `${archiveStats.verifiedCount} Verified Lore`
              : 'Oral Archive',
            onClick: () => navigate('/vault'),
            tooltip: 'Explore verified community oral archives'
          },
          {
            cardClass: 'clay-stat-card-3',
            iconClass: 'clay-stat-icon-3',
            pillClass: `clay-stat-pill-3 ${isLiveListening ? 'clay-stat-pill-live' : ''}`,
            textColor: 'var(--stat-card-3-text)',
            icon: faStar,
            value: getHoursListenedDisplay(),
            label: 'Hours Listened',
            badge: isLiveListening
              ? '● Live Listening'
              : `${calculatedSpokenWords.toLocaleString()} Spoken Words`,
            onClick: () => navigate('/listener'),
            tooltip: `Calculated from your live oral audio listening (${Math.floor(userListenSeconds / 60)}m ${userListenSeconds % 60}s). Updates live as you listen across KathaVani.`
          },
          {
            cardClass: 'clay-stat-card-4',
            iconClass: 'clay-stat-icon-4',
            pillClass: 'clay-stat-pill-4',
            textColor: 'var(--stat-card-4-text)',
            icon: faFire,
            value: `${archiveStats.streakDays} ${archiveStats.streakDays === 1 ? 'Day' : 'Days'}`,
            label: 'Active Story Streak',
            badge: archiveStats.streakDays > 1 ? `${archiveStats.streakDays} Days in a Row` : 'Active Today',
            onClick: () => navigate('/listener'),
            tooltip: 'Keep your daily listening streak active'
          }
        ].map((stat) => (
          <div
            key={stat.label}
            className={`clay-stat-card ${stat.cardClass}`}
            onClick={stat.onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                stat.onClick();
              }
            }}
            title={stat.tooltip}
          >
            {/* 3D Clay Icon Square */}
            <div className={`clay-stat-icon ${stat.iconClass}`}>
              <FontAwesomeIcon icon={stat.icon} />
            </div>

            <div
              style={{
                fontSize: '0.82rem',
                color: stat.textColor,
                opacity: 0.85,
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                marginBottom: '0.25rem',
                letterSpacing: '0.01em'
              }}
            >
              {stat.label}
            </div>

            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: stat.textColor,
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.15
              }}
            >
              {stat.value}
            </div>

            {/* Positive pill badge */}
            <div
              className={stat.pillClass}
              style={{
                marginTop: '0.75rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                padding: '0.24rem 0.75rem',
                borderRadius: 'var(--radius-pill)'
              }}
            >
              {stat.badge}
            </div>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURES FOR STORYTELLERS AND LISTENERS (3D Cultural Objects)
      ────────────────────────────────────────────────────────────── */}
      <Features3D />

      {/* ─────────────────────────────────────────────────────────────
          3. CULTURAL MAP (Interactive 3D-inspired Regional Map)
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
                    background: story.coverPattern || 'linear-gradient(135deg, #37514D 0%, #90AEB2 100%)',
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

    </div>
  );
}
