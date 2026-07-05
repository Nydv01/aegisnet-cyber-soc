import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import ShinyText from './ShinyText';
import TextScramble from './TextScramble';

// Premium UI Overlays & Components
import { HeroGeometric } from './ui/hero-geometric';
import { BackgroundPaths } from './ui/background-paths';
import { SplineSceneBasic } from './ui/demo';
import { MagicDust } from './ui/magic-dust';
import { ZoomParallax } from './ui/zoom-parallax';
import { HoverSpotlight } from './ui/spotlight';

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

  // ZoomParallax security visuals
  const parallaxImages = [
    { src: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80', alt: 'Neural Grid Layer' },
    { src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', alt: 'Elite Defense Firewall' },
    { src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', alt: 'Matrix Telemetry Stream' },
    { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', alt: 'AI Agent Circuitry' },
    { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', alt: 'Glow Waveform Topology' },
    { src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80', alt: 'Holographic Threat Terminal' },
    { src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', alt: 'Global Core Ledger' },
  ];

  // MagicDust word sequence
  const dustSequence = [
    { type: 'text', text: 'AEGISNET', offset: [0, 0, 0] },
    { type: 'shape', shape: 'torus', offset: [0, 0, 0] },
    { type: 'text', text: 'AI DEFENSE', offset: [0, 0, 0] },
    { type: 'shape', shape: 'sphere', offset: [0, 0, 0] },
    { type: 'text', text: 'CYBER SOC', offset: [0, 0, 0] },
    { type: 'shape', shape: 'box', offset: [0, 0, 0] },
  ];

  return (
    <div className="landing-wrapper" style={{ maxWidth: '100%', padding: 0 }}>
      
      {/* ── 1. Hero Geometric Header ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-black overflow-hidden border-b border-cyan-500/10">
        <HeroGeometric
          badge="🛡️ AEGISNET SECURITY OPERATIONS ACTIVE"
          title1="Autonomous AI-Driven"
          title2="Cyber SOC Architecture"
          subtitle="Empowered by reinforcement learning agents, multi-feature NLP classifiers, and real-time deep neural packet telemetry."
        />
        
        {/* Buttons overlay */}
        <ScrollReveal delay={300}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', zIndex: 20, position: 'relative', marginTop: -40, marginBottom: 40 }}>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold text-base shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              🚀 Enter Command Center
            </button>
            <button
              onClick={() => navigate('/models')}
              className="px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800/90 text-cyan-400 rounded-xl font-bold text-base border border-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              🧠 Explore AI Models
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* ── 2. Background Paths & Interactive 3D Spline Scene ── */}
      <section className="relative py-20 bg-black/40 border-b border-cyan-500/10" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <BackgroundPaths
          title="Interactive 3D Grid"
          subtitle="Live neural structure rendering our distributed agent nodes."
        />
        <div style={{ maxWidth: 1100, margin: '0 auto', marginTop: -120, zIndex: 10, position: 'relative' }}>
          <SplineSceneBasic onAction={handleStart} />
        </div>
      </section>

      {/* ── 3. Magic Dust Interactive Particle Mesh ── */}
      <section className="relative h-[60vh] bg-black flex flex-col justify-center items-center border-b border-cyan-500/10 overflow-hidden">
        <div className="absolute inset-0">
          <MagicDust sequence={dustSequence} particleCount={8000} particleColor="#22d3ee" holdDuration={2.5} />
        </div>
        <div className="absolute top-10 text-center z-10">
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
            Quantum Particle Simulation
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>
            Active Core Particle Synthesis
          </h2>
        </div>
        <div className="absolute bottom-10 z-10 text-center max-w-md px-6">
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Hover and drag over the canvas to distort the reinforcement learning network mapping structure.
          </p>
        </div>
      </section>

      {/* ── 4. Zoom Parallax Showcase ── */}
      <section className="relative bg-black">
        <div style={{ padding: '60px 20px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontWeight: 800 }}>
            Visual Telemetry Ledgers
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 6 }}>
            Parallax Telemetry Overview
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
            Scroll down to zoom into our active node clusters and global database layers.
          </p>
        </div>
        <ZoomParallax images={parallaxImages} />
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        
        {/* ── 5. Animated Stats Row ── */}
        <section style={{ margin: '80px 0' }}>
          <ScrollReveal>
            <div className="stat-counter-row">
              <div className="stat-counter-item" ref={threatsRef}>
                <div className="stat-counter-value" style={{ color: 'var(--neon-red)', textShadow: '0 0 15px rgba(239, 68, 68, 0.3)' }}>
                  {threats.toLocaleString()}+
                </div>
                <div className="stat-counter-label">Threats Analyzed</div>
              </div>
              <div className="stat-counter-item" ref={accuracyRef}>
                <div className="stat-counter-value" style={{ color: 'var(--neon-green)', textShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}>
                  {(accuracy / 10).toFixed(1)}%
                </div>
                <div className="stat-counter-label">Detection Rate</div>
              </div>
              <div className="stat-counter-item" ref={responseRef}>
                <div className="stat-counter-value" style={{ color: 'var(--neon-cyan)', textShadow: '0 0 15px rgba(34, 211, 238, 0.3)' }}>
                  &lt;{response}ms
                </div>
                <div className="stat-counter-label">Response Time</div>
              </div>
              <div className="stat-counter-item" ref={agentsRef}>
                <div className="stat-counter-value" style={{ color: 'var(--neon-purple)', textShadow: '0 0 15px rgba(168, 85, 247, 0.3)' }}>
                  {agents.toLocaleString()}
                </div>
                <div className="stat-counter-label">Episodes Trained</div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ── 6. Feature Cards Grid ── */}
        <section className="landing-features" style={{ marginBottom: 80 }}>
          <ScrollReveal>
            <h2 style={{ textAlign: 'center', marginBottom: 12, fontSize: '2rem', fontWeight: 900 }}>
              <ShinyText>Defensive Cyber Arsenal</ShinyText>
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: '0.88rem' }}>
              Six modular security layers coordinated by scikit-learn classifiers and deep Q-learning defense algorithms
            </p>
          </ScrollReveal>

          <div className="features-grid-6">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={100 + i * 50}>
                <div className="relative group">
                  {/* Hover Spotlight layer inside each feature card */}
                  <SpotlightCard className="feature-card" style={{ height: '100%' }}>
                    <HoverSpotlight size={140} className="from-cyan-500/10 via-blue-500/5 to-transparent" />
                    <div className="feature-icon">{f.icon}</div>
                    <h3 style={{ position: 'relative', zIndex: 2 }}>{f.title}</h3>
                    <p style={{ position: 'relative', zIndex: 2 }}>{f.desc}</p>
                  </SpotlightCard>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── 7. Architecture Diagram ── */}
        <section style={{ marginBottom: 80 }}>
          <ScrollReveal>
            <SpotlightCard className="glass-card" style={{ padding: 40, position: 'relative', overflow: 'hidden' }}>
              <HoverSpotlight size={240} className="from-cyan-500/10 via-purple-500/5 to-transparent" />
              
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>
                  🛡️ Platform Pipeline Architecture
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  Unified real-time flow connecting threat vector simulation, AI classifiers, and reinforcement learning
                </p>
              </div>

              <div className="architecture-grid">
                <div className="arch-node">
                  <span className="arch-node-badge">LAYER 1</span>
                  <h4>Attack Simulator</h4>
                  <p>DDoS, brute-force, SQL injection vector generator</p>
                </div>
                <div className="arch-flow-arrow">➡️</div>
                <div className="arch-node active">
                  <span className="arch-node-badge">LAYER 2</span>
                  <h4>ML Classification Engine</h4>
                  <p>Intrusion detection (RF) & Phishing classification (LR)</p>
                </div>
                <div className="arch-flow-arrow">➡️</div>
                <div className="arch-node active-agent">
                  <span className="arch-node-badge">LAYER 3</span>
                  <h4>Autonomous RL Agent</h4>
                  <p>Deep Q-learning agent executing mitigation actions</p>
                </div>
              </div>

              {/* Technical description block */}
              <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>
                <div>
                  <h5 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 6 }}>📡 WebSocket Telemetry Link</h5>
                  <p>Real-time telemetry stream pushes CPU, RAM, bandwidth metrics, packet rates, and log signals at 2.4kbps directly into the React client.</p>
                </div>
                <div>
                  <h5 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 6 }}>🛡️ Automated Remediation Dials</h5>
                  <p>The neural agent evaluates network vectors to trigger automated blocks, rate limits, and honeypots within a sandboxed environment.</p>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
        </section>

        {/* ── 8. Technology Stack Pills ── */}
        <section style={{ textAlign: 'center', marginBottom: 80 }}>
          <ScrollReveal>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              CORE ENGINE STACK
            </h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="glass-pill"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(15,23,42,0.4)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.76rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                  }}
                >
                  <span>{tech.icon}</span>
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ── 9. Holographic Call-To-Action ── */}
        <section style={{ marginBottom: 80 }}>
          <ScrollReveal>
            <div className="holo-cta-card">
              <div className="holo-cta-glow" />
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '50px 30px' }}>
                <span className="logo-icon" style={{ fontSize: '2.5rem', marginBottom: 16, display: 'inline-block', filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.4))' }}>
                  🛡️
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 12 }}>
                  Secure Your Network Infrastructure Today
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 28px', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Launch autonomous model training loops and observe real-time cyber defense simulations inside our advanced terminal workspace.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleStart}
                  style={{ display: 'inline-flex', padding: '16px 40px', fontSize: '0.94rem' }}
                >
                  🚀 Launch SOC Terminal Workspace
                </button>
              </div>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </div>
  );
}
