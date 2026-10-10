import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, faCheck, faVault, faSync, 
  faHeart, faBookOpen, faHdd, faBroadcastTower, faMicrophone, faCircle,
  faSignInAlt, faTrash, faArrowRight, faPenToSquare, faBookmark
} from '@fortawesome/free-solid-svg-icons';
import { 
  getOfflinePacks as apiGetOfflinePacks, 
  syncOfflineStories, 
  getStories, 
  deleteStory 
} from '../services/api';
import { 
  savePackOffline, 
  getOfflinePacks, 
  removeOfflinePack, 
  getPendingStories, 
  clearPendingStories 
} from '../services/offline';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function VaultPage() {
  const [packs, setPacks] = useState([]);
  const [localPacks, setLocalPacks] = useState({});
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [pendingSync, setPendingSync] = useState([]);
  const [tab, setTab] = useState('stories'); // 'stories' (My Stories), 'offline' (Offline Packs), 'liked' (Liked Stories)
  const { isOnline, showNotification } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch offline packs
    apiGetOfflinePacks().then(setPacks).catch(() => {});

    // 2. Fetch stories from server for personal vault
    setLoadingStories(true);
    getStories({ limit: 100 })
      .then(d => setStories(d.stories || []))
      .catch(() => {})
      .finally(() => setLoadingStories(false));

    // 3. Check local offline storage & sync queue
    loadLocalStatus();
    getPendingStories().then(setPendingSync).catch(() => {});
  }, [user]);

  const loadLocalStatus = async () => {
    const dl = {};
    const localPs = await getOfflinePacks();
    localPs.forEach(p => { dl[p.id] = true; });
    setLocalPacks(dl);
  };

  const handleDownload = async (pack) => {
    try {
      await savePackOffline(pack);
      setLocalPacks(prev => ({ ...prev, [pack.id]: true }));
      showNotification(`"${pack.name}" saved for offline access!`, 'success');
    } catch {
      showNotification('Failed to save offline', 'error');
    }
  };

  const handleRemove = async (packId) => {
    await removeOfflinePack(packId);
    setLocalPacks(prev => { const n = { ...prev }; delete n[packId]; return n; });
    showNotification('Pack removed from offline storage', 'info');
  };

  const handleSync = async () => {
    if (!isOnline) { 
      showNotification('You are offline. Connect to sync stories.', 'warning'); 
      return; 
    }
    const pending = await getPendingStories();
    if (pending.length === 0) { 
      showNotification('Nothing to sync', 'info'); 
      return; 
    }
    try {
      const result = await syncOfflineStories(pending);
      await clearPendingStories();
      setPendingSync([]);
      showNotification(`Synced ${result.count} stories successfully!`, 'success');
      // Refresh stories list after sync
      getStories({ limit: 100 }).then(d => setStories(d.stories || [])).catch(() => {});
    } catch {
      showNotification('Sync failed. Try again.', 'error');
    }
  };

  const handleDeleteStory = async (storyId, storyTitle, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${storyTitle}" from the vault?`)) {
      return;
    }
    try {
      await deleteStory(storyId);
      setStories(prev => prev.filter(s => s._id !== storyId));
      showNotification('Story deleted from your vault', 'info');
    } catch (err) {
      showNotification(err.error || 'Failed to delete story', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. Stories Created by Currently Logged-in User
  // ─────────────────────────────────────────────────────────────
  const myStories = user ? stories.filter(story => {
    const uid = (user._id || user.id || '').toString();
    const uName = (user.name || '').trim().toLowerCase();
    const authorId = (story.author?._id || story.author || '').toString();
    const authorName = (story.authorName || '').trim().toLowerCase();
    return (uid && authorId === uid) || (uName && authorName === uName);
  }) : [];

  // ─────────────────────────────────────────────────────────────
  // 2. Stories Liked / Voted by Currently Logged-in User
  // ─────────────────────────────────────────────────────────────
  const bookmarkedIds = (() => {
    try {
      return JSON.parse(localStorage.getItem('kv_bookmarked') || '[]');
    } catch {
      return [];
    }
  })();

  const likedStories = user ? stories.filter(story => {
    const uid = (user._id || user.id || '').toString();
    const isVoted = Array.isArray(story.voterIds) && story.voterIds.some(v => {
      const vId = (v?._id || v || '').toString();
      return vId === uid;
    });
    const isBookmarked = bookmarkedIds.includes(story._id);
    return isVoted || isBookmarked;
  }) : [];

  return (
    <div className="fade-in" style={{ paddingBottom: '3.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--forest-green)', marginBottom: '0.35rem', fontFamily: 'var(--font-display)', fontSize: '2.1rem' }}>
            <FontAwesomeIcon icon={faVault} style={{ marginRight: 10, color: 'var(--terracotta)' }} />
            Community Vault
          </h1>
          <p style={{ color: 'var(--charcoal-muted)', margin: 0, fontSize: '0.98rem' }}>
            Your personal story archives, liked oral lore, and offline heritage packs
          </p>
        </div>
        {pendingSync.length > 0 && (
          <button onClick={handleSync} className="btn btn-primary btn-sm">
            <FontAwesomeIcon icon={faSync} /> Sync {pendingSync.length} Stories
          </button>
        )}
      </div>

      {/* Vault Tabs */}
      <div className="tab-nav" style={{ marginBottom: '2rem' }}>
        {[
          { id: 'stories', label: 'My Stories', icon: faBookOpen, count: user ? myStories.length : null },
          { id: 'offline', label: 'Offline Packs', icon: faHdd, count: packs.length },
          { id: 'liked', label: 'Liked Stories', icon: faHeart, count: user ? likedStories.length : null }
        ].map(t => (
          <button 
            key={t.id} 
            className={`tab-btn ${tab === t.id ? 'active' : ''}`} 
            onClick={() => setTab(t.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FontAwesomeIcon icon={t.icon} style={{ color: tab === t.id ? 'var(--terracotta)' : 'inherit' }} />
            <span>{t.label}</span>
            {t.count !== null && t.count !== undefined && (
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.12rem 0.5rem',
                  borderRadius: '12px',
                  background: tab === t.id ? 'rgba(184, 93, 52, 0.18)' : 'rgba(27, 59, 43, 0.08)',
                  color: tab === t.id ? 'var(--terracotta)' : 'var(--charcoal-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: MY STORIES (Stories created by the user)
      ────────────────────────────────────────────────────────────── */}
      {tab === 'stories' && (
        <div>
          {!user ? (
            <div className="card editorial-card-3d" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-card)' }}>
              <div 
                style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: '50%', 
                  background: 'var(--terracotta-subtle)', 
                  color: 'var(--terracotta)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.8rem', 
                  marginBottom: '1.25rem' 
                }}
              >
                <FontAwesomeIcon icon={faBookOpen} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-green)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                Sign in to View Your Contributed Stories
              </h2>
              <p style={{ color: 'var(--charcoal-muted)', maxWidth: 520, margin: '0 auto 1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Log in to access, manage, and read the oral folklore, regional histories, and living memories you have contributed to the vault.
              </p>
              <button onClick={() => navigate('/auth')} className="btn btn-primary btn-md">
                <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: 6 }} /> Sign In to KathaVani
              </button>
            </div>
          ) : loadingStories ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-muted)' }}>
              Loading your stories from the vault...
            </div>
          ) : myStories.length === 0 ? (
            <div className="card editorial-card-3d" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-card)' }}>
              <div 
                style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: '50%', 
                  background: 'rgba(27, 59, 43, 0.08)', 
                  color: 'var(--forest-green)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.8rem', 
                  marginBottom: '1.25rem' 
                }}
              >
                <FontAwesomeIcon icon={faMicrophone} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-green)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                No Stories Contributed Yet
              </h2>
              <p style={{ color: 'var(--charcoal-muted)', maxWidth: 520, margin: '0 auto 1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                You haven't published any stories to the community vault yet. Share your first regional folklore, family memoir, or community ballad to safeguard it forever.
              </p>
              <button onClick={() => navigate('/storyteller')} className="btn btn-primary btn-md">
                <FontAwesomeIcon icon={faMicrophone} style={{ marginRight: 6 }} /> Contribute Your First Story
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--charcoal-muted)', fontFamily: 'var(--font-mono)' }}>
                  Showing {myStories.length} {myStories.length === 1 ? 'story' : 'stories'} contributed by you
                </span>
                <button onClick={() => navigate('/storyteller')} className="btn btn-ghost btn-sm" style={{ color: 'var(--terracotta)' }}>
                  + Write Another Story
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
                {myStories.map((story, i) => (
                  <div 
                    key={story._id} 
                    className={`card editorial-card-3d slide-in stagger-${(i % 3) + 1}`} 
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} 
                    onClick={() => navigate(`/stories/${story._id}`)}
                  >
                    <div>
                      {/* Top tags & status */}
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {(story.tags || []).slice(0, 2).map(t => (
                          <span key={t} className={`tag tag-${t}`}>{t}</span>
                        ))}
                        <span 
                          style={{ 
                            marginLeft: 'auto', 
                            fontSize: '0.72rem', 
                            color: 'var(--forest-green)', 
                            fontFamily: 'var(--font-mono)',
                            background: 'rgba(27, 59, 43, 0.08)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '10px'
                          }}
                        >
                          {story.isModerated ? '✓ archived' : 'community review'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.15rem', color: 'var(--forest-green)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        {story.title}
                      </h3>

                      {/* Snippet */}
                      <p style={{ fontSize: '0.88rem', color: 'var(--charcoal-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', margin: 0, lineHeight: 1.6 }}>
                        {story.content}
                      </p>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-delicate)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--charcoal-muted)' }}>
                      <span style={{ color: 'var(--forest-green)', fontWeight: 600 }}>
                        {story.authenticity || 85}% authenticity
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span>
                          <FontAwesomeIcon icon={faHeart} style={{ color: 'var(--terracotta)', marginRight: 4 }} />
                          {story.votes || 0}
                        </span>
                        <button
                          onClick={(e) => handleDeleteStory(story._id, story.title, e)}
                          title="Delete this story"
                          aria-label={`Delete ${story.title}`}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.2rem 0.5rem', color: 'var(--charcoal-faint)', fontSize: '0.78rem' }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: OFFLINE PACKS (Intact & Fully Functional)
      ────────────────────────────────────────────────────────────── */}
      {tab === 'offline' && (
        <div>
          <div 
            style={{ 
              background: isOnline ? 'rgba(58,122,92,0.08)' : 'rgba(201,149,42,0.08)', 
              border: `1px solid ${isOnline ? 'rgba(58,122,92,0.2)' : 'rgba(201,149,42,0.3)'}`, 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem 1.1rem', 
              marginBottom: '1.5rem', 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            {isOnline ? (
              <span>
                <FontAwesomeIcon icon={faCircle} style={{ color: 'var(--forest-green)', fontSize: '0.75rem', marginRight: 6 }} /> 
                You are online. Downloads will save securely to your browser storage for zero-connectivity reading.
              </span>
            ) : (
              <span>
                <FontAwesomeIcon icon={faCircle} style={{ color: 'var(--gold)', fontSize: '0.75rem', marginRight: 6 }} /> 
                You are offline. Downloaded heritage packs remain accessible below without an internet connection.
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {packs.map((pack, i) => (
              <div key={pack.id} className={`card editorial-card-3d slide-in stagger-${(i % 3) + 1}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--forest-green)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {pack.name}
                  </h3>
                  {localPacks[pack.id] && (
                    <span style={{ background: 'rgba(58,122,92,0.15)', color: 'var(--forest-green)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600 }}>
                      <FontAwesomeIcon icon={faCheck} style={{ marginRight: 4 }} />Saved
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--charcoal-muted)', marginBottom: '0.85rem', lineHeight: 1.6 }}>
                  {pack.description}
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--charcoal-muted)', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
                  <span><FontAwesomeIcon icon={faBookOpen} style={{ marginRight: 5, color: 'var(--terracotta)' }} />{pack.storyCount} stories</span>
                  <span><FontAwesomeIcon icon={faHdd} style={{ marginRight: 5 }} />{pack.size}</span>
                </div>
                {localPacks[pack.id] ? (
                  <button onClick={() => handleRemove(pack.id)} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
                    Remove Offline Copy
                  </button>
                ) : (
                  <button onClick={() => handleDownload(pack)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    <FontAwesomeIcon icon={faDownload} /> Download for Offline
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Offline Story Radio Info */}
          <div className="card editorial-card-3d" style={{ marginTop: '2rem', background: 'rgba(32, 58, 67, 0.05)', border: '1px solid rgba(32, 58, 67, 0.15)' }}>
            <h3 style={{ color: 'var(--forest-green)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
              <FontAwesomeIcon icon={faBroadcastTower} style={{ marginRight: 8, color: 'var(--terracotta)' }} />
              Offline Story Radio
            </h3>
            <p style={{ color: 'var(--charcoal-muted)', fontSize: '0.92rem', marginBottom: '0.85rem', lineHeight: 1.6 }}>
              Peer-to-peer folklore distribution for rural and remote areas with zero cellular connectivity. Share downloaded audio packs across local mesh devices using browser protocols.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => showNotification('P2P local sharing protocol is currently under community development.', 'info')}>
              Learn About Local Story Sharing
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: LIKED STORIES (Stories liked / voted by user)
      ────────────────────────────────────────────────────────────── */}
      {tab === 'liked' && (
        <div>
          {!user ? (
            <div className="card editorial-card-3d" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-card)' }}>
              <div 
                style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: '50%', 
                  background: 'rgba(184, 93, 52, 0.12)', 
                  color: 'var(--terracotta)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.8rem', 
                  marginBottom: '1.25rem' 
                }}
              >
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-green)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                Sign in to View Your Liked Stories
              </h2>
              <p style={{ color: 'var(--charcoal-muted)', maxWidth: 520, margin: '0 auto 1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Log in to see all the oral tales, myths, and community folklore you have liked and bookmarked across India.
              </p>
              <button onClick={() => navigate('/auth')} className="btn btn-primary btn-md">
                <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: 6 }} /> Sign In to KathaVani
              </button>
            </div>
          ) : loadingStories ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-muted)' }}>
              Loading your liked stories...
            </div>
          ) : likedStories.length === 0 ? (
            <div className="card editorial-card-3d" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-card)' }}>
              <div 
                style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: '50%', 
                  background: 'rgba(184, 93, 52, 0.1)', 
                  color: 'var(--terracotta)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.8rem', 
                  marginBottom: '1.25rem' 
                }}
              >
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-green)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                No Liked Stories Yet
              </h2>
              <p style={{ color: 'var(--charcoal-muted)', maxWidth: 520, margin: '0 auto 1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                You haven't liked or voted for any stories yet. Explore the living story archive and vote for oral narratives that resonate with you to save them to your personal vault.
              </p>
              <button onClick={() => navigate('/listener')} className="btn btn-primary btn-md">
                <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: 6 }} /> Browse Story Archive
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--charcoal-muted)', fontFamily: 'var(--font-mono)' }}>
                  Showing {likedStories.length} {likedStories.length === 1 ? 'story' : 'stories'} liked by you
                </span>
                <button onClick={() => navigate('/listener')} className="btn btn-ghost btn-sm" style={{ color: 'var(--forest-green)' }}>
                  Browse More Tales <FontAwesomeIcon icon={faArrowRight} size="xs" style={{ marginLeft: 4 }} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
                {likedStories.map((story, i) => (
                  <div 
                    key={story._id} 
                    className={`card editorial-card-3d slide-in stagger-${(i % 3) + 1}`} 
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} 
                    onClick={() => navigate(`/stories/${story._id}`)}
                  >
                    <div>
                      {/* Top tags */}
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {(story.tags || []).slice(0, 2).map(t => (
                          <span key={t} className={`tag tag-${t}`}>{t}</span>
                        ))}
                        <span 
                          style={{ 
                            marginLeft: 'auto', 
                            fontSize: '0.72rem', 
                            color: 'var(--terracotta)', 
                            fontFamily: 'var(--font-mono)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <FontAwesomeIcon icon={faHeart} size="xs" /> Liked
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.15rem', color: 'var(--forest-green)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        {story.title}
                      </h3>

                      {/* Snippet */}
                      <p style={{ fontSize: '0.88rem', color: 'var(--charcoal-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', margin: 0, lineHeight: 1.6 }}>
                        {story.content}
                      </p>
                    </div>

                    {/* Bottom Metadata */}
                    <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-delicate)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--charcoal-muted)' }}>
                      <span>by {story.authorName || 'Anonymous Custodian'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ color: 'var(--forest-green)', fontWeight: 600 }}>
                          {story.authenticity || 85}% match
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faHeart} style={{ color: 'var(--terracotta)', marginRight: 4 }} />
                          {story.votes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
