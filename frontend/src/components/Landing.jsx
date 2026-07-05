import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import ShinyText from './ShinyText';
import TextScramble from './TextScramble';

export default function Landing() {
  const navigate = useNavigate();
  const token = localStorage.getItem('aegis_token');

  const handleStart = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-wrapper">
      {/* ── Hero Section ── */}
      <section className="landing-hero">
        <ScrollReveal>
          <div className="cyber-shield-container">
            <div className="shield-core" />
            <div className="orbital-ring ring-1" />
            <div className="orbital-ring ring-2" />
            <div className="orbital-ring ring-3" />
            <div className="scanner-line" />
          </div>
          <h1 className="hero-title">
            <ShinyText>Next-Gen Cybersecurity SOC</ShinyText>
          </h1>
        </ScrollReveal>
        
        <ScrollReveal delay={150}>
          <p className="hero-subtitle">
            <TextScramble delay={300}>AI-Powered Intrusion Detection, Phishing Classification & Autonomous Q-Learning Mitigation.</TextScramble>
          </p>
        </ScrollReveal>

        <ScrollReveal delay={250}>
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary btn-lg" onClick={handleStart}>
              🚀 Launch Command Center
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Feature Cards Row ── */}
      <section className="landing-features">
        <ScrollReveal delay={350}>
          <h2 style={{ textAlign: 'center', marginBottom: 36, fontSize: '1.4rem', fontWeight: 800 }}>
            🛡️ Core Defensive Shields
          </h2>
        </ScrollReveal>

        <div className="features-grid">
          <ScrollReveal delay={400}>
            <SpotlightCard className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Intrusion Detection</h3>
              <p>Random Forest classifiers inspect packets in real-time to flag port sweeps, brute forcing, and database injections.</p>
            </SpotlightCard>
          </ScrollReveal>

          <ScrollReveal delay={450}>
            <SpotlightCard className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>URL Classifier</h3>
              <p>TF-IDF tokenization combined with hand-crafted entropy and structural metadata scans for phishing web links.</p>
            </SpotlightCard>
          </ScrollReveal>

          <ScrollReveal delay={500}>
            <SpotlightCard className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Neural Agent</h3>
              <p>Autonomous Q-Learning reinforcement agent blocks IPs and throttles traffic without human intervention.</p>
            </SpotlightCard>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Info Banner Section ── */}
      <section className="landing-info-card">
        <ScrollReveal delay={550}>
          <SpotlightCard style={{ padding: '36px', textAlign: 'center' }}>
            <h2>Real-Time Security Event Logging</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, maxWidth: '600px', margin: '12px auto' }}>
              Our simulator feeds telemetry directly into active visual graphs, providing continuous situational awareness of network health and incident mitigation policies.
            </p>
          </SpotlightCard>
        </ScrollReveal>
      </section>
    </div>
  );
}
