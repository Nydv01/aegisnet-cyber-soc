import React, { useEffect, useRef } from 'react';

/**
 * NetworkGraph — Canvas-based force-directed network topology visualization.
 * Shows the network path: Threat Actor → Firewall → WAF → Server → Database
 * with animated packet flow particles and attack-reactive visual effects.
 */

const NODES = [
  { id: 'attacker', label: 'Threat Actor', icon: '👤', x: 0.08, y: 0.5, type: 'external' },
  { id: 'firewall', label: 'Firewall', icon: '🔥', x: 0.28, y: 0.3, type: 'defense' },
  { id: 'waf', label: 'WAF', icon: '🛡️', x: 0.28, y: 0.7, type: 'defense' },
  { id: 'loadbalancer', label: 'Load Balancer', icon: '⚖️', x: 0.5, y: 0.5, type: 'infra' },
  { id: 'server1', label: 'Web Server', icon: '🖥️', x: 0.7, y: 0.3, type: 'server' },
  { id: 'server2', label: 'App Server', icon: '⚙️', x: 0.7, y: 0.7, type: 'server' },
  { id: 'database', label: 'Database', icon: '🗄️', x: 0.9, y: 0.5, type: 'data' },
];

const EDGES = [
  { from: 'attacker', to: 'firewall' },
  { from: 'attacker', to: 'waf' },
  { from: 'firewall', to: 'loadbalancer' },
  { from: 'waf', to: 'loadbalancer' },
  { from: 'loadbalancer', to: 'server1' },
  { from: 'loadbalancer', to: 'server2' },
  { from: 'server1', to: 'database' },
  { from: 'server2', to: 'database' },
];

export default function NetworkGraph({ attackActive = false, attackType = 'none', systemHealth = 100, agentAction = 'idle' }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ attackActive, attackType, systemHealth, agentAction });
  stateRef.current = { attackActive, attackType, systemHealth, agentAction };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    // Particles flowing along edges
    const particles = [];
    const MAX_PARTICLES = 40;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener('resize', resize);

    let tick = 0;

    const loop = () => {
      tick++;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const { attackActive: atk, attackType: atkType, systemHealth: hp, agentAction: action } = stateRef.current;

      // Get node positions
      const nodePos = {};
      NODES.forEach(n => {
        nodePos[n.id] = { x: n.x * w, y: n.y * h };
      });

      // Draw edges
      EDGES.forEach(edge => {
        const from = nodePos[edge.from];
        const to = nodePos[edge.to];
        if (!from || !to) return;

        const isAttackPath = atk && (edge.from === 'attacker');
        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);

        if (isAttackPath) {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.15)');
        } else {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
        }

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isAttackPath ? 2.5 : 1.5;
        ctx.stroke();
      });

      // Spawn particles
      if (tick % 8 === 0 && particles.length < MAX_PARTICLES) {
        const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
        const isAttackParticle = atk && edge.from === 'attacker';
        particles.push({
          fromId: edge.from,
          toId: edge.to,
          t: 0,
          speed: 0.008 + Math.random() * 0.008,
          isAttack: isAttackParticle,
          size: isAttackParticle ? 3 : 2,
        });
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += p.speed;
        if (p.t > 1) {
          particles.splice(i, 1);
          continue;
        }

        const from = nodePos[p.fromId];
        const to = nodePos[p.toId];
        if (!from || !to) continue;

        const px = from.x + (to.x - from.x) * p.t;
        const py = from.y + (to.y - from.y) * p.t;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        if (p.isAttack) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.8 - p.t * 0.4})`;
          ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 - p.t * 0.25})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        }
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw nodes
      NODES.forEach(n => {
        const pos = nodePos[n.id];
        const nodeRadius = 22;
        const isUnderAttack = atk && n.id === 'attacker';
        const isDefending = atk && action !== 'idle' && action !== 'do_nothing' && (n.type === 'defense');

        // Node glow
        if (isUnderAttack) {
          const glow = ctx.createRadialGradient(pos.x, pos.y, nodeRadius, pos.x, pos.y, nodeRadius * 2.5);
          glow.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.fillRect(pos.x - nodeRadius * 3, pos.y - nodeRadius * 3, nodeRadius * 6, nodeRadius * 6);
        } else if (isDefending) {
          const glow = ctx.createRadialGradient(pos.x, pos.y, nodeRadius, pos.x, pos.y, nodeRadius * 2);
          glow.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.fillRect(pos.x - nodeRadius * 3, pos.y - nodeRadius * 3, nodeRadius * 6, nodeRadius * 6);
        }

        // Node circle background
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isUnderAttack
          ? 'rgba(239, 68, 68, 0.15)'
          : isDefending
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(15, 23, 42, 0.7)';
        ctx.fill();

        // Node border
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isUnderAttack
          ? 'rgba(239, 68, 68, 0.5)'
          : isDefending
            ? 'rgba(16, 185, 129, 0.4)'
            : 'rgba(228, 228, 231, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Icon
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.icon, pos.x, pos.y);

        // Label
        ctx.font = '600 9px Inter, system-ui';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.fillText(n.label, pos.x, pos.y + nodeRadius + 12);
      });

      // Health bar at bottom
      const barW = w * 0.4;
      const barH = 6;
      const barX = (w - barW) / 2;
      const barY = h - 18;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(barX, barY, barW, barH);

      const healthFraction = Math.max(0, Math.min(1, hp / 100));
      const healthColor = hp > 70 ? 'rgba(16, 185, 129, 0.7)' : hp > 40 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(239, 68, 68, 0.7)';
      ctx.fillStyle = healthColor;
      ctx.fillRect(barX, barY, barW * healthFraction, barH);

      ctx.font = '600 8px Inter, system-ui';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(`System Health: ${hp.toFixed(0)}%`, w / 2, barY - 6);

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="network-graph-container">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div className="network-graph-legend">
        <span><span className="legend-dot" style={{ background: '#22d3ee' }} /> Normal</span>
        <span><span className="legend-dot" style={{ background: '#ef4444' }} /> Attack</span>
        <span><span className="legend-dot" style={{ background: '#10b981' }} /> Defending</span>
      </div>
    </div>
  );
}
