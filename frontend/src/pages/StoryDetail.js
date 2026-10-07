import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faStop, faHeart, faArrowLeft, faMapMarkerAlt, faCalendar,
  faLanguage, faMicrophone, faVideo, faMusic, faCodeBranch, faWaveSquare, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { getStory, voteStory, addKarma } from '../services/api';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { LANGUAGES, analyzeSentiment } from '../services/mockAI';
import AuthenticityMeter from '../components/AuthenticityMeter';
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
  const translationCacheRef = useRef({});
  const { speak, stopSpeaking, isSpeaking, systemVoices } = useSpeech();
  const { user, updateUser } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    getStory(id).then(s => {
      setStory(s);
      setLoading(false);
      if (s && s.content) {
        setSentiment(analyzeSentiment(s.content));
      }
    }).catch(() => setLoading(false));
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
      showNotification('+5 karma points for voting!', 'success');
    } catch (err) { showNotification(err.error || 'Already voted', 'warning'); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><div className="skeleton" style={{ height: 200, maxWidth: 600, margin: '0 auto' }} /></div>;
  if (!story) return <div style={{ textAlign: 'center', padding: '3rem' }}><h2>Story not found</h2><button onClick={() => navigate(-1)} className="btn btn-primary">Go Back</button></div>;

  return (
    <div className="fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {story.tags.map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
          {story.isModerated && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--jade)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>✓ MODERATED</span>}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', lineHeight: 1.15, marginBottom: '0.75rem' }}>
          {translating ? 'Translating...' : (translatedTitle || story.title)}
        </h1>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>by <strong style={{ color: 'var(--text-secondary)' }}>{story.authorName}</strong></span>
          {story.region && <span><FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: 4 }} />{story.region}</span>}
          <span><FontAwesomeIcon icon={faCalendar} style={{ marginRight: 4 }} />{new Date(story.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span><FontAwesomeIcon icon={faLanguage} style={{ marginRight: 4 }} />{story.language}</span>
        </div>
      </div>

      {/* TTS Controls */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <select value={selectedLang} onChange={e => { setSelectedLang(e.target.value); setSelectedVoiceName(''); }} style={{ width: 'auto', fontSize: '0.88rem', padding: '0.4rem 0.7rem', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {l.name} ({l.label})
            </option>
          ))}
        </select>
        
        {systemVoices.filter(v => v.lang === selectedLang || v.lang.startsWith(selectedLang.split('-')[0])).length > 0 && (
          <select value={selectedVoiceName} onChange={e => setSelectedVoiceName(e.target.value)} style={{ width: 'auto', fontSize: '0.88rem', padding: '0.4rem 0.7rem', maxWidth: '280px' }}>
            <option value="">Default Speaker Voice</option>
            {systemVoices
              .filter(v => v.lang === selectedLang || v.lang.startsWith(selectedLang.split('-')[0]))
              .map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))
            }
          </select>
        )}

        <button onClick={handleNarrate} className={`btn ${isSpeaking ? 'btn-primary' : 'btn-jade'}`}>
          <FontAwesomeIcon icon={isSpeaking ? faStop : faMicrophone} />
          {isSpeaking ? 'Stop Narration' : 'Narrate Story'}
        </button>
        <button onClick={handleVote} className="btn btn-ghost">
          <FontAwesomeIcon icon={faHeart} style={{ color: 'var(--vermillion)' }} /> {story.votes} community votes
        </button>
      </div>

      {/* Emotion-aware voice synthesis display */}
      {sentiment && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(180,95,43,0.06)', border: '1px solid rgba(180,95,43,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.25rem' }}>
          <FontAwesomeIcon icon={faWaveSquare} style={{ color: 'var(--terracotta)', fontSize: '1.3rem' }} />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--terracotta)' }}>Emotion-Aware Voice Synthesis ({sentiment.mood})</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{sentiment.narrationStyle}</div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {story.videoUrl && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem', textAlign: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--terracotta)' }}>
            <FontAwesomeIcon icon={faVideo} /> Watch Video Story
          </h3>
          <div style={{ background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '100%', border: '1px solid var(--border)' }}>
            <video src={story.videoUrl} controls style={{ width: '100%', maxHeight: '450px', display: 'block', margin: '0 auto', objectFit: 'contain' }} />
          </div>
        </div>
      )}

      {/* Audio Player */}
      {story.audioUrl && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <strong style={{ fontSize: '0.95rem', color: 'var(--terracotta)' }}>
            <FontAwesomeIcon icon={faMusic} style={{ marginRight: 6 }} />Listen to Original Audio:
          </strong>
          <audio src={story.audioUrl} controls style={{ flex: 1, height: '36px' }} />
        </div>
      )}

      {/* Story content */}
      <div className="card" style={{ marginBottom: '1.5rem', position: 'relative', minHeight: '150px' }}>
        {translating && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--bg-elevated)',
            opacity: 0.92,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            borderRadius: 'var(--radius-md)'
          }}>
            <div className="spinner" style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--terracotta)', fontWeight: 600 }}>Translating story...</span>
          </div>
        )}
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          lineHeight: 1.9,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          opacity: translating ? 0.3 : 1,
          transition: 'opacity 0.2s ease'
        }}>
          {translatedContent || story.content}
        </div>
      </div>

      {/* Copyright Licensing Attribution Box */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <FontAwesomeIcon icon={faShieldAlt} style={{ color: 'var(--terracotta)' }} />
          Archival Licensing & Attribution Notice
        </div>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          © {story.authorName} &middot; KathaVani Cultural Heritage Archive. This narrative contribution is licensed under{' '}
          <strong>Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)</strong>. Traditional custodianship remains with the originating communities and storyteller.
        </p>
      </div>

      {/* Authenticity */}
      <div style={{ marginBottom: '1.5rem' }}>
        <AuthenticityMeter content={story.content} tags={story.tags} />
      </div>

      {/* Node graph preview */}
      {story.nodeGraph?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
            <FontAwesomeIcon icon={faCodeBranch} style={{ marginRight: 6, color: 'var(--terracotta)' }} />
            This story has {story.nodeGraph.length} branching narrative nodes
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>The storyteller explored multiple paths before settling on this narrative.</p>
        </div>
      )}

      {/* Location map */}
      {story.lat && story.lng && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: 6, color: 'var(--terracotta)' }} />
            Story Origin: {story.region}
          </h3>
          <div style={{ height: 200, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <iframe
              title={`Story location map for ${story.region}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${story.lng - 2},${story.lat - 2},${story.lng + 2},${story.lat + 2}&layer=mapnik&marker=${story.lat},${story.lng}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
