import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faStar, faMedal, faQuestion, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getQuizzes, getQuiz, submitQuiz, getAllBadges } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function GamificationPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('quests');
  const { user, updateUser } = useAuth();
  const { showNotification } = useApp();

  useEffect(() => {
    getQuizzes().then(setQuizzes).catch(() => {});
    getAllBadges().then(setBadges).catch(() => {});
  }, []);

  const startQuiz = async (quizId) => {
    const data = await getQuiz(quizId);
    setQuizData(data);
    setActiveQuiz(quizId);
    setAnswers(new Array(data.questions.length).fill(null));
    setResult(null);
  };

  const handleAnswer = (qIdx, aIdx) => {
    setAnswers(prev => { const n = [...prev]; n[qIdx] = aIdx; return n; });
  };

  const handleSubmit = async () => {
    if (answers.some(a => a === null)) { showNotification('Answer all questions before submitting', 'warning'); return; }
    try {
      const res = await submitQuiz(activeQuiz, answers);
      setResult(res);
      updateUser({ karma: res.karma });
      showNotification(`Quiz complete! +${res.points} karma ⭐`, 'success');
    } catch (err) {
      showNotification('Submission failed', 'error');
    }
  };

  const allBadgeIds = badges.map(b => b.id);
  const userBadgeNames = user?.badges || [];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--terracotta)', marginBottom: '0.2rem' }}>🏆 Quests & Gamification</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Test your knowledge, earn karma, and collect badges</p>
        </div>
        {user && <span className="karma-display" style={{ fontSize: '1rem' }}>⭐ {user.karma || 0} total karma</span>}
      </div>

      <div className="tab-nav" style={{ marginBottom: '1.5rem', maxWidth: 500 }}>
        {[{ id: 'quests', label: '📜 Quizzes' }, { id: 'badges', label: '🏅 Badges' }, { id: 'leaderboard', label: '👑 Ranks' }].map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setActiveQuiz(null); setResult(null); }}>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'quests' && (
        <>
          {activeQuiz && quizData ? (
            <div className="card slide-in" style={{ maxWidth: 680 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{quizData.title}</h2>
                <button onClick={() => { setActiveQuiz(null); setResult(null); }} className="btn btn-ghost btn-sm">← Back</button>
              </div>

              {result ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{result.score === result.total ? '🏆' : result.score >= result.total / 2 ? '⭐' : '📚'}</div>
                  <h2>{result.score}/{result.total} Correct</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You earned <strong style={{ color: 'var(--gold)' }}>+{result.points} karma</strong></p>
                  <div style={{ marginBottom: '1.5rem' }}>
                    {result.results.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem', background: r.correct ? 'rgba(58,122,92,0.08)' : 'rgba(192,57,43,0.08)', borderRadius: 'var(--radius-sm)' }}>
                        <FontAwesomeIcon icon={r.correct ? faCheck : faTimes} style={{ color: r.correct ? 'var(--jade)' : 'var(--vermillion)', marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.question}</div>
                          {!r.correct && <div style={{ fontSize: '0.8rem', color: 'var(--jade)' }}>Correct: {quizData.questions[i]?.options[r.correctAnswer]}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => startQuiz(activeQuiz)} className="btn btn-primary">Try Again</button>
                </div>
              ) : (
                <>
                  {quizData.questions.map((q, qIdx) => (
                    <div key={qIdx} style={{ marginBottom: '1.5rem' }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '1rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--terracotta)', marginRight: 8 }}>{qIdx + 1}.</span>
                        {q.q}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {q.options.map((opt, aIdx) => (
                          <button key={aIdx} onClick={() => handleAnswer(qIdx, aIdx)}
                            className={`btn ${answers[qIdx] === aIdx ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ 
                              textAlign: 'left', 
                              justifyContent: 'flex-start', 
                              fontFamily: 'var(--font-body)',
                              transform: answers[qIdx] === aIdx ? 'scale(1.02) translateX(4px)' : 'none',
                              boxShadow: answers[qIdx] === aIdx ? '0 4px 12px rgba(180, 95, 43, 0.2)' : 'none',
                              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s'
                            }}>
                            <span style={{ fontFamily: 'var(--font-mono)', marginRight: 8 }}>{String.fromCharCode(65 + aIdx)}.</span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSubmit} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
                    disabled={answers.some(a => a === null)}>
                    Submit Answers
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {quizzes.map((quiz, i) => (
                <div key={quiz.id} className={`card card-interactive slide-in stagger-${(i % 3) + 1}`}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className={`tag tag-${quiz.storyTag}`}>{quiz.storyTag}</span>
                  </div>
                  <h3 style={{ marginBottom: '0.4rem' }}>{quiz.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <FontAwesomeIcon icon={faQuestion} style={{ marginRight: 4 }} />{quiz.questionCount} questions · Earn up to 20 karma
                  </p>
                  <button onClick={() => startQuiz(quiz.id)} className="btn btn-primary btn-sm">
                    <FontAwesomeIcon icon={faStar} /> Start Quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {badges.map((badge, i) => {
            const earned = userBadgeNames.includes(badge.name);
            return (
              <div key={badge.id} className={`card card-interactive slide-in stagger-${(i % 3) + 1}`} style={{ textAlign: 'center', opacity: earned ? 1 : 0.55, transition: 'opacity 0.3s, transform 0.3s, box-shadow 0.3s', position: 'relative' }}>
                {earned && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.72rem', background: 'var(--jade)', color: '#fff', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>EARNED</div>}
                <div className="badge-rotate" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'inline-block', transition: 'transform 0.4s' }}>{badge.icon}</div>
                <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>{badge.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 0 }}>{badge.description}</p>
                {badge.requirement > 0 && !earned && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, ((user?.karma || 0) / badge.requirement) * 100)}%`, background: 'var(--terracotta)', transition: 'width 0.5s', borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{user?.karma || 0} / {badge.requirement} karma</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'leaderboard' && (
        <Leaderboard />
      )}
    </div>
  );
}

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  useEffect(() => { import('../services/api').then(({ getLeaderboard }) => getLeaderboard().then(setLeaders).catch(() => {})); }, []);

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card">
        {leaders.map((l, i) => (
          <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 0.5rem', borderBottom: i < leaders.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: i === 0 ? '1.4rem' : '1rem', width: 32, textAlign: 'center' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{l.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{l.region}</div>
            </div>
            <span className="karma-display">⭐ {l.karma}</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {(l.badges || []).slice(0, 2).map(b => <span key={b} title={b} className="badge" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>{b.split(' ')[0]}</span>)}
            </div>
          </div>
        ))}
        {leaders.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No rankings yet. Start earning karma!</p>}
      </div>
    </div>
  );
}
