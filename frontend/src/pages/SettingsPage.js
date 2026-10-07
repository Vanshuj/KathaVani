import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faPalette, faBell, faShield, faUniversalAccess, faTrash, faKey,
  faSave, faCog, faSun, faMoon, faDownload, faUserShield
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { updatePreferences, changePassword, deleteAccount } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese'];
const REGIONS = ['North India', 'South India', 'East India', 'West India', 'Central India', 'Northeast India', 'Pan India'];
const STORY_TYPES = ['mythology', 'resistance', 'migration', 'folklore', 'tribal', 'history', 'nature', 'family'];
const THEMES_DISPLAY = [{ id: 'light', label: 'Light', icon: faSun }, { id: 'dark', label: 'Dark', icon: faMoon }];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme, fontSize, setFontSize, highContrast, setHighContrast, showNotification } = useApp();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({ name: user?.name || '', language: user?.language || 'English', region: user?.region || 'Pan India', storyPreferences: user?.storyPreferences || [], narrationMode: user?.narrationMode || 'voice', notifications: user?.notifications ?? true, subtitles: user?.subtitles || false });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setPrefs({
        name: user.name || '',
        language: user.language || 'English',
        region: user.region || 'Pan India',
        storyPreferences: user.storyPreferences || [],
        narrationMode: user.narrationMode || 'voice',
        notifications: user.notifications ?? true,
        subtitles: user.subtitles || false
      });
    }
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: faUser },
    { id: 'appearance', label: 'Appearance', icon: faPalette },
    { id: 'notifications', label: 'Notifications', icon: faBell },
    { id: 'security', label: 'Security', icon: faShield },
    { id: 'accessibility', label: 'Accessibility', icon: faUniversalAccess },
    { id: 'privacy', label: 'DPDP Data Rights', icon: faUserShield },
  ];

  const savePrefs = async () => {
    setSaving(true);
    try {
      const updated = await updatePreferences(prefs);
      updateUser(updated);
      showNotification('Preferences saved!', 'success');
    } catch {
      showNotification('Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const toggleStoryPref = (pref) => {
    setPrefs(p => ({ ...p, storyPreferences: p.storyPreferences.includes(pref) ? p.storyPreferences.filter(x => x !== pref) : [...p.storyPreferences, pref] }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('Min 6 characters'); return; }
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      showNotification('Password updated!', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setPwError(err.error || 'Failed'); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;
    try {
      await deleteAccount();
      logout();
      navigate('/');
      showNotification('Account deleted', 'info');
    } catch { showNotification('Failed to delete account', 'error'); }
  };

  const handleExportData = () => {
    const exportPayload = {
      entity: 'KathaVani Cultural Heritage Foundation',
      dataPrincipal: {
        id: user?._id || user?.id,
        name: user?.name,
        email: user?.email,
        language: prefs.language,
        region: prefs.region,
        karma: user?.karma || 0,
        badges: user?.badges || [],
        preferences: prefs,
        exportedAt: new Date().toISOString(),
        statutoryReference: 'Digital Personal Data Protection Act, 2023 (Section 11)'
      }
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kathavani_data_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Personal data archive exported successfully!', 'success');
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
        <FontAwesomeIcon icon={faCog} style={{ color: 'var(--terracotta)', fontSize: '1.6rem' }} />
        <h1 style={{ color: 'var(--terracotta)', margin: 0 }}>Settings</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Customize your preferences and manage your privacy rights</p>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`btn ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', gap: '0.6rem' }}>
              <FontAwesomeIcon icon={t.icon} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card">
          {tab === 'profile' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Profile & Preferences</h2>
              <div style={{ display: 'grid', gap: '1rem', maxWidth: 500 }}>
                <div><label>Display Name</label><input value={prefs.name} onChange={e => setPrefs(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label>Email</label><input value={user?.email} disabled style={{ opacity: 0.6 }} /></div>
                <div>
                  <label>Preferred Language</label>
                  <select value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}>
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label>Cultural Region</label>
                  <select value={prefs.region} onChange={e => setPrefs(p => ({ ...p, region: e.target.value }))}>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label>Narration Mode</label>
                  <select value={prefs.narrationMode} onChange={e => setPrefs(p => ({ ...p, narrationMode: e.target.value }))}>
                    <option value="voice">Voice (TTS)</option>
                    <option value="text">Text Only</option>
                    <option value="both">Voice + Text</option>
                  </select>
                </div>
                <div>
                  <label>Story Type Preferences</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.3rem' }}>
                    {STORY_TYPES.map(pref => (
                      <button key={pref} onClick={() => toggleStoryPref(pref)}
                        className={`tag tag-${pref}`}
                        style={{ cursor: 'pointer', border: `1.5px solid ${prefs.storyPreferences.includes(pref) ? 'currentColor' : 'transparent'}`, background: prefs.storyPreferences.includes(pref) ? undefined : 'var(--bg-elevated)' }}>
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={savePrefs} className="btn btn-primary" disabled={saving}>
                  <FontAwesomeIcon icon={faSave} /> {saving ? 'Saving…' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Appearance</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 500 }}>
                <div>
                  <label style={{ marginBottom: '0.75rem', display: 'block' }}>Theme</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {THEMES_DISPLAY.map(t => (
                      <button key={t.id} onClick={() => { if (theme !== t.id) toggleTheme(); }}
                        className={`btn ${theme === t.id ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ flex: 1, justifyContent: 'center', gap: '0.5rem' }}>
                        <FontAwesomeIcon icon={t.icon} /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label>Font Size: {fontSize}px</label>
                  <input type="range" min={12} max={24} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ marginTop: '0.5rem' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}><span>Small</span><span>Large</span></div>
                </div>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Cultural Pattern Background</span>
                    <input type="checkbox" defaultChecked style={{ width: 'auto' }} />
                  </label>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Subtle traditional motifs in the background</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Notifications</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 450 }}>
                {[{ key: 'notifications', label: 'Story Updates', desc: 'Get notified when new stories are published' }, { key: 'voteNotifications', label: 'Vote Alerts', desc: 'Know when someone votes for your stories' }, { key: 'karmaNotifications', label: 'Karma Milestones', desc: 'Celebrate karma achievements and badge unlocks' }].map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <input type="checkbox" defaultChecked={prefs.notifications} onChange={e => setPrefs(p => ({ ...p, [item.key]: e.target.checked }))} style={{ width: 'auto', marginLeft: '1rem', marginTop: 2 }} />
                  </div>
                ))}
                <button onClick={savePrefs} className="btn btn-primary" disabled={saving}>
                  <FontAwesomeIcon icon={faSave} /> {saving ? 'Saving…' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Account & Security</h2>
              <div style={{ maxWidth: 450 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                  <FontAwesomeIcon icon={faKey} style={{ marginRight: 6, color: 'var(--terracotta)' }} />Change Password
                </h3>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <div><label>Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} /></div>
                  <div><label>New Password</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} /></div>
                  <div><label>Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} /></div>
                  {pwError && <p style={{ color: 'var(--vermillion)', fontSize: '0.88rem' }}>{pwError}</p>}
                  <button type="submit" className="btn btn-primary btn-sm">Update Password</button>
                </form>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--vermillion)' }}>
                    <FontAwesomeIcon icon={faTrash} style={{ marginRight: 6 }} />Delete Account
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    This will permanently delete your account and all your stories. This cannot be undone.
                  </p>
                  <button onClick={handleDeleteAccount} className="btn btn-sm" style={{ background: 'rgba(192,57,43,0.1)', color: 'var(--vermillion)', border: '1px solid rgba(192,57,43,0.3)' }}>
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'accessibility' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Accessibility</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 450 }}>
                <div>
                  <label>Font Size: {fontSize}px</label>
                  <input type="range" min={12} max={28} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ marginTop: '0.4rem' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>High Contrast Mode</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Increases text-background contrast</div>
                  </div>
                  <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} style={{ width: 'auto' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Subtitles / Captions</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Show text while stories are narrated</div>
                  </div>
                  <input type="checkbox" checked={prefs.subtitles} onChange={e => setPrefs(p => ({ ...p, subtitles: e.target.checked }))} style={{ width: 'auto' }} />
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Text-to-Speech</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Available on all story cards in the Listener tab. Uses your browser's built-in speech synthesis.</div>
                </div>
                <button onClick={savePrefs} className="btn btn-primary" disabled={saving}>
                  <FontAwesomeIcon icon={faSave} /> {saving ? 'Saving…' : 'Save Accessibility Settings'}
                </button>
              </div>
            </div>
          )}

          {tab === 'privacy' && (
            <div>
              <h2 style={{ marginBottom: '1.25rem', fontSize: '1.2rem', color: 'var(--terracotta)' }}>
                <FontAwesomeIcon icon={faUserShield} style={{ marginRight: 8 }} />
                Your DPDP Act 2023 Data Rights
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                In compliance with India's Digital Personal Data Protection Act, 2023, you have full ownership and rights over your personal data held by KathaVani.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 540 }}>
                {/* Data Summary Card */}
                <div style={{ padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Personal Data Summary (Section 11)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.4rem', fontSize: '0.86rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Registered Name:</span><strong>{user?.name}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>Email Address:</span><strong>{user?.email}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>Preferred Dialect:</span><span>{prefs.language}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Karma Balance:</span><span>{user?.karma || 0} points</span>
                    <span style={{ color: 'var(--text-muted)' }}>Data Collection:</span><span>Strictly Necessary & Functional Only</span>
                  </div>
                </div>

                {/* Export Data */}
                <div style={{ padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem' }}>Right to Data Portability (Section 11)</h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Download a copy of your personal data archive, including profile settings, badges, and story metadata in machine-readable JSON format.
                  </p>
                  <button onClick={handleExportData} className="btn btn-secondary btn-sm">
                    <FontAwesomeIcon icon={faDownload} /> Download My Personal Data Archive
                  </button>
                </div>

                {/* Grievance Redressal */}
                <div style={{ padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem' }}>Grievance Redressal (Section 13)</h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
                    Have concerns or wish to submit a data rectification request? Contact our statutory Grievance Officer:
                  </p>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Email: <a href="mailto:grievance@kathavani.in" style={{ textDecoration: 'underline' }}>grievance@kathavani.in</a><br />
                    Review policy: <Link to="/privacy" style={{ textDecoration: 'underline' }}>Read DPDP Privacy Policy</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .settings-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
