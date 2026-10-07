import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone, faMicrophoneSlash, faLightbulb, faCodeBranch,
  faUpload, faWandMagicSparkles, faHistory, faSave, faRandom,
  faAward, faMusic, faCheckCircle, faChartBar, faVideo, faFilm, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import NodeTree from '../components/NodeTree';
import WhatIfModal from '../components/WhatIfModal';
import AuthenticityMeter from '../components/AuthenticityMeter';
import { generateNodeSuggestions, analyzeSentiment, SOUNDSCAPES, generateStorySprout } from '../services/mockAI';
import { createStory, saveNodeGraph, addKarma, uploadFile } from '../services/api';

const TAG_OPTIONS = ['mythology', 'resistance', 'migration', 'folklore', 'tribal', 'history', 'nature', 'family'];
const REGIONS = ['North India', 'South India', 'East India', 'West India', 'Central India', 'Northeast India', 'Pan India'];
const LANGUAGES_LIST = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese'];

let nodeIdCounter = 1;

export default function StorytellerPage() {
  const { user, updateUser } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('English');
  const [region, setRegion] = useState('Pan India');
  const [selectedTags, setSelectedTags] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [soundscape, setSoundscape] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedId, setPublishedId] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [arVideo, setArVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [contentConsent, setContentConsent] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const baseContentRef = useRef('');
  const textareaRef = useRef();

  const sentiment_data = content.length > 50 ? analyzeSentiment(content) : null;

  const suggestNodes = () => {
    if (content.trim().length < 30) { showNotification('Write at least 30 characters before suggesting nodes', 'warning'); return; }
    const suggestions = generateNodeSuggestions(content);
    setSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const addNode = (text) => {
    const id = `node-${nodeIdCounter++}`;
    const newNode = {
      id, label: text.slice(0, 40) + '…',
      content: content + '\n\n' + text,
      parentId: activeNodeId || (nodes.length > 0 ? nodes[nodes.length - 1].id : null),
      text
    };
    setNodes(prev => [...prev, newNode]);
    setActiveNodeId(id);
    setContent(newNode.content);
    setShowSuggestions(false);
    showNotification('Node added to story tree.', 'success');
  };

  const selectNode = (node) => {
    setActiveNodeId(node.id);
    setContent(node.content);
    showNotification(`Backtracked to: "${node.label}"`, 'info');
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const publishStory = async () => {
    if (!user) {
      showNotification('Please sign in or create an account to publish stories', 'warning');
      navigate('/auth');
      return;
    }
    if (!contentConsent) {
      showNotification('Please confirm cultural authenticity and CC BY-NC 4.0 licensing consent before publishing', 'warning');
      return;
    }
    if (!title.trim() || (!content.trim() && !audioUrl && !videoUrl)) { showNotification('Title and either content, audio, or video are required', 'warning'); return; }
    setPublishing(true);
    try {
      const story = await createStory({ title, content, language, region, tags: selectedTags, nodeGraph: nodes, audioUrl, videoUrl });
      if (nodes.length > 0) await saveNodeGraph(story._id, nodes).catch(() => {});
      const karmaResult = await addKarma(20);
      updateUser({ karma: karmaResult.karma, badges: karmaResult.badges });
      setPublishedId(story._id);
      showNotification('Story published to Community Vault! +20 Karma points', 'success');
    } catch (err) {
      showNotification(err.error || 'Failed to publish', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleAudioRecord = async () => {
    if (isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const file = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
          showNotification('Uploading audio...', 'info');
          try {
            const res = await uploadFile(file);
            setAudioUrl(res.url);
            showNotification('Audio uploaded successfully!', 'success');
          } catch (err) {
            showNotification('Failed to upload audio', 'error');
          }
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecordingAudio(true);
      } catch (err) {
        showNotification('Microphone access denied', 'error');
      }
    }
  };

  const sproutStory = () => {
    setContent(generateStorySprout());
    showNotification('Story seed prompt generated successfully.', 'success');
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--terracotta)', marginBottom: '0.2rem' }}>
            <FontAwesomeIcon icon={faMicrophone} style={{ marginRight: 10 }} />
            Storyteller Workshop
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Craft, branch, and publish oral and written traditions to the vault</p>
        </div>
        {user && (
          <span className="karma-display">
            <FontAwesomeIcon icon={faAward} style={{ marginRight: 6, color: 'var(--gold)' }} />
            {user.karma || 0} Karma
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        {/* Main editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title + metadata */}
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="story-title">Story Title</label>
                <input id="story-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your story a resonant title…" />
              </div>
              <div>
                <label htmlFor="story-language">Language</label>
                <select id="story-language" value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES_LIST.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="story-region">Region</label>
                <select id="story-region" value={region} onChange={e => setRegion(e.target.value)}>
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label>Story Tags</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {TAG_OPTIONS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`tag tag-${tag}`}
                    style={{ cursor: 'pointer', border: `1.5px solid ${selectedTags.includes(tag) ? 'currentColor' : 'transparent'}`, background: selectedTags.includes(tag) ? undefined : 'var(--bg-elevated)', padding: '0.3rem 0.8rem' }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <button onClick={suggestNodes} className="btn btn-ghost btn-sm">
                <FontAwesomeIcon icon={faLightbulb} /> Suggest Nodes
              </button>
              <button onClick={() => setShowWhatIf(true)} className="btn btn-ghost btn-sm">
                <FontAwesomeIcon icon={faRandom} /> What If?
              </button>
              <button onClick={sproutStory} className="btn btn-ghost btn-sm">
                <FontAwesomeIcon icon={faWandMagicSparkles} /> Story Sprout
              </button>
              <button onClick={handleAudioRecord} className={`btn btn-sm ${isRecordingAudio ? 'btn-primary' : 'btn-ghost'}`}>
                {isRecordingAudio ? (
                  <>
                    <div className="wave-container" style={{ marginRight: '4px', height: '14px', width: '25px' }}>
                      <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                      <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                      <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                      <div className="wave-bar" style={{ width: '2px', background: '#fff' }} />
                    </div>
                    Recording…
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faMicrophone} /> Record Audio
                  </>
                )}
              </button>
              <button onClick={() => setShowAR(true)} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                <FontAwesomeIcon icon={faUpload} /> Upload your video
              </button>
            </div>
            <label htmlFor="story-content" className="sr-only">Story Narrative</label>
            <textarea
              id="story-content"
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Begin your story here… or use 'Record Audio' to record oral traditions.

You can write about ancient kingdoms, forgotten migrations, tribal wisdom, or oral history passed down through generations.

Click 'Suggest Nodes' when you need inspiration for what happens next."
              style={{ width: '100%', minHeight: 360, padding: '1.25rem', border: 'none', resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: 'var(--base-font-size)', lineHeight: 1.8, background: 'transparent', color: 'var(--text-primary)' }}
            />
            {sentiment_data && (
              <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span>Mood: <strong style={{ color: 'var(--text-primary)' }}>{sentiment_data.mood}</strong></span>
                <span><FontAwesomeIcon icon={faMicrophone} style={{ marginRight: 4 }} /> {sentiment_data.narrationStyle}</span>
                <span style={{ marginLeft: 'auto' }}>{content.length} chars · ~{Math.ceil(content.split(' ').length / 200)} min read</span>
              </div>
            )}
            {audioUrl && (
              <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}><FontAwesomeIcon icon={faMusic} style={{ marginRight: 6 }} />Attached Audio:</span>
                <audio src={audioUrl} controls style={{ height: '30px' }} />
                <button onClick={() => setAudioUrl(null)} className="btn btn-ghost btn-sm" style={{ color: 'var(--vermillion)', marginLeft: 'auto' }}>Remove</button>
              </div>
            )}
          </div>

          {/* Node suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="card slide-in">
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}><FontAwesomeIcon icon={faLightbulb} style={{ color: 'var(--gold)', marginRight: 6 }} />Continue the Story…</h3>
                <button onClick={() => setShowSuggestions(false)} className="btn btn-ghost btn-sm" aria-label="Close suggestions">✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => addNode(s)} className="btn btn-ghost"
                    style={{ textAlign: 'left', fontFamily: 'var(--font-body)', lineHeight: 1.5, height: 'auto', whiteSpace: 'normal' }}>
                    <FontAwesomeIcon icon={faCodeBranch} style={{ color: 'var(--terracotta)', marginRight: 8, flexShrink: 0 }} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Node tree */}
          {nodes.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FontAwesomeIcon icon={faHistory} style={{ color: 'var(--terracotta)' }} />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Story Branch Tree</h3>
              </div>
              <NodeTree nodes={nodes} activeNodeId={activeNodeId} onSelectNode={selectNode} />
            </div>
          )}

          {/* Publish */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(180,95,43,0.08), rgba(201,149,42,0.08))' }}>
            {publishedId ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '2.5rem', color: 'var(--jade)' }} />
                </div>
                <h3>Story Published!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Your story is now archived in the Community Vault</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button onClick={() => navigate(`/stories/${publishedId}`)} className="btn btn-primary">View Story</button>
                  <button onClick={() => { setTitle(''); setContent(''); setNodes([]); setPublishedId(null); setSelectedTags([]); setContentConsent(false); }} className="btn btn-ghost">Write Another</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: '0 0 0.25rem' }}>Ready to Publish?</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Contribute your story to the community archive and earn Karma points</p>
                </div>

                <div style={{ margin: '0.75rem 0 1rem', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <label htmlFor="content-licensing-consent" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', margin: 0, color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      id="content-licensing-consent"
                      checked={contentConsent} 
                      onChange={e => setContentConsent(e.target.checked)} 
                      style={{ marginTop: '0.2rem' }}
                    />
                    <span>
                      I verify this cultural narrative is respectful, authentic, and free of proprietary or sacred privacy infringements. I license this contribution under <strong>Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)</strong> as per KathaVani terms.
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={publishStory} 
                    className="btn btn-primary btn-lg" 
                    disabled={publishing || !contentConsent || !title.trim() || (!content.trim() && !audioUrl && !videoUrl)}
                  >
                    <FontAwesomeIcon icon={faUpload} /> {publishing ? 'Publishing…' : 'Publish to Vault'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Authenticity meter */}
          <AuthenticityMeter content={content} tags={selectedTags} />

          {/* Soundscape */}
          <div className="card card-interactive">
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
              <FontAwesomeIcon icon={faMusic} style={{ marginRight: 6, color: 'var(--terracotta)' }} />
              Cultural Soundscape
            </h3>
            <label htmlFor="story-soundscape" className="sr-only">Cultural Soundscape</label>
            <select id="story-soundscape" value={soundscape} onChange={e => setSoundscape(e.target.value)} style={{ marginBottom: '0.5rem' }}>
              <option value="">Choose ambience…</option>
              {SOUNDSCAPES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {soundscape && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                {SOUNDSCAPES.find(s => s.id === soundscape)?.description}
              </p>
            )}
          </div>

          {/* Story stats */}
          <div className="card card-interactive">
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
              <FontAwesomeIcon icon={faChartBar} style={{ marginRight: 6, color: 'var(--terracotta)' }} />
              Story Statistics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div className="flex-between"><span style={{ color: 'var(--text-muted)' }}>Words</span><strong>{content.split(/\s+/).filter(Boolean).length}</strong></div>
              <div className="flex-between"><span style={{ color: 'var(--text-muted)' }}>Characters</span><strong>{content.length}</strong></div>
              <div className="flex-between"><span style={{ color: 'var(--text-muted)' }}>Story Nodes</span><strong>{nodes.length}</strong></div>
              <div className="flex-between"><span style={{ color: 'var(--text-muted)' }}>Est. Read Time</span><strong>~{Math.max(1, Math.ceil(content.split(' ').length / 200))} min</strong></div>
            </div>
          </div>

          {/* Tips */}
          <div className="card card-interactive" style={{ background: 'rgba(58,122,92,0.06)', border: '1px solid rgba(58,122,92,0.2)' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--jade)' }}>
              <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: 6 }} />
              Storyteller Guidelines
            </h3>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li>Use historical names like "Chola", "Mughal" to provide context</li>
              <li>Include location details for geo-tagging on the map</li>
              <li>Click "Suggest Nodes" to branch your narrative</li>
              <li>Backtrack to any node to explore alternate paths</li>
            </ul>
          </div>
        </div>
      </div>

      {/* What If Modal */}
      {showWhatIf && <WhatIfModal content={content} onClose={() => setShowWhatIf(false)} onApply={(text) => { setContent(content + '\n\n--- ALTERNATE ENDING ---\n\n' + text); setShowWhatIf(false); }} />}

      {/* Video Upload Modal */}
      {showAR && (
        <div className="modal-overlay" onClick={() => setShowAR(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>
              <FontAwesomeIcon icon={faVideo} style={{ marginRight: 8, color: 'var(--terracotta)' }} />
              Upload Video Story
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Upload a video recording of oral storytelling to share with the community.
            </p>
            <div style={{ background: 'var(--bg)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', marginBottom: '1.5rem' }}>
              {videoUrl ? (
                <video src={videoUrl} controls autoPlay style={{ width: '100%', maxHeight: '400px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
              ) : (
                <>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <FontAwesomeIcon icon={faFilm} style={{ fontSize: '2.5rem', color: 'var(--terracotta)' }} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                    "{title || 'Your Story'}"
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No video uploaded yet</p>
                </>
              )}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="btn btn-ghost" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)' }}>
                <FontAwesomeIcon icon={faUpload} /> Choose Video File
                <input 
                  type="file" 
                  accept="video/*" 
                  style={{ display: 'none' }} 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      showNotification('Uploading video...', 'info');
                      try {
                        const res = await uploadFile(file);
                        setVideoUrl(res.url);
                        showNotification('Video uploaded successfully!', 'success');
                      } catch (err) {
                        showNotification('Failed to upload video', 'error');
                      }
                    }
                  }}
                />
              </label>
              {videoUrl && (
                <button onClick={() => setVideoUrl(null)} className="btn btn-ghost" style={{ marginLeft: '0.5rem', color: 'var(--vermillion)' }}>
                  Clear
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setShowAR(false)} className="btn btn-ghost">Close</button>
              <button onClick={() => { setShowAR(false); publishStory(); }} className="btn btn-primary" disabled={publishing || !contentConsent || !title.trim() || (!content.trim() && !audioUrl && !videoUrl)}>
                Submit Story
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .storyteller-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
