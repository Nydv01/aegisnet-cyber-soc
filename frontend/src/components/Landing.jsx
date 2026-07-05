import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Shield, Cpu, Activity, Database, Key, ShieldAlert } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import ShinyText from './ShinyText';
import TextScramble from './TextScramble';

// Premium UI Overlays & Components
import { BackgroundPaths } from './ui/background-paths';
import { SplineScene } from './ui/spline';
import { MagicDust } from './ui/magic-dust';
import { HoverSpotlight } from './ui/spotlight';

// Floating Background Shape Component
function ElegantShape({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100, rotate: rotate - 10 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{ duration: 2.2, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={`absolute pointer-events-none ${className}`}
    >
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[1px] border border-white/[0.05] shadow-[0_8px_32px_0_rgba(255,255,255,0.01)]`} />
      </motion.div>
    </motion.div>
  );
}

// Stats Counter Hook
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

  const bentoFeatures = [
    {
      icon: <Shield className="h-6 w-6 text-cyan-400" />,
      title: 'Intrusion Detection System',
      desc: 'Random Forest classifiers trained on 20K+ network flow logs. Live packet parsing detects DDoS, port scans, brute force, and SQL injections with 99.8% accuracy.',
      span: 'md:col-span-2',
      badge: 'ML Engine'
    },
    {
      icon: <Terminal className="h-6 w-6 text-indigo-400" />,
      title: 'Phishing URL Scanner',
      desc: 'TF-IDF lexical n-gram tokenization and Shannon entropy calculations identify malicious URLs instantly.',
      span: 'md:col-span-1',
      badge: 'NLP Model'
    },
    {
      icon: <Cpu className="h-6 w-6 text-purple-400" />,
      title: 'Q-Learning Defense Agent',
      desc: 'Reinforcement learning agent trained over 5,000 episodes to select optimal mitigations like honeypot deployment or IP segmentation.',
      span: 'md:col-span-1',
      badge: 'RL Agent'
    },
    {
      icon: <Activity className="h-6 w-6 text-emerald-400" />,
      title: 'SOC Telemetry Workspace',
      desc: 'WebSocket streams push system metrics, bandwidth, latency, and threat signals directly into live graphical HUD charts and interactive dials.',
      span: 'md:col-span-2',
      badge: 'SOC Command'
    },
    {
      icon: <Database className="h-6 w-6 text-rose-400" />,
      title: 'Model Zoo & Validation Metrics',
      desc: 'Analyze active models using confusion matrix heatmaps, feature importance charts, and ROC/AUC reward curves generated from database evaluations.',
      span: 'md:col-span-2',
      badge: 'Metrics Console'
    },
    {
      icon: <Key className="h-6 w-6 text-amber-400" />,
      title: 'SOC Threat Simulator',
      desc: 'Inject real-time cyber attacks and watch the autonomous Q-Agent isolate threat nodes live on a force-directed network topology graph.',
      span: 'md:col-span-1',
      badge: 'Simulator'
    }
  ];

  const techStack = [
    { name: 'Python', icon: '🐍' },
    { name: 'FastAPI', icon: '⚡' },
    { name: 'React 19', icon: '⚛️' },
    { name: 'scikit-learn', icon: '🔬' },
    { name: 'Three.js', icon: '🎨' },
    { name: 'WebSocket', icon: '🔗' },
    { name: 'PostgreSQL', icon: '🗄️' },
    { name: 'Framer Motion', icon: '✨' }
  ];


  // Particle Synthesis Sequence
  const dustSequence = [
    { type: 'text', text: 'AEGISNET', offset: [0, 0, 0] },
    { type: 'shape', shape: 'torus', offset: [0, 0, 0] },
    { type: 'text', text: 'AI DEFENSE', offset: [0, 0, 0] },
    { type: 'shape', shape: 'sphere', offset: [0, 0, 0] },
    { type: 'text', text: 'CYBER SOC', offset: [0, 0, 0] },
    { type: 'shape', shape: 'box', offset: [0, 0, 0] },
  ];

  return (
    <div className="landing-wrapper relative w-full min-h-screen bg-transparent overflow-hidden select-none" style={{ padding: 0 }}>
      
      {/* ── Background Geometric Floating Accents ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
        <ElegantShape
          delay={0.2}
          width={550}
          height={140}
          rotate={12}
          gradient="from-white/[0.04]"
          className="left-[-10%] top-[10%]"
        />
        <ElegantShape
          delay={0.5}
          width={450}
          height={110}
          rotate={-15}
          gradient="from-zinc-300/[0.04]"
          className="right-[-5%] top-[40%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-zinc-400/[0.03]"
          className="left-[10%] bottom-[15%]"
        />
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* ── SECTION 1: Unified Premium Split Hero ── */}
        <section className="min-h-[90vh] flex flex-col md:flex-row items-center justify-between gap-12 pt-28 md:pt-16 pb-12 relative">
          
          {/* Left Column: Title, Subtext, Buttons */}
          <div className="flex-1 text-left flex flex-col items-start z-10">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/20 border border-cyan-800/30 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs text-cyan-300 font-bold tracking-widest uppercase font-mono">
                  AegisNet Security Operations Active
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                Autonomous AI-Driven <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                  Cyber SOC Terminal
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="text-base md:text-lg text-neutral-400 font-light mb-8 max-w-xl leading-relaxed">
                Empowered by reinforcement learning defense agents, multi-feature NLP URL classifiers, and high-performance neural packet telemetry.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleStart}
                  className="px-8 py-4 bg-gradient-to-r from-zinc-200 via-white to-zinc-400 text-zinc-950 rounded-xl font-black text-sm shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  🚀 Launch SOC Console
                </button>
                <button
                  onClick={() => navigate('/models')}
                  className="px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 rounded-xl font-bold text-sm border border-zinc-700/50 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-md"
                >
                  🧠 Explore ML Models
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: 3D Shield Model with HUD Framing */}
          <div className="flex-1 w-full md:max-w-[48%] aspect-square relative rounded-2xl border border-cyan-500/15 bg-cyan-950/[0.05] backdrop-blur-[2px] p-2 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] group">
            <HoverSpotlight size={200} className="from-cyan-500/10 via-transparent to-transparent" />
            
            {/* Top Hacker Ticks */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-zinc-900/80 border border-white/[0.05] rounded-md px-2.5 py-1 text-[0.68rem] text-cyan-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              INTERACTIVE 3D HUD
            </div>
            <div className="absolute top-4 right-4 z-20 font-mono text-[0.62rem] text-cyan-500/60 bg-zinc-900/80 border border-white/[0.05] rounded-md px-2 py-1">
              [LATENCY: 42MS]
            </div>

            <div className="w-full h-full relative">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>

            {/* Corner Hacker Brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />
          </div>
        </section>

        {/* ── SECTION 2: Dynamic Stats Counter Row ── */}
        <section className="py-12 border-t border-b border-white/[0.05] my-12 bg-zinc-950/20 backdrop-blur-[2px] rounded-xl relative">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              
              <div className="stat-counter-item flex flex-col justify-center" ref={threatsRef}>
                <div className="text-3xl md:text-4xl font-extrabold text-red-500 font-mono mb-1">
                  {threats.toLocaleString()}+
                </div>
                <div className="text-[0.68rem] tracking-wider font-bold text-neutral-500 uppercase">Threats Mitigated</div>
              </div>

              <div className="stat-counter-item flex flex-col justify-center" ref={accuracyRef}>
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 font-mono mb-1">
                  {(accuracy / 10).toFixed(1)}%
                </div>
                <div className="text-[0.68rem] tracking-wider font-bold text-neutral-500 uppercase">Accuracy Rate</div>
              </div>

              <div className="stat-counter-item flex flex-col justify-center" ref={responseRef}>
                <div className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono mb-1">
                  &lt;{response}ms
                </div>
                <div className="text-[0.68rem] tracking-wider font-bold text-neutral-500 uppercase">Mitigation Speed</div>
              </div>

              <div className="stat-counter-item flex flex-col justify-center" ref={agentsRef}>
                <div className="text-3xl md:text-4xl font-extrabold text-purple-400 font-mono mb-1">
                  {agents.toLocaleString()}
                </div>
                <div className="text-[0.68rem] tracking-wider font-bold text-neutral-500 uppercase">Episodes Trained</div>
              </div>

            </div>
          </ScrollReveal>
        </section>

        {/* ── SECTION 3: Bento Features Grid ── */}
        <section className="py-16">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <ShinyText>Cyber SOC Arsenal</ShinyText>
              </h2>
              <p className="text-sm md:text-base text-neutral-500 max-w-xl mx-auto font-light leading-relaxed">
                Six high-performance defensive layers unified by scikit-learn classifiers, NLP networks, and reinforcement learning engines.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bentoFeatures.map((f, i) => (
              <ScrollReveal key={i} delay={100 + i * 50} className={`bento-cell ${f.span}`}>
                <SpotlightCard className="relative p-8 h-full bg-zinc-950/60 border border-white/[0.05] rounded-xl hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                  <HoverSpotlight size={120} className="from-cyan-500/10 via-transparent to-transparent" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-zinc-900 border border-white/[0.04] rounded-lg">
                        {f.icon}
                      </div>
                      <span className="text-[0.65rem] font-bold text-cyan-400/80 font-mono uppercase bg-cyan-950/10 border border-cyan-900/30 px-2 py-0.5 rounded">
                        {f.badge}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                      {f.title}
                    </h3>
                    <p className="text-sm text-neutral-400 font-light leading-relaxed mb-4">
                      {f.desc}
                    </p>
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </section>

      </div>

      {/* ── SECTION 4: High-Performance Particle Engine (MagicDust) ── */}
      <section className="relative py-24 bg-transparent border-t border-b border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MagicDust sequence={dustSequence} particleCount={7000} holdDuration={2.2} particleColor="#22d3ee" />
        </div>
        
        {/* Tactical HUD Overlay for MagicDust */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <div className="font-mono text-[0.62rem] text-cyan-400 bg-zinc-950/60 border border-white/[0.04] px-2 py-1 rounded">
              [CMD_STREAM: ACTIVE]
            </div>
            <div className="font-mono text-[0.62rem] text-cyan-400 bg-zinc-950/60 border border-white/[0.04] px-2 py-1 rounded">
              [PARTICLES: 7,000]
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="font-mono text-[0.62rem] text-cyan-500/50 flex flex-col gap-0.5">
              <span>SYS_INF: CORE_ACTIVE</span>
              <span>MEM_LOAD: 41.8%</span>
              <span>NET_IN: 1084 KB/S</span>
            </div>
            <div className="font-mono text-[0.62rem] text-cyan-500/50 text-right">
              SYSTEM LEVEL: ELITE
            </div>
          </div>
        </div>

        <div className="relative z-20 text-center pointer-events-none max-w-lg mx-auto px-6">
          <span className="text-[0.65rem] tracking-[0.2em] font-extrabold text-cyan-400 uppercase">
            Interactive Particle synthesis
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-4">
            Q-Agent Policy Simulation
          </h2>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Hover and drag over the canvas to distort the particle structure and test active vector resolution mapping.
          </p>
        </div>
      </section>


      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* ── SECTION 6: Platform Pipeline Architecture ── */}
        <section className="py-16">
          <ScrollReveal>
            <SpotlightCard className="relative bg-zinc-950/40 border border-white/[0.05] rounded-2xl p-8 md:p-12 overflow-hidden shadow-2xl">
              <HoverSpotlight size={240} className="from-cyan-500/8 via-purple-500/4 to-transparent" />
              
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                  🛡️ Threat Resolution Pipeline
                </h2>
                <p className="text-xs md:text-sm text-neutral-500 max-w-lg mx-auto">
                  A synchronous flow connecting simulation parameters with machine learning models and automated actions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center text-center">
                
                <div className="bg-zinc-900/80 border border-white/[0.03] p-6 rounded-xl">
                  <span className="text-[0.62rem] font-bold text-neutral-500 font-mono uppercase">L1 ENTRY</span>
                  <h4 className="text-base font-bold text-white mt-2 mb-1">Simulator</h4>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">Generates ddos, SQLi, and brute-force traffic parameters.</p>
                </div>
                
                <div className="hidden md:block text-2xl text-neutral-600">➡️</div>
                
                <div className="bg-zinc-900/80 border border-cyan-500/10 p-6 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.02)]">
                  <span className="text-[0.62rem] font-bold text-cyan-400 font-mono uppercase">L2 CLASSIFICATION</span>
                  <h4 className="text-base font-bold text-cyan-300 mt-2 mb-1">ML Engines</h4>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">Inspects traffic flags via Random Forest and Logistic Regression.</p>
                </div>
                
                <div className="hidden md:block text-2xl text-neutral-600">➡️</div>
                
                <div className="bg-zinc-900/80 border border-purple-500/10 p-6 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.02)]">
                  <span className="text-[0.62rem] font-bold text-purple-400 font-mono uppercase">L3 MITIGATION</span>
                  <h4 className="text-base font-bold text-purple-300 mt-2 mb-1">Q-Agent</h4>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">Selects optimum response using a pre-trained policy table.</p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-white/[0.04] text-xs md:text-sm">
                <div>
                  <h5 className="font-bold text-white mb-2">📡 Streaming WebSockets</h5>
                  <p className="text-neutral-400 font-light leading-relaxed">Real-time status changes, threat coordinates, and log messages stream directly to the React front-end client at low latency.</p>
                </div>
                <div>
                  <h5 className="font-bold text-white mb-2">🛡️ Autonomous Mitigation</h5>
                  <p className="text-neutral-400 font-light leading-relaxed">Mitigations ( honeypots, rate-limits, firewall blocks ) deploy instantly in the host environment to contain active threat vectors.</p>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
        </section>

        {/* ── SECTION 7: Core Technology Pills ── */}
        <section className="py-12 text-center">
          <ScrollReveal>
            <h3 className="text-xs tracking-[0.2em] font-extrabold text-neutral-500 uppercase mb-8">
              CORE INFRASTRUCTURE STACK
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-950/10 border border-cyan-900/20 text-xs text-white/80 font-mono font-medium hover:border-cyan-500/30 hover:text-white transition-all duration-300 cursor-default"
                >
                  <span>{tech.icon}</span>
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ── SECTION 8: Holographic Call-To-Action ── */}
        <section className="py-16 pb-24">
          <ScrollReveal>
            <div className="relative rounded-2xl border border-zinc-800/60 bg-gradient-to-b from-zinc-950/20 to-black/20 backdrop-blur-[2px] p-10 md:p-16 overflow-hidden text-center shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.04),transparent_70%)]" />
              
              <span className="text-3xl mb-6 inline-block filter drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                🛡️
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 relative z-10 leading-tight">
                Secure Your Network Infrastructure Today
              </h2>
              <p className="text-sm text-neutral-400 font-light max-w-xl mx-auto mb-8 relative z-10 leading-relaxed">
                Launch autonomous model training loops and observe real-time cyber defense simulations inside our advanced terminal workspace.
              </p>
              
              <button
                className="px-8 py-4 bg-gradient-to-r from-zinc-200 via-white to-zinc-400 text-zinc-950 rounded-xl font-black text-sm shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300 hover:-translate-y-0.5 relative z-10"
                onClick={handleStart}
              >
                🚀 Open SOC Command Workspace
              </button>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </div>
  );
}
