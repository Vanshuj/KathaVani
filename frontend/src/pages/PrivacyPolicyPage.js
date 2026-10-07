import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faEnvelope, faMapMarkerAlt, faUserCheck, faFileAlt, faBalanceScale } from '@fortawesome/free-solid-svg-icons';

export default function PrivacyPolicyPage() {
  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: '0 auto', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <FontAwesomeIcon icon={faShieldAlt} style={{ color: 'var(--terracotta)', fontSize: '1.6rem' }} />
          <h1 style={{ margin: 0, color: 'var(--terracotta)' }}>Privacy Policy</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Effective Date: October 7, 2026 | Last Updated: October 7, 2026 | Compliance: Digital Personal Data Protection Act, 2023 (India)
        </p>
      </header>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>1. Introduction & Data Fiduciary Details</h2>
        <p>
          KathaVani Cultural Heritage Initiative ("KathaVani", "we", "our", or "us") operates as an open cultural archiving platform committed to protecting your privacy. This policy outlines how we collect, process, store, and protect your personal data in strict compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India, the <strong>Information Technology Act, 2000</strong>, and applicable data privacy regulations.
        </p>
        <p>
          Under the DPDP Act 2023, KathaVani acts as the <strong>Data Fiduciary</strong> responsible for determining the purpose and means of processing personal data provided by users ("Data Principals").
        </p>
        <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: '1rem' }}>
          <strong>Data Fiduciary Contact Information:</strong><br />
          <span>Entity: KathaVani Cultural Heritage Archive</span><br />
          <span>Registered Office: Cultural Documentation Wing, New Delhi 110001, India</span><br />
          <span>Official Contact: <a href="mailto:privacy@kathavani.in">privacy@kathavani.in</a></span>
        </div>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>2. Principle of Data Minimization (What We Collect)</h2>
        <p>
          We strictly practice data minimization under Section 4 of the DPDP Act. We only collect the minimal personal data strictly necessary to provide our storytelling and community preservation services:
        </p>
        <ul style={{ paddingLeft: '1.4rem', lineHeight: 1.8 }}>
          <li><strong>Identity & Account Data:</strong> Full Name, Email Address, and an encrypted password hash when you voluntarily register an account.</li>
          <li><strong>Storyteller Contributions:</strong> Story titles, narrative text, voluntary audio recordings, voluntary video narrations, and chosen regional tags that you explicitly choose to publish to the community vault.</li>
          <li><strong>Accessibility & UI Preferences:</strong> Interface theme, font size scaling, high contrast toggle, and subtitle preferences stored locally on your device.</li>
          <li><strong>Engagement Metrics:</strong> Karma scores earned through educational quizzes and community votes on stories.</li>
        </ul>
        <div style={{ background: 'rgba(58,122,92,0.08)', border: '1px solid var(--jade)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginTop: '1rem' }}>
          <strong>What We Do NOT Collect:</strong> We do not collect biometric identifiers, precise GPS background tracking, financial payment data, Aadhaar details, or invasive third-party cross-site advertising identifiers.
        </div>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>3. Purpose of Data Processing (Lawful Basis)</h2>
        <p>
          Under Section 4 and Section 6 of the DPDP Act 2023, your personal data is collected solely for specified, lawful, and explicit purposes:
        </p>
        <ul style={{ paddingLeft: '1.4rem', lineHeight: 1.8 }}>
          <li>To authenticate and manage your registered user account.</li>
          <li>To attribute authorship and community recognition to oral narratives you publish.</li>
          <li>To enable offline caching of story packs upon your direct request.</li>
          <li>To maintain platform security, prevent unauthorized access, and protect cultural archives against vandalism.</li>
        </ul>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>4. Rights of the Data Principal under DPDP Act 2023</h2>
        <p>
          As a Data Principal under Indian law, you have comprehensive statutory rights regarding your personal information:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--terracotta)' }}>Right to Access (Section 11)</h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>You may request a clear summary of all personal data held about you and processing activities undertaken.</p>
          </div>
          <div style={{ padding: '0.9rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--terracotta)' }}>Right to Correction & Erasure (Section 12)</h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>You have the right to correct misleading or inaccurate data, and permanently erase your account and submitted stories.</p>
          </div>
          <div style={{ padding: '0.9rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--terracotta)' }}>Right to Withdraw Consent (Section 6(4))</h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>You can withdraw your processing consent at any time via Settings or by contacting our Grievance Officer.</p>
          </div>
          <div style={{ padding: '0.9rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--terracotta)' }}>Right to Nominate (Section 14)</h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>You have the right to nominate another individual to manage your archival data in the event of death or incapacity.</p>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>5. Protection of Children's Data (Section 9)</h2>
        <p>
          KathaVani is an inclusive educational and cultural hub. We comply strictly with Section 9 of the DPDP Act 2023. We do not engage in behavioral monitoring, tracking, targeted profiling, or advertising directed at children, nor do we process any personal data likely to cause detrimental effects on a child's well-being.
        </p>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>6. Third-Party Embeds and Zero Tracking Guarantee</h2>
        <p>
          We do not sell, rent, or trade your personal data with data brokers, ad networks, or commercial third parties.
        </p>
        <ul style={{ paddingLeft: '1.4rem', lineHeight: 1.8 }}>
          <li><strong>Map Embeds:</strong> Regional map views utilize OpenStreetMap via Leaflet. No personal telemetry or user tracking is transmitted to third-party ad networks.</li>
          <li><strong>Voice Synthesis & Audio:</strong> Browser-native Web Speech API processes text locally whenever system voices exist. No voice data is stored on remote servers without explicit audio upload consent.</li>
          <li><strong>Zero Tracking Pixels:</strong> We do not embed Google Analytics, Meta Pixel, or invasive tracking scripts.</li>
        </ul>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>7. Data Security & Storage Retention</h2>
        <p>
          We implement technical and organizational security measures, including salted password hashing (bcrypt), TLS encryption in transit, and role-based access control. Personal data is retained only for as long as your account remains active or as needed to maintain historical archival integrity. Upon account deletion, all personal identifiers are purged from active production databases within 30 days.
        </p>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>8. Grievance Redressal Mechanism & Officer</h2>
        <p>
          In compliance with Section 13 of the DPDP Act 2023 and Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, we have appointed a dedicated Grievance Officer:
        </p>
        <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <strong>Grievance Officer:</strong> Ananya Sharma<br />
          <strong>Designation:</strong> Data Protection & Grievance Redressal Officer<br />
          <strong>Email:</strong> <a href="mailto:grievance@kathavani.in">grievance@kathavani.in</a><br />
          <strong>Address:</strong> KathaVani Cultural Archive, Barakhamba Road, Connaught Place, New Delhi 110001, India<br />
          <strong>Resolution Timeline:</strong> In accordance with statutory guidelines, complaints are acknowledged within 48 hours and redressed within 30 calendar days.
        </div>
      </section>
    </div>
  );
}
