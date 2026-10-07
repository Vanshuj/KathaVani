import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract, faBalanceScale, faBookOpen, faShieldAlt, faGavel } from '@fortawesome/free-solid-svg-icons';

export default function TermsPage() {
  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: '0 auto', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <FontAwesomeIcon icon={faFileContract} style={{ color: 'var(--terracotta)', fontSize: '1.6rem' }} />
          <h1 style={{ margin: 0, color: 'var(--terracotta)' }}>Terms & Conditions</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Effective Date: October 7, 2026 | Last Updated: October 7, 2026 | Governing Jurisdiction: New Delhi, India
        </p>
      </header>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the KathaVani platform ("KathaVani", "we", "our", or "service"), you agree to be bound by these Terms and Conditions ("Terms"), our Privacy Policy, Cookies Policy, and Community Guidelines. If you do not agree with any part of these Terms, you must refrain from accessing or contributing to the platform.
        </p>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>2. Eligibility & Account Security</h2>
        <p>
          You must be at least 18 years old or possess verifiable parental/guardian consent to create an account and submit stories. You are responsible for safeguarding your login credentials and for all activities that occur under your account. If you discover unauthorized access, notify us immediately at <a href="mailto:security@kathavani.in">security@kathavani.in</a>.
        </p>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>3. Cultural Knowledge, Copyright & Licensing</h2>
        <p>
          KathaVani is founded to safeguard India's traditional knowledge, folklore, and living memories:
        </p>
        <ul style={{ paddingLeft: '1.4rem', lineHeight: 1.8 }}>
          <li><strong>Traditional Knowledge Custodianship:</strong> We acknowledge that indigenous communities, families, and folk storytellers are the traditional custodians of their cultural heritage. Submitting stories does not transfer moral rights away from original traditions.</li>
          <li><strong>Content Licensing:</strong> By publishing any story, audio snippet, or artwork to the Community Vault, you grant KathaVani a non-exclusive, worldwide, royalty-free license to host, display, transcribe, and index your contribution under the <strong>Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)</strong>.</li>
          <li><strong>Commercial Restriction:</strong> Community submissions may not be monetized, resold, or used for commercial training by third-party corporations without explicit written consent from the author or custodian.</li>
          <li><strong>Archival Imagery Copyright:</strong> Visual assets, illustrations, and maps displayed across KathaVani are copyright of KathaVani Cultural Heritage Foundation or their respective contributing archivists, credited accordingly.</li>
        </ul>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>4. User Conduct & Prohibited Activities</h2>
        <p>
          In maintaining a respectful cultural repository, users agree not to upload or propagate content that:
        </p>
        <ul style={{ paddingLeft: '1.4rem', lineHeight: 1.8 }}>
          <li>Violates Rule 3(1)(b) of the Information Technology (Intermediary Guidelines) Rules, 2021.</li>
          <li>Promotes communal disharmony, hatred, discrimination, obscenity, defamation, or violence against any community, religion, gender, or group.</li>
          <li>Distorts verified historical facts with malicious intent or propagates unverified defamatory hoaxes.</li>
          <li>Infringes third-party intellectual property, privacy, or moral rights.</li>
          <li>Introduces malicious code, automated scraping bots, or attempts to disrupt site operations.</li>
        </ul>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>5. Content Moderation & Intermediary Safe Harbor</h2>
        <p>
          KathaVani acts as an intermediary under Section 79 of the Information Technology Act, 2000. While we deploy community moderation and automated keyword scanning for cultural context, we do not pre-screen every user contribution. We reserve the right to review, unpublish, or permanently delete any content that breaches these Terms upon receiving a valid grievance or court order.
        </p>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>6. Disclaimers & Limitation of Liability</h2>
        <p>
          The platform and all folklore archives are provided on an "as is" and "as available" basis without warranties of any kind. Oral folklore naturally includes regional variations, mythological metaphors, and divergent memories. KathaVani disclaims liability for inaccuracies in community-submitted folk legends or inadvertent technical downtime.
        </p>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>7. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the competent courts located in New Delhi, India.
        </p>
        <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: '1rem' }}>
          <strong>Legal Queries & Notice Contact:</strong><br />
          <span>KathaVani Legal Affairs Department</span><br />
          <span>Email: <a href="mailto:legal@kathavani.in">legal@kathavani.in</a></span><br />
          <span>Address: Cultural Documentation Wing, New Delhi 110001, India</span>
        </div>
      </section>
    </div>
  );
}
