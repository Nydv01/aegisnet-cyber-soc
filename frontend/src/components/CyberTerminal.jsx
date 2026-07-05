import React, { useEffect, useState, useRef } from 'react';

/**
 * CyberTerminal component displays a typing terminal console.
 * It synthesizes and appends security command scripts, log checks, and WAF drops
 * based on simulator changes.
 */
export default function CyberTerminal({ telemetry, events }) {
  const [terminalLines, setTerminalLines] = useState([
    { text: 'AEGISNET v1.0.0 SECURE CORE INITIALIZED...', type: 'success' },
    { text: 'SYSTEM SCAN: OK | NO ACTIVE EXPLOITS DETECTED.', type: 'info' },
    { text: 'Awaiting network streams...', type: 'dim' },
  ]);
  const consoleEndRef = useRef(null);

  useEffect(() => {
    if (!telemetry) return;

    const newLines = [];
    const timestamp = new Date().toLocaleTimeString();

    // Check if attack type changed
    if (telemetry.attack_type !== 'none') {
      newLines.push({
        text: `[${timestamp}] ! SECURITY EXPLOIT ALERT: ${telemetry.attack_type.toUpperCase()} VECTOR INITIALIZED`,
        type: 'danger',
      });
      newLines.push({
        text: `[${timestamp}] # sudo tcpdump -nnvvXSs 1514 -i eth0 proto 254 | grep -i "${telemetry.attack_type}"`,
        type: 'command',
      });
      newLines.push({
        text: `[${timestamp}] analyzing packets: load rate = ${telemetry.packets_per_second} pps...`,
        type: 'info',
      });
    }

    // Check if agent blocked IP
    if (telemetry.agent_status === 'active' && telemetry.agent_last_action !== 'idle') {
      newLines.push({
        text: `[${timestamp}] * AGENT INITIATING POLICY: ${telemetry.agent_last_action.toUpperCase()}`,
        type: 'warning',
      });
      if (telemetry.agent_last_action === 'block_ip') {
        newLines.push({
          text: `[${timestamp}] # sudo iptables -A INPUT -p tcp --dport 80 -m limit --limit 25/s -j ACCEPT`,
          type: 'command',
        });
        newLines.push({
          text: `[${timestamp}] mitigation successful: drop rule propagated to edge firewall routers`,
          type: 'success',
        });
      } else if (telemetry.agent_last_action === 'rate_limit') {
        newLines.push({
          text: `[${timestamp}] # sudo tc qdisc add dev eth0 root tbf rate 10mbit latency 50ms burst 1540`,
          type: 'command',
        });
        newLines.push({
          text: `[${timestamp}] rate limit applied: server bandwidth throttled to normal thresholds`,
          type: 'success',
        });
      }
    }

    if (newLines.length > 0) {
      setTerminalLines((prev) => [...prev.slice(-30), ...newLines]);
    }
  }, [telemetry]);

  // Monitor events stream for alert logs
  useEffect(() => {
    if (!events || events.length === 0) return;
    const latest = events[0];
    if (latest.event_type === 'attack') {
      const timestamp = new Date(latest.timestamp).toLocaleTimeString();
      setTerminalLines((prev) => [
        ...prev.slice(-30),
        { text: `[${timestamp}] ALERT LOG RECORDED: ${latest.message}`, type: 'danger' },
      ]);
    }
  }, [events]);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLines]);

  return (
    <div className="terminal-card">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <span className="terminal-title">aegis-net@soc-console:~</span>
      </div>
      <div className="terminal-body">
        {terminalLines.map((line, idx) => (
          <div key={idx} className={`terminal-line type-${line.type}`}>
            {line.type === 'command' && <span className="prompt">$ </span>}
            {line.text}
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
}
