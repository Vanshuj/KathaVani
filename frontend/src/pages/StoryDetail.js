import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faStop, faHeart, faArrowLeft, faMapMarkerAlt, faCalendar,
  faLanguage, faMicrophone, faVideo, faMusic, faCodeBranch, faWaveSquare, faShieldAlt,
  faClock, faBookmark, faShareAlt, faCheck, faFont, faPenToSquare, faSave, faSpinner, faStar
} from '@fortawesome/free-solid-svg-icons';
import { getStory, updateStory, voteStory, addKarma } from '../services/api';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { LANGUAGES, analyzeSentiment } from '../services/mockAI';
import AuthenticityMeter from '../components/AuthenticityMeter';
import StoryReviews from '../components/StoryReviews';
import { translateStory, LANGUAGE_TO_CODE } from '../services/translationService';

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [translating, setTranslating] = useState(false);

  const [accessRestricted, setAccessRestricted] = useState(null);

  // Edit manuscript state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    language: 'English',
    region: 'Pan India',
    tags: []
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Distraction-Free Reader Customization Controls
  const [fontSize, setFontSizeState] = useState('medium'); // 'small' | 'medium' | 'large'
  const [fontSerif, setFontSerif] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const translationCacheRef = useRef({});
  const { speak, stopSpeaking, isSpeaking, systemVoices } = useSpeech();
  const { user, updateUser } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();

  // Scroll Progress Listener for Distraction-Free Reading
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check saved bookmarks
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kv_bookmarked') || '[]');
      setIsBookmarked(saved.includes(id));
    } catch {}
  }, [id]);

  useEffect(() => {
    getStory(id).then(s => {
      setStory(s);
      setLoading(false);
      if (s && s.content) {
        setSentiment(analyzeSentiment(s.content));
      }
    }).catch(err => {
      setLoading(false);
      const errMsg = err.response?.data?.error || err.error;
      if (err.response?.status === 403 || (errMsg && errMsg.toLowerCase().includes('region'))) {
        setAccessRestricted(errMsg || 'This story is currently pending administrative approval and is only accessible to users belonging to its cultural region.');
      }
    });
  }, [id]);

  useEffect(() => {
    if (!story) return;

    const sourceLang = LANGUAGE_TO_CODE[story.language] || (story.language && story.language.length === 2 ? story.language.toLowerCase() : 'en');
    const targetLang = selectedLang.split('-')[0];

    if (sourceLang === targetLang) {
      setTranslatedTitle(story.title);
      setTranslatedContent(story.content);
      setTranslating(false);
      return;
    }

    const cacheKey = `${story._id}_${targetLang}`;
    if (translationCacheRef.current[cacheKey]) {
      setTranslatedTitle(translationCacheRef.current[cacheKey].title);
      setTranslatedContent(translationCacheRef.current[cacheKey].content);
      setTranslating(false);
      return;
    }

    setTranslating(true);
    let active = true;

    translateStory(story.title, story.content, sourceLang, targetLang)
      .then(({ title, content }) => {
        if (!active) return;
        translationCacheRef.current[cacheKey] = { title, content };
        setTranslatedTitle(title);
        setTranslatedContent(content);
        setTranslating(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Translation failed:', err);
        setTranslatedTitle(story.title);
        setTranslatedContent(story.content);
        setTranslating(false);
        showNotification('Translation service unavailable, displaying original narrative', 'warning');
      });

    return () => {
      active = false;
    };
  }, [story, selectedLang, showNotification]);

  const handleNarrate = () => {
    if (isSpeaking) { stopSpeaking(); return; }
    const titleToSpeak = translatedTitle || story.title;
    const contentToSpeak = translatedContent || story.content;
    speak(`${titleToSpeak}. ${contentToSpeak}`, selectedLang, sentiment?.mood, selectedVoiceName, async () => {
      if (user) {
        try {
          const res = await addKarma(5);
          updateUser({ karma: res.karma });
        } catch {}
      }
    });
  };

  const handleVote = async () => {
    if (!user) { showNotification('Sign in to vote for stories', 'warning'); return; }
    try {
      const res = await voteStory(id);
      setStory(prev => ({ ...prev, votes: res.votes, authenticity: res.authenticity }));
      showNotification('Thank you for voting on this story!', 'success');
    } catch (err) { showNotification(err.error || 'Already voted', 'warning'); }
  };

  const handleBookmarkToggle = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('kv_bookmarked') || '[]');
      let updated;
      if (saved.includes(id)) {
        updated = saved.filter(item => item !== id);
        setIsBookmarked(false);
        showNotification('Story removed from your saved shelf', 'info');
      } else {
        updated = [...saved, id];
        setIsBookmarked(true);
        showNotification('Story saved to your private library', 'success');
      }
      localStorage.setItem('kv_bookmarked', JSON.stringify(updated));
    } catch {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showNotification('Manuscript link copied to clipboard', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    if (story) {
      setEditFormData({
        title: story.title || '',
        content: story.content || '',
        language: story.language || 'English',
        region: story.region || 'Pan India',
        tags: story.tags || []
      });
    }
  }, [story]);

  const isAuthor = Boolean(
    user && story && (
      String(user._id || user.id) === String(story.author?._id || story.author) ||
      (user.name && story.authorName && user.name.toLowerCase() === story.authorName.toLowerCase()) ||
      user.role === 'admin'
    )
  );

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      showNotification('Title and narrative content are required', 'warning');
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await updateStory(story._id, editFormData);
      setStory(prev => ({ ...prev, ...updated }));
      setTranslatedTitle(updated.title);
      setTranslatedContent(updated.content);
      translationCacheRef.current = {};
      if (updated.content) setSentiment(analyzeSentiment(updated.content));
      setIsEditModalOpen(false);
      showNotification('Manuscript updated successfully in archive!', 'success');
    } catch (err) {
      showNotification(err.error || 'Failed to update manuscript', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <div style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', color: 'var(--charcoal-muted)' }}>
          Retrieving manuscript from archive...
        </div>
      </div>
    );
  }

  if (accessRestricted) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1.5rem', maxWidth: '620px', margin: '0 auto' }}>
        <div style={{ fontSize: '3rem', color: '#D97706', marginBottom: '1.25rem' }}>
          <FontAwesomeIcon icon={faMapMarkerAlt} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-green)', marginBottom: '0.85rem' }}>
          Regional Lore Restricted
        </h2>
        <p style={{ color: 'var(--charcoal-muted)', lineHeight: 1.65, marginBottom: '2rem', fontSize: '1.05rem' }}>
          {accessRestricted}
        </p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Return to Stories Lounge
        </button>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-green)' }}>Manuscript not found</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: '1rem' }}>Return to Lounge</button>
      </div>
    );
  }

  const rawContent = translatedContent || story.content || '';
  const wordCount = rawContent.split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = `${Math.max(3, Math.ceil(wordCount / 140))} min read`;
  const firstLetter = rawContent.charAt(0);
  const remainingText = rawContent.slice(1);

  const contentFontSize = fontSize === 'small' ? '1.05rem' : fontSize === 'large' ? '1.32rem' : '1.18rem';

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: '0 auto', paddingBottom: '5rem' }}>
      {/* ─────────────────────────────────────────────────────────────
          1. REAL-TIME READING PROGRESS BAR (Distraction-Free Indicator)
      ────────────────────────────────────────────────────────────── */}
      <div className="reading-progress-container">
        <div className="reading-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Regional Status Alert if Story is Pending */}
      {story && story.moderationStatus === 'pending' && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#D97706',
            fontSize: '0.88rem'
          }}
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span>
            <strong>Regional Preview:</strong> This story is currently pending administrative approval and is visible exclusively to users belonging to the <u>{story.region || 'local'}</u> cultural region. Once approved, it will be published globally.
          </span>
        </div>
      )}

      {/* Reader Navigation & Utility Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--border-delicate)' }}>
            <FontAwesomeIcon icon={faArrowLeft} /> Return to Lounge
          </button>
          {isAuthor && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-sm btn-primary"
              style={{
                borderRadius: 'var(--radius-pill)',
                padding: '0.38rem 0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
              title="Edit your published story"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
              Edit Manuscript
            </button>
          )}
        </div>

        {/* Reader Typography & Utility Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'var(--clay-bg-card)',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--clay-border)',
            boxShadow: 'var(--shadow-clay-sm)'
          }}
        >
          {/* Font Size A- / A / A+ */}
          <button
            onClick={() => setFontSizeState('small')}
            title="Compact Font Size"
            style={{
              border: 'none',
              background: fontSize === 'small' ? 'var(--terracotta)' : 'transparent',
              color: fontSize === 'small' ? '#ffffff' : 'var(--charcoal-muted)',
              borderRadius: '50%', width: 26, height: 26, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
            }}
          >
            A-
          </button>
          <button
            onClick={() => setFontSizeState('medium')}
            title="Regular Font Size"
            style={{
              border: 'none',
              background: fontSize === 'medium' ? 'var(--terracotta)' : 'transparent',
              color: fontSize === 'medium' ? '#ffffff' : 'var(--charcoal-muted)',
              borderRadius: '50%', width: 26, height: 26, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
            }}
          >
            A
          </button>
          <button
            onClick={() => setFontSizeState('large')}
            title="Spacious Font Size"
            style={{
              border: 'none',
              background: fontSize === 'large' ? 'var(--terracotta)' : 'transparent',
              color: fontSize === 'large' ? '#ffffff' : 'var(--charcoal-muted)',
              borderRadius: '50%', width: 26, height: 26, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer'
            }}
          >
            A+
          </button>

          <span style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />

          {/* Serif / Sans Font Toggle */}
          <button
            onClick={() => setFontSerif(!fontSerif)}
            title={fontSerif ? 'Switch to Modern Sans Font' : 'Switch to Classic Editorial Serif'}
            style={{
              border: 'none',
              background: 'transparent',
              color: fontSerif ? 'var(--forest-green)' : 'var(--charcoal-muted)',
              padding: '0.2rem 0.5rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              fontFamily: fontSerif ? 'var(--font-display)' : 'var(--font-sans)',
              cursor: 'pointer'
            }}
          >
            <FontAwesomeIcon icon={faFont} size="xs" style={{ marginRight: 3 }} />
            {fontSerif ? 'Serif' : 'Sans'}
          </button>

          <span style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            title={isBookmarked ? 'Remove Bookmark' : 'Save Story'}
            style={{
              border: 'none',
              background: 'transparent',
              color: isBookmarked ? 'var(--terracotta)' : 'var(--charcoal-muted)',
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <FontAwesomeIcon icon={faBookmark} size="sm" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            title="Copy Story Link"
            style={{
              border: 'none',
              background: 'transparent',
              color: copiedLink ? 'var(--forest-green)' : 'var(--charcoal-muted)',
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <FontAwesomeIcon icon={copiedLink ? faCheck : faShareAlt} size="sm" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EDITORIAL STORY HEADER & METADATA
      ────────────────────────────────────────────────────────────── */}
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        {/* Cultural Origin Badge & Tags */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {story.tags.map(t => (
            <span
              key={t}
              className={`tag tag-${t}`}
              style={{
                borderRadius: '12px',
                padding: '0.2rem 0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.04em'
              }}
            >
              {t}
            </span>
          ))}
          {story.isModerated && (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--forest-green)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                background: 'var(--sage-subtle)',
                padding: '0.2rem 0.65rem',
                borderRadius: '12px'
              }}
            >
              ✓ Culturally Verified
            </span>
          )}
        </div>

        {/* Manuscript Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)',
            lineHeight: 1.18,
            color: 'var(--forest-green)',
            marginBottom: '1rem',
            fontWeight: 700
          }}
        >
          {translating ? 'Translating manuscript...' : (translatedTitle || story.title)}
        </h1>

        {/* Byline & Archival Metadata */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            fontSize: '0.88rem',
            color: 'var(--charcoal-muted)',
            flexWrap: 'wrap',
            fontFamily: 'var(--font-body)'
          }}
        >
          <span>
            Preserved by <strong style={{ color: 'var(--charcoal)', fontStyle: 'italic' }}>{story.authorName}</strong>
            {isAuthor && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  marginLeft: '0.55rem',
                  border: 'none',
                  background: 'var(--terracotta-subtle)',
                  color: 'var(--terracotta)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Edit your published manuscript"
              >
                <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: 4 }} /> Edit
              </button>
            )}
          </span>
          {story.region && (
            <span>
              <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: 'var(--terracotta)', marginRight: 4 }} />
              {story.region}
            </span>
          )}
          <span>
            <FontAwesomeIcon icon={faClock} style={{ color: 'var(--gold)', marginRight: 4 }} />
            {estimatedReadTime}
          </span>
          <span>
            <FontAwesomeIcon icon={faLanguage} style={{ color: 'var(--forest-green)', marginRight: 4 }} />
            {story.language || 'Original Tongue'}
          </span>
          <span
            onClick={() => {
              const el = document.getElementById('reviews-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--gold)',
              fontWeight: 700
            }}
            title="Jump to community listener reviews"
          >
            <FontAwesomeIcon icon={faStar} />
            <span style={{ color: 'var(--charcoal)' }}>
              {story.rating > 0 ? Number(story.rating).toFixed(1) : 'New'}
            </span>
            <span style={{ color: 'var(--charcoal-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
              ({story.ratingCount || 0})
            </span>
          </span>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. AUDIO NARRATION & MULTILINGUAL CONSOLE
      ────────────────────────────────────────────────────────────── */}
      <div
        className="editorial-card-3d"
        style={{
          marginBottom: '3rem',
          padding: '1.25rem 1.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'var(--bg-card)'
        }}
      >
        <span style={{ fontSize: '0.84rem', fontFamily: 'var(--font-mono)', color: 'var(--terracotta)', fontWeight: 600 }}>
          READ ALOUD IN:
        </span>

        {/* Translation Language Selector */}
        <select
          value={selectedLang}
          onChange={e => { setSelectedLang(e.target.value); setSelectedVoiceName(''); }}
          style={{ width: 'auto', fontSize: '0.86rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
          aria-label="Select translation language"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>
              {l.name} ({l.label})
            </option>
          ))}
        </select>

        {/* Voice Selector */}
        {systemVoices.filter(v => v.lang === selectedLang || v.lang.startsWith(selectedLang.split('-')[0])).length > 0 && (
          <select
            value={selectedVoiceName}
            onChange={e => setSelectedVoiceName(e.target.value)}
            style={{ width: 'auto', fontSize: '0.86rem', padding: '0.4rem 0.75rem', maxWidth: '240px', borderRadius: 'var(--radius-sm)' }}
            aria-label="Select narrator voice"
          >
            <option value="">Default Archival Voice</option>
            {systemVoices
              .filter(v => v.lang === selectedLang || v.lang.startsWith(selectedLang.split('-')[0]))
              .map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))
            }
          </select>
        )}

        <button
          onClick={handleNarrate}
          className={`btn ${isSpeaking ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 1.1rem' }}
        >
          <FontAwesomeIcon icon={isSpeaking ? faStop : faMicrophone} />
          {isSpeaking ? 'Stop Narration' : 'Narrate Story'}
        </button>

        <button onClick={handleVote} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', borderColor: 'var(--border-delicate)' }}>
          <FontAwesomeIcon icon={faHeart} style={{ color: 'var(--terracotta)' }} /> {story.votes} votes
        </button>
      </div>

      {/* Emotion-aware voice synthesis display */}
      {sentiment && (
        <div
          style={{
            marginBottom: '2.5rem',
            background: 'var(--parchment-warm)',
            border: '1px solid rgba(184, 93, 52, 0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.85rem 1.25rem'
          }}
        >
          <FontAwesomeIcon icon={faWaveSquare} style={{ color: 'var(--terracotta)', fontSize: '1.2rem' }} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest-green)' }}>
              Emotion-Aware Acoustic Synthesis ({sentiment.mood})
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-muted)', marginTop: '0.1rem' }}>
              {sentiment.narrationStyle}
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {story.videoUrl && (
        <div className="card" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.05rem', color: 'var(--forest-green)' }}>
            <FontAwesomeIcon icon={faVideo} style={{ marginRight: 6 }} /> Watch Video Narrative
          </h3>
          <video src={story.videoUrl} controls style={{ width: '100%', maxHeight: 420, borderRadius: 'var(--radius-sm)' }} />
        </div>
      )}

      {/* Audio Player */}
      {story.audioUrl && (
        <div className="card" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <strong style={{ fontSize: '0.92rem', color: 'var(--forest-green)' }}>
            <FontAwesomeIcon icon={faMusic} style={{ marginRight: 6 }} /> Original Archival Audio:
          </strong>
          <audio src={story.audioUrl} controls style={{ flex: 1, height: 36 }} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. DISTRACTION-FREE READING BODY with Ornate Drop-Cap
      ────────────────────────────────────────────────────────────── */}
      <article
        style={{
          position: 'relative',
          fontSize: contentFontSize,
          fontFamily: fontSerif ? 'var(--font-editorial)' : 'var(--font-sans)',
          lineHeight: 2.1,
          color: 'var(--charcoal)',
          marginBottom: '3.5rem'
        }}
      >
        {translating && (
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'var(--bg-card)',
              opacity: 0.95,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 10, borderRadius: 'var(--radius-sm)'
            }}
          >
            <div className="spinner" style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Translating manuscript...
            </span>
          </div>
        )}

        {/* Narrative Manuscript with Ornate Drop-Cap */}
        <div style={{ whiteSpace: 'pre-wrap', opacity: translating ? 0.35 : 1, transition: 'opacity 0.25s' }}>
          <span className="reader-drop-cap">{firstLetter}</span>
          {remainingText}
        </div>

        {/* Ornate End-of-Manuscript Fleuron */}
        <div style={{ textAlign: 'center', margin: '3.5rem 0 1.5rem', color: 'var(--gold)', letterSpacing: '0.4em', fontSize: '1.1rem' }}>
          ❖ ─── ❖ ─── ❖
        </div>
      </article>

      {/* ─────────────────────────────────────────────────────────────
          5. OPEN CULTURAL LICENSING & ATTRIBUTION NOTICE
      ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-delicate)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.84rem',
          color: 'var(--charcoal-muted)',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: 'var(--forest-green)', fontWeight: 600 }}>
          <FontAwesomeIcon icon={faShieldAlt} style={{ color: 'var(--gold)' }} />
          Archival Licensing & Attribution Notice
        </div>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          © {story.authorName} &middot; KathaVani Living Cultural Archive. This narrative contribution is licensed under{' '}
          <strong>Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)</strong>. Traditional custodianship remains with the originating communities and storyteller.
        </p>
      </div>

      {/* 6. Authenticity Meter */}
      <div style={{ marginBottom: '2.5rem' }}>
        <AuthenticityMeter content={story.content} tags={story.tags} />
      </div>

      {/* 7. Branching Narrative Nodes */}
      {story.nodeGraph?.length > 0 && (
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ marginBottom: '0.4rem', fontSize: '1.05rem', color: 'var(--forest-green)' }}>
            <FontAwesomeIcon icon={faCodeBranch} style={{ marginRight: 6, color: 'var(--terracotta)' }} />
            Branching Narrative Pathways ({story.nodeGraph.length} Nodes)
          </h3>
          <p style={{ color: 'var(--charcoal-muted)', fontSize: '0.88rem', margin: 0 }}>
            The storyteller mapped alternative folkloric storylines and regional interpretations for this narrative.
          </p>
        </div>
      )}

      {/* 8. Regional Geographic Map */}
      {story.lat && story.lng && (
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.05rem', color: 'var(--forest-green)' }}>
            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: 6, color: 'var(--terracotta)' }} />
            Geographic Origin: {story.region}
          </h3>
          <div style={{ height: 220, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-delicate)' }}>
            <iframe
              title={`Geographic map for ${story.region}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${story.lng - 2},${story.lat - 2},${story.lng + 2},${story.lat + 2}&layer=mapnik&marker=${story.lat},${story.lng}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8b. COMMUNITY REVIEWS & RATINGS SECTION
      ────────────────────────────────────────────────────────────── */}
      <StoryReviews
        storyId={story._id}
        initialRating={story.rating || 0}
        initialRatingCount={story.ratingCount || 0}
        initialReviews={story.reviews || []}
        onRatingUpdate={(newRating, newCount, newReviews) => {
          setStory(prev => ({
            ...prev,
            rating: newRating,
            ratingCount: newCount,
            reviews: newReviews
          }));
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          9. 3D CLAYMORPHIC MANUSCRIPT REVISION MODAL
      ────────────────────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 720,
              width: '94%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-clay-card)',
              background: 'var(--clay-bg-card)',
              border: '1.5px solid var(--clay-border)',
              padding: '1.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--clay-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--terracotta-subtle)', color: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  <FontAwesomeIcon icon={faPenToSquare} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--forest-green)', fontFamily: 'var(--font-display)' }}>
                    Edit Published Manuscript
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--charcoal-muted)' }}>
                    Revise your preserved oral lore and cultural attributes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ border: 'none', borderRadius: '50%', width: 32, height: 32, padding: 0 }}
                aria-label="Close revision modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              {/* Story Title */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--charcoal)' }}>
                  Story Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Manuscript Title…"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--clay-border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem'
                  }}
                />
              </div>

              {/* Language & Region */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--charcoal)' }}>
                    Original Tongue
                  </label>
                  <select
                    value={editFormData.language}
                    onChange={e => setEditFormData({ ...editFormData, language: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clay-border)' }}
                  >
                    {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--charcoal)' }}>
                    Cultural Region
                  </label>
                  <select
                    value={editFormData.region}
                    onChange={e => setEditFormData({ ...editFormData, region: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clay-border)' }}
                  >
                    {['North India', 'South India', 'East India', 'West India', 'Central India', 'Northeast India', 'Pan India'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cultural Tags */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--charcoal)' }}>
                  Cultural Tags
                </label>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {['mythology', 'resistance', 'migration', 'folklore', 'tribal', 'history', 'nature', 'family'].map(t => {
                    const isSelected = editFormData.tags.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => {
                          const nextTags = isSelected
                            ? editFormData.tags.filter(x => x !== t)
                            : [...editFormData.tags, t];
                          setEditFormData({ ...editFormData, tags: nextTags });
                        }}
                        style={{
                          border: '1.5px solid var(--clay-border)',
                          borderRadius: 'var(--radius-pill)',
                          padding: '0.3rem 0.8rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: isSelected ? 'var(--clay-btn-primary-bg)' : 'var(--clay-bg-card)',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          boxShadow: isSelected ? 'var(--clay-btn-primary-shadow)' : 'var(--shadow-clay-sm)'
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Story Narrative Content */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 700, margin: 0, color: 'var(--charcoal)' }}>
                    Manuscript Text
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--charcoal-muted)' }}>
                    {editFormData.content.split(/\s+/).filter(Boolean).length} words · {editFormData.content.length} chars
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={editFormData.content}
                  onChange={e => setEditFormData({ ...editFormData, content: e.target.value })}
                  required
                  placeholder="Preserve your narrative here..."
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--clay-border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    navigate(`/storyteller?edit=${story._id}`);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--terracotta)' }}
                >
                  <FontAwesomeIcon icon={faCodeBranch} style={{ marginRight: 5 }} />
                  Open in Branching Workshop →
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="btn btn-ghost"
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingEdit || !editFormData.title.trim() || !editFormData.content.trim()}
                  >
                    {savingEdit ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />
                        Saving Changes…
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} style={{ marginRight: 6 }} />
                        Save Revisions
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
