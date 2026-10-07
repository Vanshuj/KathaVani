import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt, faUndo, faClock, faLifeRing, faMoneyCheckAlt } from '@fortawesome/free-solid-svg-icons';

export default function RefundPolicyPage() {
  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: '0 auto', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <FontAwesomeIcon icon={faReceipt} style={{ color: 'var(--terracotta)', fontSize: '1.6rem' }} />
          <h1 style={{ margin: 0, color: 'var(--terracotta)' }}>Refund & Cancellation Policy</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Effective Date: October 7, 2026 | Last Updated: October 7, 2026 | Standard: Consumer Protection (E-Commerce) Rules, India
        </p>
      </header>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>1. General Overview</h2>
        <p>
          KathaVani is a cultural storytelling and oral heritage preservation initiative. Core access to our community archives, story builder, and offline listening packs is provided free of charge to all cultural enthusiasts.
        </p>
        <p>
          This Refund & Cancellation Policy applies to any voluntary contributions, archival patronage, event tickets, or certified cultural workshop passes processed through our platform under the Indian Consumer Protection (E-Commerce) Rules, 2020.
        </p>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>2. Voluntary Archival Contributions & Donations</h2>
        <p>
          If you make a voluntary financial contribution to support oral heritage transcription or field archivist stipends:
        </p>
        <ul style={{ paddingLeft: '1.4rem', lineHeight: 1.8 }}>
          <li><strong>Accidental or Duplicate Contributions:</strong> If a contribution was submitted erroneously or debited twice due to a network glitch, you may request a 100% refund within <strong>7 calendar days</strong> of the transaction.</li>
          <li><strong>Eligibility:</strong> Provide the transaction reference ID, payment confirmation screenshot, and the registered email address used during payment.</li>
        </ul>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>3. Cultural Workshops & Event Passes</h2>
        <p>
          For paid interactive masterclasses, field storytelling tours, or archival workshops organized by KathaVani:
        </p>
        <ul style={{ paddingLeft: '1.4rem', lineHeight: 1.8 }}>
          <li><strong>Cancellations 48+ Hours Before Event:</strong> Eligible for a 100% refund of the ticket fee.</li>
          <li><strong>Cancellations Within 48 Hours:</strong> Eligible for a 50% refund, or a complimentary transfer of your pass to an upcoming session.</li>
          <li><strong>Event Postponement or Cancellation by KathaVani:</strong> In the unlikely event a workshop is rescheduled or cancelled by our team, all attendees receive an automatic 100% refund.</li>
        </ul>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>4. Refund Processing Timeline & Modes</h2>
        <p>
          In accordance with Reserve Bank of India (RBI) payment gateway directives:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--terracotta)' }}>Original Payment Method</h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>All approved refunds are credited back to the original source account (UPI, Net Banking, Credit/Debit Card).</p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--terracotta)' }}>Processing Timeline</h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>Once approved, refunds are initiated within 48 hours and typically reflect in your bank account within <strong>5 to 7 business days</strong>.</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>5. How to Initiate a Refund Request</h2>
        <p>
          To request a cancellation or refund, email our dedicated support desk with your transaction details:
        </p>
        <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <strong>Refund Help Desk:</strong> <a href="mailto:refunds@kathavani.in">refunds@kathavani.in</a><br />
          <strong>Entity:</strong> KathaVani Cultural Heritage Foundation<br />
          <strong>Operating Address:</strong> Cultural Archive Division, New Delhi 110001, India<br />
          <strong>Required Information:</strong> Full Name, Registered Email, Transaction ID / UPI Reference, Date of Transaction, and Reason for Request.
        </div>
      </section>
    </div>
  );
}
