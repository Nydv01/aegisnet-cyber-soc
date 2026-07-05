import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import ShinyText from './ShinyText';
import TextScramble from './TextScramble';
import Meteors from './Meteors';

/**
 * Landing — Cinematic hero experience with animated stat counters,
 * 6 feature spotlight cards, tech stack pills, and architecture diagram.
 */

// Animated number counter hook
function useCountUp(end, duration = 2000, start = 0) {
  const [value, setValue] = useState(start);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
      setValue(Math.floor(eased * (end - start) + start));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, end, duration, start]);

  return [value, ref];
}

export default function Landing() {
  const navigate = useNavigate();
  const token = localStorage.getItem('aegis_token');

  const handleStart = () => {
    navigate(token ? '/dashboard' : '/login');
  };

  const [threats, threatsRef] = useCountUp(10847, 2500);
  const [accuracy, accuracyRef] = useCountUp(998, 2200);
  const [response, responseRef] = useCountUp(47, 1800);
  const [agents, agentsRef] = useCountUp(5000, 2000);

  const features = [
    {
      icon: '🔍',
      title: 'Intrusion Detection',
      desc: 'Random Forest classifiers trained on 20K+ synthetic NSL-KDD samples. Real-time packet inspection detecting DDoS, port scans, brute force, and SQL injection attacks with 99.8% accuracy.',
    },
    {
      icon: '🌐',
      title: 'Phishing URL Scanner',
      desc: 'TF-IDF character n-gram tokenization combined with 18 hand-crafted lexical features. Shannon entropy analysis and structural pattern matching classify malicious URLs instantly.',
    },
    {
      icon: '🤖',
      title: 'Q-Learning Agent',
      desc: 'Autonomous tabular Q-Learning defense agent trained over 5,000 episodes. Epsilon-greedy exploration with Bellman updates. Selects defensive actions: block IP, rate-limit, honeypot, patch, isolate.',
    },
    {
      icon: '📊',
      title: 'Real-Time SOC Dashboard',
      desc: 'WebSocket-streamed telemetry powering live gauges, threat maps, traffic sparklines, radar scans, and event feeds. See CPU, RAM, bandwidth, latency, and health in real time.',
    },
    {
      icon: '🧠',
      title: 'ML Model Zoo',
      desc: 'Gradient Boosting, MLP Neural Network, and ensemble voting classifiers. Complete training pipeline with confusion matrices, ROC curves, and feature importance visualizations.',
    },
    {
      icon: '⚔️',
      title: 'Attack Simulator',
      desc: 'Launch DDoS floods, port scans, brute force, and SQL injection in a sandboxed environment. Watch the AI agent autonomously mitigate threats through a force-directed network graph.',
    },
  ];

  const techStack = [
    { icon: '🐍', name: 'Python' },
    { icon: '⚡', name: 'FastAPI' },
    { icon: '⚛️', name: 'React 19' },
    { icon: '🔬', name: 'scikit-learn' },
    { icon: '📊', name: 'NumPy / Pandas' },
    { icon: '🔗', name: 'WebSocket' },
    { icon: '🧪', name: 'TF-IDF NLP' },
    { icon: '🤖', name: 'Q-Learning RL' },
    { icon: '🗄️', name: 'SQLAlchemy' },
    { icon: '🔐', name: 'JWT Auth' },
    { icon: '⚡', name: 'Vite' },
    { icon: '📈', name: 'Gradient Boosting' },
  ];

  return (
    <div className="landing-wrapper" style={{ maxWidth: 1100 }}>
      {/* ── Hero Section ── */}
      <section className="landing-hero" style={{ padding: '70px 20px 50px', position: 'relative', overflow: 'hidden' }}>
        <Meteors number={15} />

        <ScrollReveal>
          <div className="cyber-shield-container" style={{ width: 160, height: 160, marginBottom: 40 }}>
            <div className="shield-core" />
            <div className="orbital-ring ring-1" />
            <div className="orbital-ring ring-2" />
            <div className="orbital-ring ring-3" />
            <div className="scanner-line" />
          </div>

          <h1 className="hero-title" style={{ fontSize: '3.2rem', lineHeight: 1.15 }}>
            <ShinyText>Next-Generation</ShinyText>
            <br />
            <span style={{ fontSize: '2.6rem' }}>
              <ShinyText>Cybersecurity SOC Platform</ShinyText>
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <p className="hero-subtitle" style={{ maxWidth: 700, fontSize: '1.05rem', lineHeight: 1.7 }}>
            <TextScramble delay={400}>
              AI-Powered Intrusion Detection • Phishing URL Classification • Autonomous Q-Learning Defense Agent • Real-Time WebSocket Telemetry • Live Network Threat Visualization
            </TextScramble>
          </p>
        </ScrollReveal>

        <ScrollReveal delay={250}>
          <div style={{ marginTop: 32, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={handleStart} style={{ fontSize: '1rem', padding: '16px 36px' }}>
              🚀 Enter Command Center
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/models')} style={{ fontSize: '1rem', padding: '16px 36px' }}>
              🧠 Explore AI Models
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Animated Stats Row ── */}
      <section>
        <ScrollReveal delay={300}>
          <div className="stat-counter-row">
            <div className="stat-counter-item" ref={threatsRef}>
              <div className="stat-counter-value">{threats.toLocaleString()}+</div>
              <div className="stat-counter-label">Threats Analyzed</div>
            </div>
            <div className="stat-counter-item" ref={accuracyRef}>
              <div className="stat-counter-value">{(accuracy / 10).toFixed(1)}%</div>
              <div className="stat-counter-label">Detection Rate</div>
            </div>
            <div className="stat-counter-item" ref={responseRef}>
              <div className="stat-counter-value">&lt;{response}ms</div>
              <div className="stat-counter-label">Response Time</div>
            </div>
            <div className="stat-counter-item" ref={agentsRef}>
              <div className="stat-counter-value">{agents.toLocaleString()}</div>
              <div className="stat-counter-label">Episodes Trained</div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Feature Cards Grid (6 cards) ── */}
      <section className="landing-features">
        <ScrollReveal delay={350}>
          <h2 style={{ textAlign: 'center', marginBottom: 12, fontSize: '1.6rem', fontWeight: 900 }}>
            <ShinyText>Defensive Arsenal</ShinyText>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 36, fontSize: '0.88rem' }}>
            Six integrated modules powered by scikit-learn ML and reinforcement learning
          </p>
        </ScrollReveal>

        <div className="features-grid-6">
          {features.map((f, i) => (
            <ScrollReveal key={i} delay={400 + i * 80}>
              <SpotlightCard className="feature-card" style={{ height: '100%' }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Tech Stack Pills ── */}
      <section style={{ textAlign: 'center' }}>
        <ScrollReveal delay={500}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>
            Built With
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 20 }}>
            Production-grade technologies showcasing full-stack AI/ML engineering
          </p>
          <div className="tech-stack-section">
            {techStack.map((t, i) => (
              <span key={i} className="tech-pill" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="tech-icon">{t.icon}</span>
                {t.name}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Architecture Diagram ── */}
      <section>
        <ScrollReveal delay={600}>
          <SpotlightCard style={{ padding: '32px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: '1.2rem', fontWeight: 800 }}>
              System Architecture
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 20 }}>
              Data flows from traffic simulation through ML classification to autonomous agent response
            </p>

            <div className="architecture-diagram">
              <div className="arch-layer">
                <span className="arch-icon">🌐</span>
                <div className="arch-title">Traffic Simulator</div>
                <div className="arch-desc">Synthetic packets & attack injection</div>
              </div>
              <div className="arch-arrow">→</div>
              <div className="arch-layer">
                <span className="arch-icon">🧠</span>
                <div className="arch-title">ML Engine</div>
                <div className="arch-desc">IDS RandomForest + TF-IDF Phishing</div>
              </div>
              <div className="arch-arrow">→</div>
              <div className="arch-layer">
                <span className="arch-icon">🤖</span>
                <div className="arch-title">Q-Learning Agent</div>
                <div className="arch-desc">Autonomous defense decisions</div>
              </div>
            </div>

            <div className="architecture-diagram" style={{ marginTop: 0 }}>
              <div className="arch-layer">
                <span className="arch-icon">📡</span>
                <div className="arch-title">WebSocket Stream</div>
                <div className="arch-desc">Real-time telemetry broadcast</div>
              </div>
              <div className="arch-arrow">→</div>
              <div className="arch-layer">
                <span className="arch-icon">📊</span>
                <div className="arch-title">React Dashboard</div>
                <div className="arch-desc">Live gauges, maps, & event feed</div>
              </div>
              <div className="arch-arrow">→</div>
              <div className="arch-layer">
                <span className="arch-icon">🗄️</span>
                <div className="arch-title">SQLAlchemy DB</div>
                <div className="arch-desc">Persistent event & scan logs</div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ textAlign: 'center', padding: '40px 0 20px' }}>
        <ScrollReveal delay={700}>
          <div className="holo-card" style={{ display: 'inline-block', padding: '36px 48px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>
              <ShinyText>Ready to Defend?</ShinyText>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
              Launch the SOC and experience AI-powered cybersecurity in action
            </p>
            <button className="btn btn-primary btn-lg" onClick={handleStart} style={{ fontSize: '1rem', padding: '16px 40px' }}>
              🛡️ Initialize AegisNet
            </button>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
