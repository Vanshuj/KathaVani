import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, faStop, faVolumeUp, faMapMarkerAlt, faSearch, 
  faHeart, faBookOpen, faMap, faInbox, faLanguage, faSpinner 
} from '@fortawesome/free-solid-svg-icons';
import { getStories, voteStory, getGeoStories } from '../services/api';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { LANGUAGES, analyzeSentiment } from '../services/mockAI';
import { translateStory, LANGUAGE_TO_CODE } from '../services/translationService';
import StoryMap from '../components/StoryMap';

const TAGS = ['all', 'mythology', 'resistance', 'migration', 'folklore', 'tribal', 'history'];

export default function ListenerPage() {
  const [searchParams] = useSearchParams();
  const urlTag = searchParams.get('tag');

  const [stories, setStories] = useState([]);
  const [geoStories, setGeoStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(urlTag || 'all');
  const [selectedLang, setSelectedLang] = useState('All');
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [tab, setTab] = useState('browse');

  // Multi-story dynamic translation cache & loading state
  const [translatedStories, setTranslatedStories] = useState({});
  const [translating, setTranslating] = useState(false);

  const { speak, stopSpeaking, isSpeaking } = useSpeech();
  const { user } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlTag) {
      setSelectedTag(urlTag);
    }
  }, [urlTag]);

  useEffect(() => {
    fetchStories();
    getGeoStories().then(setGeoStories).catch(() => {});
  }, [selectedTag, search]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedTag !== 'all') params.tag = selectedTag;
      if (search) params.search = search;
      const data = await getStories(params);
      setStories(data.stories || []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // Translate all loaded stories into the selected Indian language
  useEffect(() => {
    if (selectedLang === 'All' || stories.length === 0) {
      setTranslating(false);
      return;
    }

    const langObj = LANGUAGES.find(l => l.name === selectedLang || l.code === selectedLang);
    if (!langObj) return;

    const targetCode = langObj.langCode;
    let active = true;

    const translateBatch = async () => {
      setTranslating(true);
      const updatedCache = { ...translatedStories };

      await Promise.all(
        stories.map(async (story) => {
          const key = `${story._id}_${targetCode}`;
          if (!updatedCache[key]) {
            const sourceCode = LANGUAGE_TO_CODE[story.language] || (story.language && story.language.length === 2 ? story.language.toLowerCase() : 'en');
            if (sourceCode === targetCode) {
              updatedCache[key] = { title: story.title, content: story.content };
            } else {
              try {
                const res = await translateStory(story.title, story.content, sourceCode, targetCode);
                if (active) {
                  updatedCache[key] = res;
                  setTranslatedStories(prev => ({ ...prev, [key]: res }));
                }
              } catch (err) {
                console.warn('Translation failed for story:', story._id, err);
              }
            }
          }
        })
      );

      if (active) {
        setTranslatedStories(updatedCache);
        setTranslating(false);
      }
    };

    translateBatch();

    return () => {
      active = false;
    };
  }, [selectedLang, stories]);

  // Audio narration in the chosen translated language
  const handleNarrate = (story, displayTitle, displayContent) => {
    if (playingId === story._id && isSpeaking) {
      stopSpeaking();
      setPlayingId(null);
      return;
    }

    const langObj = selectedLang !== 'All' 
      ? LANGUAGES.find(l => l.name === selectedLang || l.code === selectedLang)
      : null;

    const targetLangTTS = langObj 
      ? langObj.code 
      : (LANGUAGE_TO_CODE[story.language] ? `${LANGUAGE_TO_CODE[story.language]}-IN` : 'en-IN');

    setPlayingId(story._id);
    const sentiment = analyzeSentiment(displayContent || '');

    speak(
      `${displayTitle}. ${displayContent}`,
      targetLangTTS,
      sentiment?.mood,
      null,
      () => setPlayingId(null)
    );
  };

  const handleVote = async (storyId) => {
    if (!user) { showNotification('Sign in to vote for stories', 'warning'); return; }
    try {
      await voteStory(storyId);
      setStories(prev => prev.map(s => s._id === storyId ? { ...s, votes: s.votes + 1 } : s));
      showNotification('Vote recorded! +5 karma points', 'success');
    } catch (err) {
      showNotification(err.error || 'Already voted', 'warning');
    }
  };

  const currentLangObj = selectedLang !== 'All' 
    ? LANGUAGES.find(l => l.name === selectedLang || l.code === selectedLang) 
    : null;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
          <FontAwesomeIcon icon={faBookOpen} style={{ color: 'var(--terracotta)', fontSize: '1.6rem' }} />
          <h1 style={{ color: 'var(--terracotta)', margin: 0 }}>Story Listener Lounge</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Browse, listen, and explore oral traditions in 12 Indian languages</p>
      </div>

      {/* Mode tabs */}
      <div className="tab-nav" style={{ marginBottom: '1.5rem', maxWidth: 480 }}>
        {[
          { id: 'browse', label: 'Browse Stories', icon: faBookOpen },
          { id: 'map', label: 'Story Map', icon: faMap }
        ].map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <FontAwesomeIcon icon={t.icon} /> <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'map' ? (
        <div>
          <div className="card" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: 'var(--terracotta)', marginRight: 6 }} />
              Click any marker on the map to explore stories geo-located to that historical region.
            </p>
          </div>
          <StoryMap stories={geoStories} onSelectStory={(id) => navigate(`/stories/${id}`)} />
        </div>
      ) : (
        <>
          {/* Controls: Search & 12 Languages selector */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories…" style={{ paddingLeft: '2.2rem' }} />
            </div>

            {/* 12 Main Indian Languages Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}>
              <FontAwesomeIcon icon={faLanguage} style={{ color: 'var(--terracotta)' }} />
              <label htmlFor="listener-lang-select" style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
                Language:
              </label>
              <select 
                id="listener-lang-select"
                value={selectedLang} 
                onChange={e => {
                  stopSpeaking();
                  setPlayingId(null);
                  setSelectedLang(e.target.value);
                }} 
                style={{ width: 'auto', border: 'none', background: 'var(--bg-elevated)', padding: '0.2rem 0.4rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                <option value="All" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  All (Original Language)
                </option>
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.name} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    {l.name} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            {translating && (
              <span style={{ fontSize: '0.82rem', color: 'var(--terracotta)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <FontAwesomeIcon icon={faSpinner} spin />
                Translating stories to {currentLangObj?.name}...
              </span>
            )}
          </div>

          {/* Tag filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {TAGS.map(tag => (
              <button key={tag} onClick={() => setSelectedTag(tag)}
                className={`tag ${tag !== 'all' ? `tag-${tag}` : ''}`}
                style={{ cursor: 'pointer', background: selectedTag === tag ? 'var(--terracotta)' : 'var(--bg-elevated)', color: selectedTag === tag ? '#fff' : 'var(--text-secondary)', border: '1.5px solid var(--border)', padding: '0.35rem 0.85rem' }}>
                {tag === 'all' ? 'All Traditions' : tag}
              </button>
            ))}
          </div>

          {/* Stories grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 80, marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <FontAwesomeIcon icon={faInbox} style={{ fontSize: '2.5rem', color: 'var(--mist)' }} />
              </div>
              <p>No stories found matching your filter criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {stories.map((story, i) => {
                const targetCode = currentLangObj?.langCode;
                const cacheKey = targetCode ? `${story._id}_${targetCode}` : null;
                const translation = cacheKey ? translatedStories[cacheKey] : null;

                const displayTitle = translation?.title || story.title;
                const displayContent = translation?.content || story.content;
                const isTranslated = Boolean(translation && selectedLang !== 'All' && currentLangObj?.langCode !== (LANGUAGE_TO_CODE[story.language] || 'en'));

                return (
                  <div key={story._id} className={`card card-interactive slide-in stagger-${(i % 3) + 1}`}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem', alignItems: 'center' }}>
                      {story.tags.slice(0, 2).map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
                      
                      {isTranslated ? (
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--jade)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {currentLangObj.label} (Translated)
                        </span>
                      ) : (
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {story.language}
                        </span>
                      )}
                    </div>

                    <h3 style={{ marginBottom: '0.4rem', fontSize: '1.05rem', cursor: 'pointer' }} onClick={() => navigate(`/stories/${story._id}`)}>
                      {displayTitle}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', marginBottom: '0.75rem' }}>
                      {displayContent}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleNarrate(story, displayTitle, displayContent)} 
                        className={`btn btn-sm ${playingId === story._id && isSpeaking ? 'btn-primary' : 'btn-ghost'}`}
                        aria-label={playingId === story._id && isSpeaking ? `Stop narrating ${displayTitle}` : `Listen to ${displayTitle} in ${currentLangObj?.name || story.language}`}
                      >
                        {playingId === story._id && isSpeaking ? (
                          <>
                            <div className="wave-container" style={{ marginRight: '4px', height: '14px', width: '25px' }}>
                              <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                              <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                              <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                              <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                            </div>
                            Stop Audio
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faPlay} /> Listen ({currentLangObj?.label || story.language})
                          </>
                        )}
                      </button>
                      <button onClick={() => handleVote(story._id)} className="btn btn-ghost btn-sm" aria-label={`Vote for story, current votes: ${story.votes}`}>
                        <FontAwesomeIcon icon={faHeart} style={{ color: 'var(--vermillion)' }} /> {story.votes}
                      </button>
                      <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--jade)', fontWeight: 600 }}>{story.authenticity}%</span> heritage match
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
