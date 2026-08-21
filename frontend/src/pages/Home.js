import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone, faBook, faMapMarkerAlt, faTrophy,
  faVault, faDownload, faStar, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { getFeaturedStories, getLeaderboard } from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    getFeaturedStories().then(setFeatured).catch(() => {});
    getLeaderboard().then(setLeaders).catch(() => {});
  }, []);

  const features = [
    { icon: faMicrophone, title: 'Tell Your Story', desc: 'Voice-driven storytelling with AI-powered node suggestions and branching narratives', to: '/storyteller', color: 'var(--terracotta)' },
    { icon: faBook, title: 'Listen & Explore', desc: 'Multilingual narration in 6 languages with emotion-aware voice synthesis', to: '/listener', color: 'var(--jade)' },
    { icon: faMapMarkerAlt, title: 'Story Trails', desc: 'Geo-tagged tales from every corner of India on an interactive map', to: '/listener', color: 'var(--indigo)' },
    { icon: faVault, title: 'Community Vault', desc: 'A living archive of mythology, resistance, migration and folk tales', to: '/vault', color: 'var(--gold)' },
    { icon: faTrophy, title: 'Quests & Badges', desc: 'Earn karma, unlock badges, and champion India\'s cultural heritage', to: '/gamification', color: 'var(--vermillion)' },
    { icon: faDownload, title: 'Offline Packs', desc: 'Download story packs to listen without internet, sync when reconnected', to: '/vault', color: 'var(--dust)' },
  ];

  return (
    <div className="fade-in">
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '3rem 1rem 2rem', marginBottom: '2rem' }}>
        <div className="float-motif" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🪔</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--terracotta)', marginBottom: '0.75rem', lineHeight: 1.1 }}>
          Where Stories <em>Live Forever</em>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          KathaVani preserves India's rich oral traditions — from ancient myths to living memories — through voice, map, and community.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <button onClick={() => navigate('/storyteller')} className="btn btn-primary btn-lg">
              <FontAwesomeIcon icon={faMicrophone} /> Begin Your Story
            </button>
          ) : (
            <button onClick={() => navigate('/auth')} className="btn btn-primary btn-lg">
              <FontAwesomeIcon icon={faStar} /> Join KathaVani
            </button>
          )}
          <button onClick={() => navigate('/listener')} className="btn btn-secondary btn-lg">
            <FontAwesomeIcon icon={faBook} /> Explore Stories
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { value: '12', label: 'Languages' },
          { value: '28', label: 'States Covered' },
          { value: '∞', label: 'Memories Preserved' },
        ].map((stat, i) => (
          <div key={stat.label} className={`card card-interactive slide-in stagger-${i + 1}`} style={{ textAlign: 'center', padding: '1.2rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--terracotta)', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features grid */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Everything a Storyteller Needs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {features.map((f, i) => (
            <div key={f.title} className={`card card-interactive slide-in stagger-${(i % 4) + 1}`} style={{ cursor: 'pointer' }} onClick={() => navigate(f.to)}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: f.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <FontAwesomeIcon icon={f.icon} style={{ color: f.color, fontSize: '1.2rem' }} />
              </div>
              <h3 style={{ marginBottom: '0.4rem', fontSize: '1.05rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured stories */}
      {featured.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2>Featured Stories</h2>
            <button onClick={() => navigate('/vault')} className="btn btn-ghost btn-sm">
              View All <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {featured.map((story, i) => (
              <div key={story._id} className={`card card-interactive slide-in stagger-${(i % 3) + 1}`} style={{ cursor: 'pointer' }} onClick={() => navigate(`/stories/${story._id}`)}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {story.tags.slice(0, 2).map(t => <span key={t} className={`tag tag-${t}`}>{t}</span>)}
                </div>
                <h3 style={{ marginBottom: '0.4rem', fontSize: '1.05rem' }}>{story.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {story.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>{story.authorName}</span>
                  <span>⭐ {story.votes} votes</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Leaderboard */}
      {leaders.length > 0 && (
        <section>
          <h2 style={{ marginBottom: '1rem' }}>🏆 Top Storytellers</h2>
          <div className="card" style={{ padding: '1rem' }}>
            {leaders.slice(0, 5).map((l, i) => (
              <div key={l.name} className={`slide-in stagger-${i + 1}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0.5rem', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: i < 3 ? 'var(--gold)' : 'var(--text-muted)', width: 24 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontWeight: 600 }}>{l.name}</span>
                <span className="karma-display">⭐ {l.karma}</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {l.badges?.slice(0, 2).map(b => <span key={b} className="badge badge-rotate" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>{b}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
