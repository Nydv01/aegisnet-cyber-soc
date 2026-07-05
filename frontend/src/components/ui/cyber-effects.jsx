import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { cn } from "../../lib/utils";

// ─── 1. AnimatedBorderCard: Glow line cycling around borders ───
export function AnimatedBorderCard({ className, children, glowColor = "var(--neon-cyan)" }) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-slate-950/80 border border-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.4)] group",
        className
      )}
    >
      {/* Glow path border */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: `radial-gradient(120px circle at var(--mouse-x, 0) var(--mouse-y, 0), ${glowColor}1a, transparent 80%)`,
        }}
      />
      {/* Running neon border border */}
      <span className="absolute inset-[-1000%] animate-[spin_5s_linear_infinite] opacity-30 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0 bg-[conic-gradient(from_0deg,transparent_40%,var(--neon-cyan)_50%,var(--neon-blue)_60%,transparent_70%)]" />
      
      <div className="absolute inset-[1px] bg-slate-950/95 rounded-[11px] z-10" />
      
      {/* Content wrapper */}
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
}

// ─── 2. InteractiveGrid: Drifting neon beam grids ───
export function InteractiveGrid({ className }) {
  const containerRef = useRef(null);
  const [beams, setBeams] = useState([]);

  // Spawn beams traveling across grids
  useEffect(() => {
    const interval = setInterval(() => {
      if (beams.length > 8) return;
      const isHorizontal = Math.random() > 0.5;
      const id = Date.now() + Math.random();
      const position = Math.floor(Math.random() * 10) * 10; // 0-90%
      const speed = Math.random() * 4 + 3; // 3-7s

      setBeams((prev) => [
        ...prev,
        { id, isHorizontal, position, speed, direction: Math.random() > 0.5 ? 1 : -1 }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [beams]);

  const removeBeam = (id) => {
    setBeams((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      {beams.map((b) => {
        const initialOffset = b.direction > 0 ? '-100%' : '100%';
        const animateOffset = b.direction > 0 ? '200%' : '-100%';

        return (
          <motion.div
            key={b.id}
            onAnimationComplete={() => removeBeam(b.id)}
            initial={b.isHorizontal ? { left: initialOffset, y: `${b.position}%` } : { top: initialOffset, x: `${b.position}%` }}
            animate={b.isHorizontal ? { left: animateOffset } : { top: animateOffset }}
            transition={{ duration: b.speed, ease: "linear" }}
            className={cn(
              "absolute bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]",
              b.isHorizontal ? "h-[1.5px] w-[180px] left-0" : "w-[1.5px] h-[180px] top-0"
            )}
            style={
              b.isHorizontal
                ? { top: `${b.position}%`, background: "linear-gradient(90deg, transparent, var(--neon-cyan), transparent)" }
                : { left: `${b.position}%`, background: "linear-gradient(180deg, transparent, var(--neon-cyan), transparent)" }
            }
          />
        );
      })}
    </div>
  );
}

// ─── 3. TerminalTextStream: Cybernetic text decryption effect ───
export function TerminalTextStream({ text, speed = 40, className, delay = 0 }) {
  const [displayText, setDisplayText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";

  useEffect(() => {
    let active = true;
    let timer;
    let index = 0;

    const startTimeout = setTimeout(() => {
      const run = () => {
        if (!active) return;
        if (index >= text.length) {
          setDisplayText(text);
          setIsDone(true);
          return;
        }

        // Add character
        const current = text.substring(0, index + 1);
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        
        setDisplayText(current.substring(0, current.length - 1) + randomChar);
        index++;
        timer = setTimeout(run, speed);
      };
      run();
    }, delay);

    return () => {
      active = false;
      clearTimeout(startTimeout);
      clearTimeout(timer);
    };
  }, [text, speed, delay]);

  return (
    <span className={cn("font-mono", className)}>
      {displayText}
      {!isDone && <span className="animate-pulse bg-cyan-400 text-cyan-400 ml-[1px] h-3 w-1.5 inline-block align-middle">|</span>}
    </span>
  );
}

// ─── 4. RadarSweep: Futuristic military radar sweep HUD ───
export function RadarSweep({ className, threatLevel = "safe" }) {
  const containerRef = useRef(null);
  const [blips, setBlips] = useState([]);

  // Spawn blips (threat markers) randomly reacting to threatLevel
  useEffect(() => {
    const isAtk = threatLevel !== "safe" && threatLevel !== "none";
    const blipInterval = isAtk ? 1200 : 3500;

    const interval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 50; // percentage
      const id = Date.now() + Math.random();

      setBlips((prev) => [
        ...prev,
        { id, x: 50 + Math.cos(angle) * radius * 0.45, y: 50 + Math.sin(angle) * radius * 0.45, threat: isAtk }
      ]);
    }, blipInterval);

    return () => clearInterval(interval);
  }, [threatLevel]);

  // Clean old blips
  useEffect(() => {
    const clean = setInterval(() => {
      setBlips((prev) => prev.slice(-10));
    }, 10000);
    return () => clearInterval(clean);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-square max-w-[280px] mx-auto rounded-full border border-cyan-500/20 bg-slate-950/40 backdrop-blur-sm overflow-hidden flex items-center justify-center shadow-[inset_0_0_30px_rgba(6,182,212,0.08)]",
        className
      )}
    >
      {/* Radar grid rings */}
      <div className="absolute inset-[15%] rounded-full border border-cyan-500/10 pointer-events-none" />
      <div className="absolute inset-[35%] rounded-full border border-cyan-500/10 pointer-events-none" />
      <div className="absolute inset-[55%] rounded-full border border-cyan-500/10 pointer-events-none" />
      <div className="absolute inset-[75%] rounded-full border border-cyan-500/10 pointer-events-none" />

      {/* Grid cross lines */}
      <div className="absolute w-[95%] h-[1px] bg-cyan-500/10" />
      <div className="absolute h-[95%] w-[1px] bg-cyan-500/10" />

      {/* Sweep overlay line */}
      <div
        className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite] pointer-events-none"
        style={{
          background: "conic-gradient(from 0deg, rgba(6,182,212,0.15) 0deg, rgba(6,182,212,0.02) 60deg, transparent 90deg)",
        }}
      />

      {/* Active Blips */}
      {blips.map((blip) => (
        <motion.div
          key={blip.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.8, 0], scale: [0.5, 1.2, 1, 0.2] }}
          transition={{ duration: 6, times: [0, 0.05, 0.4, 1], ease: "easeOut" }}
          className={cn(
            "absolute w-2 h-2 rounded-full",
            blip.threat
              ? "bg-red-500 shadow-[0_0_10px_#ef4444]"
              : "bg-cyan-500 shadow-[0_0_10px_#22d3ee]"
          )}
          style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
        />
      ))}
    </div>
  );
}

// ─── 5. CyberButton: Cyberpunk style button with brackets & scanlines ───
export function CyberButton({ className, children, onClick, disabled, variant = "primary" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative px-6 py-3 font-mono text-xs uppercase tracking-widest border transition-all duration-300 disabled:opacity-50 overflow-hidden group select-none",
        variant === "primary"
          ? "border-cyan-500/40 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          : "border-red-500/40 text-red-400 bg-red-950/20 hover:bg-red-500 hover:text-black hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
        className
      )}
    >
      {/* Corner Bracket Decorators */}
      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-current" />
      <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-current" />
      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-current" />
      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-current" />

      {/* Sweep laser line */}
      <span className="absolute left-[-100%] top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />

      <span className="relative z-10">{children}</span>
    </button>
  );
}
