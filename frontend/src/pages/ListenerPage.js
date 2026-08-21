import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faVolumeUp, faMapMarkerAlt, faFilter, faSearch, faHeart } from '@fortawesome/free-solid-svg-icons';
import { getStories, voteStory, getGeoStories } from '../services/api';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { LANGUAGES, analyzeSentiment } from '../services/mockAI';
import StoryMap from '../components/StoryMap';

const TAGS = ['all', 'mythology', 'resistance', 'migration', 'folklore', 'tribal', 'history'];
const LANG_NAMES = ['All', 'English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Kannada'];

export default function ListenerPage() {
  const [stories, setStories] = useState([]);
  const [geoStories, setGeoStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedLang, setSelectedLang] = useState('All');
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [selectedLangTTS, setSelectedLangTTS] = useState('en-IN');
  const [tab, setTab] = useState('browse');
  const { speak, stopSpeaking, isSpeaking } = useSpeech();
  const { user } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
    getGeoStories().then(setGeoStories).catch(() => {});
  }, [selectedTag, selectedLang, search]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedTag !== 'all') params.tag = selectedTag;
      if (selectedLang !== 'All') params.language = selectedLang;
      if (search) params.search = search;
      const data = await getStories(params);
      setStories(data.stories || []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNarrate = (story) => {
    if (playingId === story._id && isSpeaking) {
      stopSpeaking();
      setPlayingId(null);
      return;
    }
    const langCode = selectedLangTTS;
    setPlayingId(story._id);
    const sentiment = analyzeSentiment(story.content || '');
    speak(`${story.title}. ${story.content}`, langCode, sentiment?.mood, null, () => setPlayingId(null));
  };

  const handleVote = async (storyId) => {
    if (!user) { showNotification('Sign in to vote for stories', 'warning'); return; }
    try {
      await voteStory(storyId);
      setStories(prev => prev.map(s => s._id === storyId ? { ...s, votes: s.votes + 1 } : s));
      showNotification('Vote recorded! +5 karma ⭐', 'success');
    } catch (err) {
      showNotification(err.error || 'Already voted', 'warning');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--terracotta)', marginBottom: '0.2rem' }}>📖 Story Listener</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Browse, listen, and explore stories from across India</p>
      </div>

      {/* Mode tabs */}
      <div className="tab-nav" style={{ marginBottom: '1.5rem', maxWidth: 480 }}>
        {[{ id: 'browse', label: 'Browse Stories', icon: '📚' }, { id: 'map', label: 'Story Map', icon: '🗺️' }].map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'map' ? (
        <div>
          <div className="card" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              📍 Click any marker on the map to read a geo-tagged story from that region
            </p>
          </div>
          <StoryMap stories={geoStories} onSelectStory={(id) => navigate(`/stories/${id}`)} />
        </div>
      ) : (
        <>
          {/* Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories…" style={{ paddingLeft: '2.2rem' }} />
            </div>
            <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)} style={{ width: 'auto' }}>
              {LANG_NAMES.map(l => <option key={l}>{l}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <FontAwesomeIcon icon={faVolumeUp} />
              <select value={selectedLangTTS} onChange={e => setSelectedLangTTS(e.target.value)} style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label} ({l.name})</option>)}
              </select>
            </div>
          </div>

          {/* Tag filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {TAGS.map(tag => (
              <button key={tag} onClick={() => setSelectedTag(tag)}
                className={`tag ${tag !== 'all' ? `tag-${tag}` : ''}`}
                style={{ cursor: 'pointer', background: selectedTag === tag ? 'var(--terracotta)' : 'var(--bg-elevated)', color: selectedTag === tag ? '#fff' : 'var(--text-secondary)', border: '1.5px solid var(--border)', padding: '0.35rem 0.85rem' }}>
                {tag === 'all' ? 'All Stories' : tag}
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
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
              <p>No stories found. Try different filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {stories.map((story, i) => (
                <div key={story._id} className={`card card-interactive slide-in stagger-${(i % 3) + 1}`}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                    {story.tags.slice(0, 2).map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{story.language}</span>
                  </div>
                  <h3 style={{ marginBottom: '0.4rem', fontSize: '1.05rem', cursor: 'pointer' }} onClick={() => navigate(`/stories/${story._id}`)}>
                    {story.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', marginBottom: '0.75rem' }}>
                    {story.content}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => handleNarrate(story)} className={`btn btn-sm ${playingId === story._id && isSpeaking ? 'btn-primary' : 'btn-ghost'}`}>
                      {playingId === story._id && isSpeaking ? (
                        <>
                          <div className="wave-container" style={{ marginRight: '4px', height: '14px', width: '25px' }}>
                            <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                            <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                            <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                            <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                          </div>
                          Stop
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPlay} /> Narrate
                        </>
                      )}
                    </button>
                    <button onClick={() => handleVote(story._id)} className="btn btn-ghost btn-sm">
                      <FontAwesomeIcon icon={faHeart} style={{ color: 'var(--vermillion)' }} /> {story.votes}
                    </button>
                    <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--jade)', fontWeight: 700 }}>{story.authenticity}%</span> authentic
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
