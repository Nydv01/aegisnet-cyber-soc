import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue, useInView } from 'framer-motion';
import { Terminal, Shield, Cpu, Activity, Database, Key, ShieldAlert, ArrowRight, Eye, Server, RefreshCw, Layers, Compass, Play, BarChart2, CheckCircle, HelpCircle } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import ShinyText from './ShinyText';
import TextScramble from './TextScramble';

// Premium UI Components
import { SplineScene } from './ui/spline';
import { MagicDust } from './ui/magic-dust';
import { HoverSpotlight } from './ui/spotlight';

// Advanced Animation Engine
import {
  ScrollFadeIn,
  ScrollSlideIn,
  ScrollScale,
  ScrollRotateIn,
  TextRevealByWord,
  ParallaxLayer,
  StaggerContainer,
  StaggerItem,
  MagneticElement,
  ScrollProgress,
  PerspectiveCard,
  SVGPathDraw,
  RippleButton,
  GlitchFlicker,
  AnimatedCounter,
  BorderTraceCard,
} from './ScrollAnimations';

// ── Elegant Floating Hardware Accents ──────────────────────────────
function ElegantShape({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -120, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{ duration: 2.5, delay, ease: [0.16, 1, 0.3, 1], opacity: { duration: 1.5 } }}
      className={`absolute pointer-events-none ${className}`}
    >
      <motion.div
        animate={{ y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[3px] border border-white/[0.03] shadow-[0_8px_32px_0_rgba(255,255,255,0.005)]`} />
      </motion.div>
    </motion.div>
  );
}

// ── Animated Letter Component for Hero ──────────────────────────────
function AnimatedLetter({ letter, index, isSpace }) {
  if (isSpace) return <span className="inline-block w-[0.3em]">&nbsp;</span>;
  return (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, y: 40, rotateX: 90, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.6,
        delay: 0.05 * index,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ display: 'inline-block' }}
    >
      {letter}
    </motion.span>
  );
}

// ── Animated Hero Title ─────────────────────────────────────────────
function AnimatedTitle({ text, className }) {
  return (
    <span className={className}>
      {text.split('').map((letter, i) => (
        <AnimatedLetter
          key={i}
          letter={letter}
          index={i}
          isSpace={letter === ' '}
        />
      ))}
    </span>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const token = localStorage.getItem('aegis_token');
  const [hoveredFeature, setHoveredFeature] = useState(null);

  // Custom HUD Cursor Coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCursorActive, setIsCursorActive] = useState(false);

  // Simulated Phishing Classifier
  const [phishingInput, setPhishingInput] = useState('https://secure-update-paypal-verify.com');
  const [isPhishingScanning, setIsPhishingScanning] = useState(false);
  const [phishingResult, setPhishingResult] = useState(null);

  // Interactive Pipeline Active Step
  const [activePipelineStep, setActivePipelineStep] = useState(0);

  const [terminalFeed, setTerminalFeed] = useState([
    'SYSTEM BOOT: AegisNet Cyber SOC Kernel Initialized...',
    'READY: Standby for telemetry uplink...',
    'MODEL_LOAD: Random Forest & Q-Table weights mapped'
  ]);

  // Framer Motion scroll hooks for background parallax & text reveals
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.15], [0, 10]);

  // Quote section: word-by-word reveal
  const quoteRef = useRef(null);

  // Track cursor position for custom reticle
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStart = () => {
    navigate(token ? '/dashboard' : '/login');
  };

  const bentoFeatures = [
    {
      id: 'ids',
      icon: <Shield className="h-6 w-6 text-zinc-300" />,
      title: 'Intrusion Detection System',
      desc: 'Random Forest classifiers trained on 20K+ network flow logs. Live packet parsing detects DDoS, port scans, brute force, and SQL injections with 99.8% accuracy.',
      span: 'lg:col-span-2',
      badge: 'ML Engine',
      metric: 'ACCURACY: 99.8%',
      logMessage: 'IDS_MODULE: Initializing Random Forest telemetry classifier. Scanning interface eth0...',
      direction: 'left',
    },
    {
      id: 'phishing',
      icon: <Terminal className="h-6 w-6 text-zinc-400" />,
      title: 'Phishing URL Scanner',
      desc: 'TF-IDF lexical n-gram tokenization and Shannon entropy calculations identify malicious URLs instantly.',
      span: 'lg:col-span-1',
      badge: 'NLP Model',
      metric: 'FEATURES: 518 DIM',
      logMessage: 'NLP_MODULE: Shannon entropy threshold set to 4.8. Initializing lexical URL tokenizer...',
      direction: 'right',
    },
    {
      id: 'rl_agent',
      icon: <Cpu className="h-6 w-6 text-zinc-400" />,
      title: 'Q-Learning Defense Agent',
      desc: 'Reinforcement learning agent trained over 5,000 episodes to select optimal mitigations like honeypot deployment or IP segmentation.',
      span: 'lg:col-span-1',
      badge: 'RL Agent',
      metric: 'EPISODES: 5,000',
      logMessage: 'RL_AGENT: Q-Table mapping 375 states to 7 action profiles loaded. Policy optimization: active.',
      direction: 'left',
    },
    {
      id: 'telemetry',
      icon: <Activity className="h-6 w-6 text-zinc-300" />,
      title: 'SOC Telemetry Workspace',
      desc: 'WebSocket streams push system metrics, bandwidth, latency, and threat signals directly into live graphical HUD charts and interactive dials.',
      span: 'lg:col-span-2',
      badge: 'SOC Command',
      metric: 'LATENCY: <1MS',
      logMessage: 'WEBSOCKET_CONN: Establishing secure socket tunnel to ASGI server loop. Telemetry heartbeat ok.',
      direction: 'right',
    },
    {
      id: 'metrics',
      icon: <Database className="h-6 w-6 text-zinc-400" />,
      title: 'Model Zoo & Validation Metrics',
      desc: 'Analyze active models using confusion matrix heatmaps, feature importance charts, and ROC/AUC reward curves generated from database evaluations.',
      span: 'lg:col-span-2',
      badge: 'Metrics Console',
      metric: 'ROC-AUC: 0.999',
      logMessage: 'METRICS_SYS: Calculating cross-validation fold sets. Database connection pooled successfully.',
      direction: 'left',
    },
    {
      id: 'simulator',
      icon: <Key className="h-6 w-6 text-zinc-300" />,
      title: 'SOC Threat Simulator',
      desc: 'Inject real-time cyber attacks and watch the autonomous Q-Agent isolate threat nodes live on a force-directed network topology graph.',
      span: 'lg:col-span-1',
      badge: 'Simulator',
      metric: 'ATTACK VECTORS: 4',
      logMessage: 'SIM_ENGINE: Payload queues configured for DDoS, Port Scan, Brute Force, and SQLi injects.',
      direction: 'right',
    }
  ];

  const testPhishingURL = () => {
    setIsPhishingScanning(true);
    setPhishingResult(null);
    setTimeout(() => {
      setIsPhishingScanning(false);
      setPhishingResult({ isPhishing: true, score: 0.985 });
      setTerminalFeed(prev => [
        ...prev.slice(-3),
        `[SCAN_REQUEST]: URL: ${phishingInput}`,
        `[SCAN_RESULT]: 98.5% PHISHING THREAT DETECTED`
      ]);
    }, 1500);
  };

  const handleFeatureHover = (id, badge, logMsg) => {
    setHoveredFeature(id);
    if (logMsg) {
      setTerminalFeed(prev => [
        ...prev.slice(-3),
        `[LOG_REQUEST]: Querying ${badge}...`,
        logMsg
      ]);
    }
  };

  const techStack = [
    { name: 'Python 3.12', icon: '🐍', desc: 'High-performance ASGI loops & FastAPI backend' },
    { name: 'FastAPI', icon: '⚡', desc: 'Low-latency routing & WebSocket pipelines' },
    { name: 'React 19', icon: '⚛️', desc: 'Concurrent UI rendering & visual state cycles' },
    { name: 'scikit-learn', icon: '🔬', desc: 'Random Forest & Logistic Regression classifiers' },
    { name: 'Three.js', icon: '🎨', desc: 'Hardware-accelerated 3D HUD visuals' },
    { name: 'WebSocket', icon: '🔗', desc: 'Real-time telemetry streaming connection' },
    { name: 'Supabase', icon: '⚡', desc: 'Cloud authentication SDK & session mapping' },
    { name: 'Framer Motion', icon: '✨', desc: 'Smooth spring animations & scroll parallax' }
  ];

  const dustSequence = [
    { type: 'text', text: 'AEGISNET', offset: [0, 0, 0] },
    { type: 'shape', shape: 'torus', offset: [0, 0, 0] },
    { type: 'text', text: 'AI DEFENSE', offset: [0, 0, 0] },
    { type: 'shape', shape: 'sphere', offset: [0, 0, 0] },
    { type: 'text', text: 'CYBER SOC', offset: [0, 0, 0] },
    { type: 'shape', shape: 'box', offset: [0, 0, 0] },
  ];

  const pipelineSteps = [
    {
      title: 'Simulator Engine',
      subtitle: 'Exploit Parameter Generation',
      desc: 'Simulates cyber attack traffic configurations. Injects multi-threaded packets representing DDoS floods, port scans, SSH brute-forcing, and SQLi payloads into virtual switches.',
      log: 'SIM_SYS: Outbound packet queue loaded. Launching 120 exploit threads...',
      stat: 'OUTPUT: 1,500 pkt/s'
    },
    {
      title: 'ML Telemetry Engines',
      subtitle: 'Intelligent Pattern Extraction',
      desc: 'Parses live packet frames instantly. Random Forest checks serror/rerror rates, and TF-IDF evaluates lexical entropy, generating prediction vectors.',
      log: 'ML_CORE: Telemetry flag checked. Random Forest prediction: DDoS threat detected.',
      stat: 'ACCURACY: 99.8%'
    },
    {
      title: 'Q-Learning Defense Agent',
      subtitle: 'Reinforcement Learning Policy',
      desc: 'Maps states to optimum mitigations. Checks the current threat level, system health, and load, executing actions (block IP, rate-limit, segment network) to defend.',
      log: 'RL_AGENT: Executing firewall block on 192.168.1.104. Mitigation confirmed.',
      stat: 'SPEED: <1ms'
    }
  ];

  // ── Render the bento card content ──
  const renderBentoCardContent = (feature) => {
    switch (feature.id) {
      case 'ids':
        return (
          <div className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3 mt-4 mb-4">
            <div className="flex justify-between items-center text-[0.62rem] font-mono text-zinc-500 mb-2">
              <span>LIVE TRAFFIC FLAG SPECTROMETER</span>
              <span className="text-zinc-400 font-bold">104.2 pkt/s</span>
            </div>
            <svg className="mini-bento-chart" viewBox="0 0 400 50">
              <path d="M0,25 Q40,5 80,45 T160,25 T240,10 T320,35 T400,20" />
            </svg>
          </div>
        );
      case 'phishing':
        return (
          <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3 flex flex-col gap-2 mt-4 mb-4" onClick={e => e.stopPropagation()}>
            <span className="text-[0.58rem] font-mono text-zinc-500 uppercase">CLASSIFY LIVE URL PREVIEW</span>
            <div className="flex gap-2">
              <input
                type="text"
                className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-[0.65rem] font-mono text-zinc-300 flex-1 outline-none focus:border-zinc-700"
                value={phishingInput}
                onChange={e => setPhishingInput(e.target.value)}
              />
              <button
                onClick={testPhishingURL}
                className="bg-white text-zinc-950 rounded px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-wider cursor-pointer hover:bg-zinc-200 transition-colors flex items-center gap-1"
              >
                {isPhishingScanning ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : <Play className="h-2.5 w-2.5" />}
              </button>
            </div>
            {phishingResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[0.62rem] font-mono text-red-400 bg-red-950/20 border border-red-900/30 rounded p-1.5 flex justify-between items-center"
              >
                <span>⚠️ PHISHING BLOCK</span>
                <span>SCORE: {phishingResult.score}</span>
              </motion.div>
            )}
          </div>
        );
      case 'rl_agent':
        return (
          <div className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3 mt-4 mb-4 font-mono text-[0.62rem] text-zinc-500">
            <div className="flex justify-between items-center mb-1">
              <span>POLICY ACTIONS</span>
              <span className="text-emerald-400">BEST ACTION</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between bg-zinc-950 px-2 py-0.5 rounded">
                <span>1. Honeypot Deploy</span>
                <span className="text-zinc-400">Q = 41.2</span>
              </div>
              <div className="flex justify-between bg-zinc-950 px-2 py-0.5 rounded border border-emerald-900/30 text-emerald-400">
                <span>2. Block IP Route</span>
                <span>Q = 88.7</span>
              </div>
            </div>
          </div>
        );
      case 'telemetry':
        return (
          <div className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3.5 mt-4 mb-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[0.62rem] font-mono text-zinc-500">
              <span>CPU THREAD ALLOCATION</span>
              <span className="text-zinc-300">41.8%</span>
            </div>
            <div className="health-bar-track" style={{ height: 6 }}>
              <motion.div
                className="health-bar-fill"
                style={{ background: '#ffffff' }}
                initial={{ width: 0 }}
                whileInView={{ width: '41.8%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </div>
          </div>
        );
      case 'metrics':
        return (
          <div className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3 mt-4 mb-4 flex gap-4 font-mono text-[0.62rem] text-zinc-500">
            <div className="flex-1">
              <span>ACCURACY FLD-1</span>
              <div className="h-1.5 bg-zinc-950 rounded mt-1 overflow-hidden">
                <motion.div
                  className="h-full bg-zinc-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: '99.2%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
              </div>
            </div>
            <div className="flex-1">
              <span>ACCURACY FLD-2</span>
              <div className="h-1.5 bg-zinc-950 rounded mt-1 overflow-hidden">
                <motion.div
                  className="h-full bg-zinc-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: '99.7%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        );
      case 'simulator':
        return (
          <div className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-2.5 mt-4 mb-4 flex justify-between items-center font-mono text-[0.62rem]">
            <span className="text-zinc-500">DDOS TRAFFIC OVERLOAD</span>
            <GlitchFlicker active>
              <span className="text-red-400 font-bold">ALERT: HIGH</span>
            </GlitchFlicker>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="landing-wrapper relative w-full min-h-screen bg-transparent overflow-hidden select-none" style={{ padding: 0 }}>

      {/* ── Scroll Progress Indicator ── */}
      <ScrollProgress color="#ffffff" height={2} />

      {/* ── Futuristic Custom Reticle Cursor ── */}
      <div
        className={`hud-cursor ${isCursorActive ? 'active' : ''}`}
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      >
        <div className="hud-cursor-center" />
        <div className="hud-cursor-coords">
          X:{mousePos.x} Y:{mousePos.y}
        </div>
      </div>

      {/* ── Background Parallax Ambient Aura ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <ParallaxLayer speed={-0.3}>
          <ElegantShape
            delay={0.2}
            width={650}
            height={160}
            rotate={12}
            gradient="from-white/[0.03]"
            className="left-[-12%] top-[8%]"
          />
        </ParallaxLayer>
        <ParallaxLayer speed={0.2}>
          <ElegantShape
            delay={0.5}
            width={500}
            height={120}
            rotate={-15}
            gradient="from-zinc-300/[0.03]"
            className="right-[-8%] top-[35%]"
          />
        </ParallaxLayer>
        <ParallaxLayer speed={-0.15}>
          <ElegantShape
            delay={0.8}
            width={400}
            height={100}
            rotate={8}
            gradient="from-white/[0.02]"
            className="left-[20%] top-[60%]"
          />
        </ParallaxLayer>
      </div>

      {/* ── Left/Right Side Telemetry Ticks ── */}
      <div className="absolute left-6 top-32 bottom-32 w-1.5 hud-ticks-vertical pointer-events-none opacity-20 hidden md:block" />
      <div className="absolute right-6 top-32 bottom-32 w-1.5 hud-ticks-vertical pointer-events-none opacity-20 hidden md:block" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 10 }}>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: CINEMATIC HERO
            ═══════════════════════════════════════════════════════════════ */}
        <motion.section
          style={{
            opacity: heroOpacity,
            scale: heroScale,
          }}
          className="min-h-screen flex flex-col lg:flex-row items-center justify-between gap-16 pt-32 lg:pt-0 pb-16 relative"
        >
          {/* Left Column */}
          <div className="flex-1 text-left flex flex-col items-start z-10 w-full">
            <ScrollFadeIn delay={0} y={30}>
              <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-zinc-950/80 border border-zinc-800/60 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.01)]">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_#ffffff]" />
                <span className="text-[0.62rem] text-zinc-400 font-black tracking-[0.2em] uppercase font-mono">
                  MIL-SPEC ACTIVE // AUTONOMOUS NEURAL SOC
                </span>
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.15} y={50}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-8 leading-[1.02] font-sans" style={{ perspective: 800 }}>
                <AnimatedTitle text="Predictive AI" className="block" />
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-400 via-white to-zinc-500 filter drop-shadow-[0_2px_20px_rgba(255,255,255,0.12)]">
                  <AnimatedTitle text="Cyber SOC Terminal" className="" />
                </span>
              </h1>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.3} y={40}>
              <p className="text-base sm:text-lg text-zinc-400 font-light mb-10 max-w-xl leading-relaxed">
                Empowered by reinforcement learning defense agents, multi-feature NLP URL classifiers, and high-performance neural packet telemetry.
              </p>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.4} y={30}>
              <div className="flex flex-wrap gap-5 mb-10 w-full">
                <MagneticElement strength={0.2}>
                  <RippleButton
                    onClick={handleStart}
                    onMouseEnter={() => setIsCursorActive(true)}
                    onMouseLeave={() => setIsCursorActive(false)}
                    className="sci-fi-btn hover-shimmer"
                  >
                    [ LAUNCH CONSOLE ]
                    <span className="sci-fi-btn-sub">SYS_UPLINK</span>
                  </RippleButton>
                </MagneticElement>
                <MagneticElement strength={0.15}>
                  <button
                    onClick={() => navigate('/models')}
                    onMouseEnter={() => setIsCursorActive(true)}
                    onMouseLeave={() => setIsCursorActive(false)}
                    className="apple-btn-secondary hover-shimmer"
                  >
                    🧠 Explore ML Models
                  </button>
                </MagneticElement>
              </div>
            </ScrollFadeIn>

            {/* Live Tactical Mini-Terminal */}
            <ScrollFadeIn delay={0.55} y={40} className="w-full max-w-xl">
              <div className="w-full rounded-xl border border-zinc-800/60 bg-zinc-950/80 p-5 font-mono text-[0.68rem] text-zinc-400 relative overflow-hidden backdrop-blur-md shadow-2xl mini-grid-scan">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3 text-zinc-500">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider"><Server className="h-3.5 w-3.5" /> LIVE HUD CONSOLE FEED</span>
                  <span className="animate-pulse flex items-center gap-1 text-emerald-500 font-bold"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> ONLINE</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {terminalFeed.map((line, idx) => (
                    <motion.div
                      key={`${idx}-${line.slice(0, 20)}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="truncate"
                    >
                      <span className="text-zinc-700">&gt; </span>{line}
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-700">&gt; </span>
                    <span className="h-3 w-1.5 bg-zinc-400" style={{ animation: 'typewriterBlink 1s steps(1) infinite' }} />
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          </div>

          {/* Right Column: 3D Shield Model */}
          <ScrollScale delay={0.3} scale={0.85}>
            <div className="flex-1 w-full lg:max-w-[46%] aspect-square relative rounded-3xl border border-zinc-800/50 bg-zinc-950/[0.12] backdrop-blur-[2px] p-2 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] group flex items-center justify-center">
              <HoverSpotlight size={280} className="from-white/[0.07] via-transparent to-transparent" />

              {/* Top HUD Indicators */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute top-5 left-5 z-20 flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800/80 rounded px-3 py-1.5 text-[0.62rem] text-zinc-400 font-mono"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                INTERACTIVE 3D HUD
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute top-5 right-5 z-20 font-mono text-[0.62rem] text-zinc-500/80 bg-zinc-950/80 border border-zinc-800/80 rounded px-2.5 py-1.5"
              >
                [LATENCY: 42MS]
              </motion.div>

              <div className="w-full h-full relative z-10 flex items-center justify-center">
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </div>

              {/* Corner HUD Bracket Highlights */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-zinc-600/40" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-zinc-600/40" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-zinc-600/40" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-zinc-600/40" />
            </div>
          </ScrollScale>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: STATS COUNTER — Staggered cascade with spring
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-16 border-t border-b border-zinc-900/60 my-24 bg-zinc-950/[0.15] backdrop-blur-[2px] rounded-xl relative overflow-hidden">
          {/* Ambient scan line */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 49%, rgba(255,255,255,0.03) 50%, transparent 51%)', backgroundSize: '100% 4px' }} />
          </div>

          <StaggerContainer staggerDelay={0.12} className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center font-mono px-8">
            <StaggerItem direction="scale">
              <div className="stat-counter-item flex flex-col justify-center">
                <div className="text-4xl sm:text-5xl font-black text-red-500 mb-2 tracking-tight filter drop-shadow-[0_0_10px_rgba(239,68,68,0.25)]">
                  <AnimatedCounter value={10847} />+
                </div>
                <div className="text-[0.65rem] tracking-[0.2em] font-extrabold text-zinc-500 uppercase">Threats Mitigated</div>
              </div>
            </StaggerItem>

            <StaggerItem direction="scale">
              <div className="stat-counter-item flex flex-col justify-center">
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 mb-2 tracking-tight filter drop-shadow-[0_0_10px_rgba(52,211,153,0.25)]">
                  <AnimatedCounter value={99} />.8%
                </div>
                <div className="text-[0.65rem] tracking-[0.2em] font-extrabold text-zinc-500 uppercase">Accuracy Rate</div>
              </div>
            </StaggerItem>

            <StaggerItem direction="scale">
              <div className="stat-counter-item flex flex-col justify-center">
                <div className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight filter drop-shadow-[0_0_10px_rgba(255,255,255,0.08)]">
                  &lt;<AnimatedCounter value={47} />ms
                </div>
                <div className="text-[0.65rem] tracking-[0.2em] font-extrabold text-zinc-500 uppercase">Mitigation Speed</div>
              </div>
            </StaggerItem>

            <StaggerItem direction="scale">
              <div className="stat-counter-item flex flex-col justify-center">
                <div className="text-4xl sm:text-5xl font-black text-zinc-400 mb-2 tracking-tight">
                  <AnimatedCounter value={5000} />
                </div>
                <div className="text-[0.65rem] tracking-[0.2em] font-extrabold text-zinc-500 uppercase">Episodes Trained</div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: BENTO FEATURES — 3D perspective cards + stagger
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-24">
          <ScrollFadeIn y={40}>
            <div className="text-center mb-24">
              <span className="text-[0.62rem] text-zinc-500 font-extrabold tracking-[0.2em] uppercase font-mono block mb-3">
                SECURE DEFENSIVE LAYERS
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight font-sans">
                <ShinyText>Cyber SOC Arsenal</ShinyText>
              </h2>
              <p className="text-sm md:text-base text-zinc-500 max-w-2xl mx-auto font-light leading-relaxed">
                Six high-performance defensive layers unified by scikit-learn classifiers, NLP networks, and reinforcement learning engines.
              </p>
            </div>
          </ScrollFadeIn>

          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {bentoFeatures.map((feature, idx) => (
              <StaggerItem key={feature.id} direction={idx % 2 === 0 ? 'left' : 'right'} className={feature.span}>
                <PerspectiveCard intensity={8} className="h-full">
                  <div
                    onMouseEnter={() => handleFeatureHover(feature.id, feature.badge, feature.logMessage)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    className="h-full"
                  >
                    <SpotlightCard className="relative p-8 h-full bg-zinc-950/60 border border-white/[0.05] rounded-xl hover:border-zinc-700/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer hover-shimmer">
                      <HoverSpotlight size={160} className="from-white/[0.04] via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30" />

                      <div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                            {feature.icon}
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[0.58rem] font-bold text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                              {feature.metric}
                            </span>
                            <span className="text-[0.58rem] font-extrabold text-zinc-400 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                              {feature.badge}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-zinc-200 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed mb-2">
                          {feature.desc}
                        </p>

                        {renderBentoCardContent(feature)}
                      </div>

                      <div className="flex items-center gap-1.5 text-[0.65rem] text-zinc-500 font-mono font-bold uppercase relative z-10 pt-4 border-t border-zinc-900/60 group-hover:text-zinc-300 transition-colors">
                        <Eye className="h-3.5 w-3.5" /> Hover to preview module logs
                      </div>
                    </SpotlightCard>
                  </div>
                </PerspectiveCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: PARTICLE ENGINE — Parallax offset
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 bg-transparent border-t border-b border-zinc-900/80 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MagicDust sequence={dustSequence} particleCount={7000} holdDuration={2.2} particleColor="#d4d4d8" />
        </div>

        {/* Tactical HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[0.62rem] text-zinc-400 bg-zinc-950/60 border border-zinc-800/80 px-2.5 py-1 rounded"
            >
              [CMD_STREAM: ACTIVE]
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-mono text-[0.62rem] text-zinc-400 bg-zinc-950/60 border border-zinc-800/80 px-2.5 py-1 rounded"
            >
              [PARTICLES: 7,000]
            </motion.div>
          </div>

          <div className="flex justify-between items-end">
            <div className="font-mono text-[0.62rem] text-zinc-500/60 flex flex-col gap-0.5">
              <span>SYS_INF: CORE_ACTIVE</span>
              <span>MEM_LOAD: 41.8%</span>
              <span>NET_IN: 1084 KB/S</span>
            </div>
            <div className="font-mono text-[0.62rem] text-zinc-500/60 text-right">
              SYSTEM LEVEL: ELITE
            </div>
          </div>
        </div>

        <ScrollFadeIn y={30} blur className="relative z-20 text-center pointer-events-none max-w-lg mx-auto px-6">
          <span className="text-[0.62rem] tracking-[0.2em] font-extrabold text-zinc-400 uppercase font-mono">
            Interactive Particle synthesis
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-4 tracking-tight font-sans">
            Q-Agent Policy Simulation
          </h2>
          <p className="text-sm text-zinc-400 font-light leading-relaxed">
            Hover and drag over the canvas to distort the particle structure and test active vector resolution mapping.
          </p>
        </ScrollFadeIn>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: QUOTE — Word-by-word scroll reveal
          ═══════════════════════════════════════════════════════════════ */}
      <section ref={quoteRef} className="min-h-screen flex items-center justify-center relative bg-black/40 border-b border-zinc-900/60 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.015),transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-6">
          <ScrollFadeIn y={20} delay={0}>
            <span className="text-[0.68rem] font-bold text-zinc-500 tracking-[0.3em] font-mono uppercase bg-zinc-950/80 px-4 py-2 rounded-full border border-zinc-800 inline-block mb-8">
              PHILOSOPHY OF AEGISNET
            </span>
          </ScrollFadeIn>

          <TextRevealByWord
            text='"AI is not just defending the perimeter. It is predicting the breach before it launches."'
            containerRef={quoteRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight filter drop-shadow-[0_2px_15px_rgba(255,255,255,0.08)]"
            wordClassName="text-white"
          />

          <ScrollFadeIn y={15} delay={0.5}>
            <cite className="font-mono text-xs text-zinc-400 tracking-widest uppercase mt-8 not-italic block">
              — AegisNet Core Defense Thesis, V2.4
            </cite>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: PIPELINE — SVG path draw + data particles
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 min-h-screen flex flex-col justify-center">
        <ScrollFadeIn>
          <div className="text-center mb-16">
            <span className="text-[0.62rem] text-zinc-500 font-extrabold tracking-[0.2em] uppercase font-mono block mb-3">
              SYNCHRONOUS FLOW RESOLUTION
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              Interactive Resolution Pipeline
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto font-light leading-relaxed">
              Click on each schematic stage below to analyze packet parameters and reinforcement learning agent responses.
            </p>
          </div>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: SVG Pipeline with animated path draw */}
          <ScrollSlideIn direction="left" className="lg:col-span-7 flex justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01),transparent_70%)] pointer-events-none" />
            <svg viewBox="0 0 500 300" className="w-full max-w-[460px] h-auto z-10">
              {/* Animated connecting paths */}
              <motion.path
                d="M 80 150 L 250 150"
                stroke={activePipelineStep >= 1 ? '#ffffff' : '#27272a'}
                strokeWidth="2.5"
                strokeDasharray="6 4"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d="M 250 150 L 420 150"
                stroke={activePipelineStep >= 2 ? '#ffffff' : '#27272a'}
                strokeWidth="2.5"
                strokeDasharray="6 4"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Animated data particles flowing along path */}
              <circle r="3" fill="#ffffff" opacity="0.8">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M 80 150 L 250 150 L 420 150"
                />
              </circle>
              <circle r="3" fill="#ffffff" opacity="0.5">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M 80 150 L 250 150 L 420 150"
                  begin="1.5s"
                />
              </circle>
              <circle r="2" fill="#ffffff" opacity="0.3">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M 80 150 L 250 150 L 420 150"
                  begin="3s"
                />
              </circle>

              {/* Step 1 Node (L1 Simulator) */}
              <g
                onClick={() => setActivePipelineStep(0)}
                className="cursor-pointer group"
              >
                <motion.circle
                  cx="80" cy="150" r="32"
                  fill={activePipelineStep === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 10, 10, 0.6)'}
                  stroke={activePipelineStep === 0 ? '#ffffff' : '#27272a'}
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                />
                <circle
                  cx="80" cy="150" r="40"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  className={`transition-all duration-500 ${activePipelineStep === 0 ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transformOrigin: '80px 150px', animation: 'spin 20s linear infinite' }}
                />
                <text x="80" y="154" textAnchor="middle" fill="#ffffff" fontSize="16" className="select-none font-mono font-bold">L1</text>
              </g>

              {/* Step 2 Node (L2 Classifier) */}
              <g
                onClick={() => setActivePipelineStep(1)}
                className="cursor-pointer group"
              >
                <motion.circle
                  cx="250" cy="150" r="32"
                  fill={activePipelineStep === 1 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 10, 10, 0.6)'}
                  stroke={activePipelineStep === 1 ? '#ffffff' : '#27272a'}
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                />
                <circle
                  cx="250" cy="150" r="40"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  className={`transition-all duration-500 ${activePipelineStep === 1 ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transformOrigin: '250px 150px', animation: 'spin 20s linear infinite' }}
                />
                <text x="250" y="154" textAnchor="middle" fill="#ffffff" fontSize="16" className="select-none font-mono font-bold">L2</text>
              </g>

              {/* Step 3 Node (L3 Q-Agent) */}
              <g
                onClick={() => setActivePipelineStep(2)}
                className="cursor-pointer group"
              >
                <motion.circle
                  cx="420" cy="150" r="32"
                  fill={activePipelineStep === 2 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 10, 10, 0.6)'}
                  stroke={activePipelineStep === 2 ? '#ffffff' : '#27272a'}
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                />
                <circle
                  cx="420" cy="150" r="40"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  className={`transition-all duration-500 ${activePipelineStep === 2 ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transformOrigin: '420px 150px', animation: 'spin 20s linear infinite' }}
                />
                <text x="420" y="154" textAnchor="middle" fill="#ffffff" fontSize="16" className="select-none font-mono font-bold">L3</text>
              </g>
            </svg>
          </ScrollSlideIn>

          {/* Right Column: Dynamic Info Card with 3D flip */}
          <ScrollSlideIn direction="right" className="lg:col-span-5 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePipelineStep}
                initial={{ opacity: 0, rotateY: -15, x: 30, filter: 'blur(6px)' }}
                animate={{ opacity: 1, rotateY: 0, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, rotateY: 15, x: -30, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ perspective: 1200 }}
              >
                <BorderTraceCard className="rounded-2xl">
                  <SpotlightCard className="p-8 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 font-mono text-[0.62rem] text-zinc-500">
                      STAGE_ID: 0{activePipelineStep + 1}
                    </div>
                    <div>
                      <span className="text-[0.65rem] font-bold text-zinc-400 tracking-wider font-mono uppercase bg-zinc-900 border border-zinc-800 px-3 py-1 rounded">
                        {pipelineSteps[activePipelineStep].subtitle}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-4 mb-3 tracking-tight font-sans">
                        {pipelineSteps[activePipelineStep].title}
                      </h3>
                      <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6">
                        {pipelineSteps[activePipelineStep].desc}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-6 border-t border-zinc-900/60">
                      <div className="flex justify-between items-center text-[0.65rem] font-mono">
                        <span className="text-zinc-500">REAL-TIME TELEMETRY</span>
                        <span className="text-white font-bold">{pipelineSteps[activePipelineStep].stat}</span>
                      </div>
                      <div className="bg-zinc-950 border border-zinc-900 rounded p-3 font-mono text-[0.65rem] text-zinc-400 truncate">
                        <span className="text-zinc-600">&gt; </span>{pipelineSteps[activePipelineStep].log}
                      </div>
                    </div>
                  </SpotlightCard>
                </BorderTraceCard>
              </motion.div>
            </AnimatePresence>
          </ScrollSlideIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7: TECH STACK — Domino cascade + float + 3D tilt
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 border-t border-zinc-900/40">
        <ScrollFadeIn>
          <div className="text-center mb-20">
            <span className="text-[0.62rem] text-zinc-500 font-extrabold tracking-[0.2em] uppercase font-mono block mb-3">
              STACK LAYERS
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight font-sans">
              Platform Integration Core
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto font-light leading-relaxed">
              Powering asynchronous state validation checks and Three.js HUD matrices under strict latency constraints.
            </p>
          </div>
        </ScrollFadeIn>

        <StaggerContainer staggerDelay={0.07} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {techStack.map((tech, i) => (
            <StaggerItem key={tech.name} direction="up">
              <PerspectiveCard intensity={12}>
                <SpotlightCard className={`p-6 bg-zinc-950/40 border border-zinc-800/80 rounded-xl hover:border-zinc-700/60 transition-all flex flex-col justify-between h-[180px] group cursor-default hover-lift hover-shimmer ambient-float-${(i % 3) + 1}`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{tech.icon}</span>
                      <span className="text-[0.58rem] font-bold text-zinc-500 font-mono">0{i + 1}</span>
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors mb-2">
                      {tech.name}
                    </h4>
                    <p className="text-[0.72rem] text-zinc-400 font-light leading-relaxed">
                      {tech.desc}
                    </p>
                  </div>
                </SpotlightCard>
              </PerspectiveCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8: CTA — Magnetic hover + hologram rings + ripple
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 pb-44 flex items-center justify-center relative min-h-screen">
        <ScrollScale scale={0.9}>
          <div className="relative rounded-3xl border border-zinc-800/60 bg-gradient-to-b from-zinc-950/20 to-black/20 backdrop-blur-[4px] p-16 md:p-24 overflow-hidden text-center shadow-2xl max-w-5xl mx-auto flex flex-col items-center">

            {/* Hologram rings with orbit animation */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
              <svg viewBox="0 0 500 500" className="w-[450px] h-[450px]">
                <circle cx="250" cy="250" r="220" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="5 5" className="animate-[spin_40s_linear_infinite]" />
                <circle cx="250" cy="250" r="180" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="10 15" className="animate-[spin_20s_linear_infinite_reverse]" />
                <circle cx="250" cy="250" r="140" fill="none" stroke="#ffffff" strokeWidth="1" />
                <circle cx="250" cy="250" r="100" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeDasharray="2 8" className="animate-[spin_60s_linear_infinite]" />
              </svg>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.04),transparent_70%)] pointer-events-none" />

            <motion.span
              className="text-5xl mb-8 inline-block filter drop-shadow-[0_0_15px_rgba(255,255,255,0.25)] relative z-10"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🛡️
            </motion.span>

            <ScrollFadeIn y={30}>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 relative z-10 leading-tight tracking-tight max-w-3xl font-sans">
                Secure Your Network Infrastructure Today
              </h2>
            </ScrollFadeIn>

            <ScrollFadeIn y={20} delay={0.15}>
              <p className="text-sm sm:text-base text-zinc-400 font-light max-w-xl mx-auto mb-12 relative z-10 leading-relaxed">
                Launch autonomous model training loops and observe real-time cyber defense simulations inside our advanced terminal workspace.
              </p>
            </ScrollFadeIn>

            <MagneticElement strength={0.25}>
              <RippleButton
                className="sci-fi-btn scale-110 relative z-10 hover-shimmer"
                onClick={handleStart}
                onMouseEnter={() => setIsCursorActive(true)}
                onMouseLeave={() => setIsCursorActive(false)}
              >
                [ CONNECT TO COMMAND MATRIX ]
                <span className="sci-fi-btn-sub">SYS_ENGAGE</span>
              </RippleButton>
            </MagneticElement>
          </div>
        </ScrollScale>
      </section>

      {/* ── Background Scan Grid ── */}
      <div className="fixed inset-0 pointer-events-none z-50 border-[24px] border-zinc-950/20" />
    </div>
  );
}
