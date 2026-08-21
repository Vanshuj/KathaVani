import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCheck, faVault, faSync, faTag } from '@fortawesome/free-solid-svg-icons';
import { getOfflinePacks as apiGetOfflinePacks, syncOfflineStories } from '../services/api';
import { savePackOffline, getOfflinePacks, isPackDownloaded, removeOfflinePack, getPendingStories, clearPendingStories } from '../services/offline';
import { getStories, getVaultTags } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function VaultPage() {
  const [packs, setPacks] = useState([]);
  const [localPacks, setLocalPacks] = useState({});
  const [tags, setTags] = useState({});
  const [stories, setStories] = useState([]);
  const [pendingSync, setPendingSync] = useState([]);
  const [tab, setTab] = useState('stories');
  const { isOnline, showNotification } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    apiGetOfflinePacks().then(setPacks).catch(() => {});
    getVaultTags().then(setTags).catch(() => {});
    getStories({ limit: 20 }).then(d => setStories(d.stories || [])).catch(() => {});
    loadLocalStatus();
    getPendingStories().then(setPendingSync).catch(() => {});
  }, []);

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
    if (!isOnline) { showNotification('You are offline. Connect to sync stories.', 'warning'); return; }
    const pending = await getPendingStories();
    if (pending.length === 0) { showNotification('Nothing to sync', 'info'); return; }
    try {
      const result = await syncOfflineStories(pending);
      await clearPendingStories();
      setPendingSync([]);
      showNotification(`Synced ${result.count} stories successfully!`, 'success');
    } catch {
      showNotification('Sync failed. Try again.', 'error');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--terracotta)', marginBottom: '0.2rem' }}>
            <FontAwesomeIcon icon={faVault} style={{ marginRight: 8 }} />Community Vault
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Shared stories, offline packs, and cultural archives</p>
        </div>
        {pendingSync.length > 0 && (
          <button onClick={handleSync} className="btn btn-jade btn-sm">
            <FontAwesomeIcon icon={faSync} /> Sync {pendingSync.length} Stories
          </button>
        )}
      </div>

      <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
        {[{ id: 'stories', label: 'All Stories' }, { id: 'offline', label: 'Offline Packs' }, { id: 'tags', label: 'Browse by Tag' }].map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'stories' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {stories.map((story, i) => (
            <div key={story._id} className={`card card-interactive slide-in stagger-${(i % 3) + 1}`} style={{ cursor: 'pointer' }} onClick={() => navigate(`/stories/${story._id}`)}>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {story.tags.slice(0, 2).map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
                {story.isModerated && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--jade)', fontFamily: 'var(--font-mono)' }}>✓ moderated</span>}
              </div>
              <h3 style={{ marginBottom: '0.4rem', fontSize: '1rem' }}>{story.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', margin: 0 }}>
                {story.content}
              </p>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>by {story.authorName}</span>
                <span style={{ color: 'var(--jade)', fontWeight: 700 }}>{story.authenticity}% authentic</span>
                <span style={{ marginLeft: 'auto' }}>❤️ {story.votes}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'offline' && (
        <div>
          <div style={{ background: isOnline ? 'rgba(58,122,92,0.08)' : 'rgba(201,149,42,0.08)', border: `1px solid ${isOnline ? 'rgba(58,122,92,0.2)' : 'rgba(201,149,42,0.3)'}`, borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            {isOnline ? '🟢 You\'re online. Downloads will save to your device for offline access.' : '🟡 You\'re offline. Stories you\'ve downloaded are available below.'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {packs.map((pack, i) => (
              <div key={pack.id} className={`card card-interactive slide-in stagger-${(i % 3) + 1}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{pack.name}</h3>
                  {localPacks[pack.id] && <span style={{ background: 'rgba(58,122,92,0.15)', color: 'var(--jade)', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                    <FontAwesomeIcon icon={faCheck} style={{ marginRight: 3 }} />Saved
                  </span>}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{pack.description}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <span>📖 {pack.storyCount} stories</span>
                  <span>💾 {pack.size}</span>
                </div>
                {localPacks[pack.id] ? (
                  <button onClick={() => handleRemove(pack.id)} className="btn btn-ghost btn-sm">Remove Offline Copy</button>
                ) : (
                  <button onClick={() => handleDownload(pack)} className="btn btn-jade btn-sm">
                    <FontAwesomeIcon icon={faDownload} /> Download for Offline
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Offline Radio hint */}
          <div className="card" style={{ marginTop: '1.5rem', background: 'rgba(44,62,122,0.06)', border: '1px solid rgba(44,62,122,0.15)' }}>
            <h3 style={{ color: 'var(--indigo)', marginBottom: '0.5rem' }}>📻 Offline Story Radio</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '0.75rem' }}>
              Enable peer-to-peer story sharing in areas with no internet. Share downloaded packs with nearby devices using WebRTC or local WiFi.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => showNotification('P2P sharing coming soon! For now, download packs to share physically or via local network.', 'info')}>
              Learn About P2P Sharing
            </button>
          </div>
        </div>
      )}

      {tab === 'tags' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {Object.entries(tags).map(([tag, count], i) => (
              <div key={tag} className={`card card-interactive slide-in stagger-${(i % 4) + 1}`} style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate(`/listener?tag=${tag}`)}>
                <div className={`tag tag-${tag}`} style={{ margin: '0 auto 0.5rem', display: 'inline-flex' }}>
                  <FontAwesomeIcon icon={faTag} style={{ marginRight: 4 }} />{tag}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--terracotta)' }}>{count}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>stories</div>
              </div>
            ))}
          </div>
          {user && (
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(180,95,43,0.06), rgba(201,149,42,0.06))', textAlign: 'center' }}>
              <h3>Add to the Vault</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Your stories help preserve India's living heritage</p>
              <button onClick={() => navigate('/storyteller')} className="btn btn-primary">
                🎙️ Share Your Story
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
