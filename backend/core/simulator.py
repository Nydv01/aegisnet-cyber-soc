"""
AegisNet - Network Simulator
==============================
Real-time network traffic simulator that generates events, feeds data
to ML models, manages system state, and coordinates the defense agent.

Skills Showcased:
- Asynchronous Python (asyncio)
- State machine pattern
- Event-driven architecture
- Real-time data streaming
"""

import asyncio
import time
import random
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, field, asdict

from backend.core.ml_engine import MLEngine
from backend.core.agent import (
    NetworkDefenseEnv,
    QLearningAgent,
    ACTIONS,
    ATTACK_TYPES,
    THREAT_LEVELS,
)


# ---------------------------------------------------------------------------
# Data Classes
# ---------------------------------------------------------------------------

@dataclass
class NetworkEvent:
    """Represents a single network event/log entry."""
    timestamp: str
    event_id: str
    severity: str  # info, warning, critical, alert
    event_type: str  # traffic, attack, defense, system
    source_ip: str
    destination_ip: str
    message: str
    details: Dict = field(default_factory=dict)


@dataclass
class SystemTelemetry:
    """Real-time system telemetry data."""
    timestamp: str
    cpu_usage: float
    ram_usage: float
    network_load: float
    bandwidth_in: float
    bandwidth_out: float
    active_connections: int
    packets_per_second: int
    latency_ms: float
    system_health: float
    threat_level: str
    attack_type: str
    firewall_rules_active: int
    blocked_ips: int
    alerts_count: int
    agent_status: str
    agent_last_action: str


# ---------------------------------------------------------------------------
# Network Simulator
# ---------------------------------------------------------------------------

class NetworkSimulator:
    """
    Manages the simulated network environment, generates traffic events,
    runs ML predictions on incoming packets, and coordinates the
    autonomous defense agent.
    """

    def __init__(self):
        self.ml_engine = MLEngine.get_instance()

        # System state
        self.system_health = 100.0
        self.cpu_usage = 15.0
        self.ram_usage = 35.0
        self.network_load = 10.0
        self.bandwidth_in = 50.0
        self.bandwidth_out = 30.0
        self.active_connections = 120
        self.packets_per_second = 1500
        self.latency_ms = 12.0

        # Attack state
        self.current_attack: Optional[str] = None
        self.attack_intensity = 0.0
        self.threat_level = "safe"

        # Defense state
        self.agent_enabled = False
        self.agent: Optional[QLearningAgent] = None
        self.env = NetworkDefenseEnv()
        self.agent_state = 0
        self.agent_last_action = "idle"
        self.firewall_rules = 5
        self.blocked_ips: List[str] = []

        # Event log
        self.events: List[Dict] = []
        self.max_events = 500

        # Subscribers for real-time updates
        self._subscribers: List[Callable] = []
        self._running = False
        self._event_counter = 0

    def load_agent(self):
        """Load the pre-trained Q-learning agent."""
        import os
        agent_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), "models", "defense_agent.json"
        )
        try:
            self.agent = QLearningAgent.load(agent_path)
            print("[Simulator] Defense agent loaded successfully.")
        except FileNotFoundError:
            print("[Simulator] Warning: Defense agent not found. Train models first.")

    def subscribe(self, callback: Callable):
        """Register a callback for telemetry updates."""
        self._subscribers.append(callback)

    def unsubscribe(self, callback: Callable):
        """Remove a telemetry callback."""
        if callback in self._subscribers:
            self._subscribers.remove(callback)

    def _generate_event_id(self) -> str:
        self._event_counter += 1
        return f"EVT-{self._event_counter:06d}"

    def _random_ip(self, internal: bool = False) -> str:
        if internal:
            return f"10.0.{random.randint(1, 254)}.{random.randint(1, 254)}"
        return f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"

    def _add_event(self, event: NetworkEvent):
        event_dict = asdict(event)
        self.events.insert(0, event_dict)
        if len(self.events) > self.max_events:
            self.events = self.events[:self.max_events]

    def launch_attack(self, attack_type: str, intensity: float = 0.7) -> Dict:
        """
        Launch a simulated attack.
        Returns confirmation with attack details.
        """
        valid_attacks = ["ddos", "port_scan", "brute_force", "sql_injection"]
        if attack_type not in valid_attacks:
            return {"error": f"Invalid attack type. Choose from: {valid_attacks}"}

        self.current_attack = attack_type
        self.attack_intensity = min(1.0, max(0.1, intensity))

        attack_names = {
            "ddos": "Distributed Denial of Service",
            "port_scan": "Network Port Scan",
            "brute_force": "SSH Brute Force",
            "sql_injection": "SQL Injection",
        }

        # Update environment state
        attack_idx = ATTACK_TYPES.index(attack_type)
        self.env.attack_type = attack_idx
        self.env.threat_level = min(4, int(intensity * 4) + 1)
        self.threat_level = THREAT_LEVELS[self.env.threat_level]

        # Generate attack event
        src_ip = self._random_ip(internal=False)
        event = NetworkEvent(
            timestamp=datetime.now().isoformat(),
            event_id=self._generate_event_id(),
            severity="critical",
            event_type="attack",
            source_ip=src_ip,
            destination_ip=self._random_ip(internal=True),
            message=f"🚨 {attack_names[attack_type]} attack detected from {src_ip}",
            details={
                "attack_type": attack_type,
                "intensity": self.attack_intensity,
                "threat_level": self.threat_level,
            },
        )
        self._add_event(event)

        return {
            "status": "attack_launched",
            "attack_type": attack_type,
            "attack_name": attack_names[attack_type],
            "intensity": self.attack_intensity,
            "threat_level": self.threat_level,
        }

    def stop_attack(self) -> Dict:
        """Stop any currently active attack."""
        if self.current_attack is None:
            return {"status": "no_active_attack"}

        prev = self.current_attack
        self.current_attack = None
        self.attack_intensity = 0.0
        self.env.attack_type = 0
        self.env.threat_level = 0
        self.threat_level = "safe"

        event = NetworkEvent(
            timestamp=datetime.now().isoformat(),
            event_id=self._generate_event_id(),
            severity="info",
            event_type="system",
            source_ip="SYSTEM",
            destination_ip="SYSTEM",
            message=f"✅ {prev.upper()} attack has been neutralized",
            details={"previous_attack": prev},
        )
        self._add_event(event)

        return {"status": "attack_stopped", "previous_attack": prev}

    def toggle_agent(self, enabled: bool) -> Dict:
        """Enable or disable the autonomous defense agent."""
        self.agent_enabled = enabled
        if enabled and self.agent is None:
            self.load_agent()

        status = "enabled" if enabled else "disabled"
        event = NetworkEvent(
            timestamp=datetime.now().isoformat(),
            event_id=self._generate_event_id(),
            severity="info",
            event_type="defense",
            source_ip="AEGIS-AGENT",
            destination_ip="SYSTEM",
            message=f"🤖 AI Defense Agent {status.upper()}",
            details={"agent_status": status},
        )
        self._add_event(event)

        return {"status": status, "agent_loaded": self.agent is not None}

    def _simulate_normal_traffic(self):
        """Simulate normal background traffic fluctuations."""
        self.cpu_usage = max(5, min(95, self.cpu_usage + random.uniform(-3, 3)))
        self.ram_usage = max(20, min(85, self.ram_usage + random.uniform(-2, 2)))
        self.network_load = max(5, min(90, self.network_load + random.uniform(-5, 5)))
        self.bandwidth_in = max(10, min(500, self.bandwidth_in + random.uniform(-20, 20)))
        self.bandwidth_out = max(5, min(300, self.bandwidth_out + random.uniform(-15, 15)))
        self.active_connections = max(50, min(2000, self.active_connections + random.randint(-20, 20)))
        self.packets_per_second = max(500, min(10000, self.packets_per_second + random.randint(-200, 200)))
        self.latency_ms = max(1, min(200, self.latency_ms + random.uniform(-3, 3)))

    def _simulate_attack_effects(self):
        """Apply attack effects to system metrics."""
        if self.current_attack is None:
            return

        intensity = self.attack_intensity

        if self.current_attack == "ddos":
            self.cpu_usage = min(98, self.cpu_usage + intensity * 15)
            self.network_load = min(99, self.network_load + intensity * 20)
            self.bandwidth_in = min(2000, self.bandwidth_in + intensity * 300)
            self.packets_per_second = min(50000, self.packets_per_second + int(intensity * 5000))
            self.latency_ms = min(2000, self.latency_ms + intensity * 50)
            self.active_connections = min(10000, self.active_connections + int(intensity * 500))
        elif self.current_attack == "port_scan":
            self.network_load = min(80, self.network_load + intensity * 10)
            self.active_connections = min(5000, self.active_connections + int(intensity * 200))
            self.packets_per_second = min(20000, self.packets_per_second + int(intensity * 2000))
        elif self.current_attack == "brute_force":
            self.cpu_usage = min(90, self.cpu_usage + intensity * 8)
            self.latency_ms = min(500, self.latency_ms + intensity * 20)
        elif self.current_attack == "sql_injection":
            self.cpu_usage = min(85, self.cpu_usage + intensity * 5)
            self.ram_usage = min(90, self.ram_usage + intensity * 10)
            self.latency_ms = min(800, self.latency_ms + intensity * 30)

        self.system_health = max(0, self.system_health - intensity * random.uniform(1, 3))
        self.env.system_health = self.system_health

    def _run_defense_agent_step(self):
        """Execute one step of the defense agent if enabled."""
        if not self.agent_enabled or self.agent is None:
            return

        state = self.env._encode_state()
        action = self.agent.choose_action_greedy(state)
        action_name = ACTIONS[action]
        self.agent_last_action = action_name

        # Apply defense effects
        if action_name != "do_nothing" and self.current_attack:
            # Agent takes action
            if action_name == "block_ip":
                blocked_ip = self._random_ip(internal=False)
                self.blocked_ips.append(blocked_ip)
                self.firewall_rules += 1
                self.attack_intensity = max(0, self.attack_intensity - 0.15)
                self.system_health = min(100, self.system_health + 3)
                msg = f"🛡️ Blocked malicious IP: {blocked_ip}"
            elif action_name == "rate_limit":
                self.network_load = max(10, self.network_load - 15)
                self.packets_per_second = max(1000, self.packets_per_second - 2000)
                self.attack_intensity = max(0, self.attack_intensity - 0.1)
                msg = "🛡️ Rate limiting applied to suspicious traffic"
            elif action_name == "deploy_honeypot":
                self.attack_intensity = max(0, self.attack_intensity - 0.2)
                msg = "🍯 Honeypot deployed to redirect attacker"
            elif action_name == "patch_vulnerability":
                self.system_health = min(100, self.system_health + 10)
                self.attack_intensity = max(0, self.attack_intensity - 0.25)
                msg = "🔧 Vulnerability patched - attack surface reduced"
            elif action_name == "isolate_segment":
                self.network_load = max(10, self.network_load - 20)
                self.system_health = min(100, self.system_health + 5)
                msg = "🔒 Network segment isolated to contain threat"
            elif action_name == "escalate_alert":
                msg = "⚠️ Alert escalated to SOC Level 2 analysts"
            else:
                msg = f"🤖 Agent action: {action_name}"

            # Check if attack is mitigated
            if self.attack_intensity <= 0.05:
                self.stop_attack()
                msg += " | Attack fully mitigated!"

            event = NetworkEvent(
                timestamp=datetime.now().isoformat(),
                event_id=self._generate_event_id(),
                severity="warning",
                event_type="defense",
                source_ip="AEGIS-AGENT",
                destination_ip="SYSTEM",
                message=msg,
                details={
                    "action": action_name,
                    "q_values": self.agent.get_q_values_for_state(state),
                    "attack_intensity_remaining": round(self.attack_intensity, 2),
                },
            )
            self._add_event(event)

    def _run_ids_prediction(self):
        """Run IDS model on simulated traffic packet."""
        if not self.ml_engine.is_loaded:
            return

        # Generate simulated packet features based on current state
        if self.current_attack:
            # Generate attack-like features
            attack_profiles = {
                "ddos": {
                    "packet_size": random.uniform(30, 100),
                    "packet_rate": random.uniform(3000, 8000),
                    "flow_duration": random.uniform(0.5, 3),
                    "protocol_type": random.choice([0, 2]),
                    "flag_count": random.randint(10, 25),
                    "serror_rate": random.uniform(0.6, 1.0),
                    "rerror_rate": random.uniform(0.3, 0.9),
                    "same_srv_rate": random.uniform(0.0, 0.3),
                    "count": random.uniform(300, 800),
                    "srv_count": random.uniform(250, 600),
                },
                "port_scan": {
                    "packet_size": random.uniform(20, 60),
                    "packet_rate": random.uniform(500, 1200),
                    "flow_duration": random.uniform(0.1, 1),
                    "protocol_type": random.choice([0, 1]),
                    "flag_count": random.randint(5, 15),
                    "serror_rate": random.uniform(0.4, 0.9),
                    "rerror_rate": random.uniform(0.5, 1.0),
                    "same_srv_rate": random.uniform(0.0, 0.2),
                    "count": random.uniform(200, 500),
                    "srv_count": random.uniform(3, 10),
                },
                "brute_force": {
                    "packet_size": random.uniform(150, 300),
                    "packet_rate": random.uniform(100, 250),
                    "flow_duration": random.uniform(5, 20),
                    "protocol_type": 0,
                    "flag_count": random.randint(3, 8),
                    "num_failed_logins": random.randint(10, 50),
                    "serror_rate": random.uniform(0.1, 0.5),
                    "rerror_rate": random.uniform(0.2, 0.6),
                    "same_srv_rate": random.uniform(0.5, 0.9),
                    "count": random.uniform(60, 180),
                    "srv_count": random.uniform(50, 120),
                },
                "sql_injection": {
                    "packet_size": random.uniform(500, 1500),
                    "packet_rate": random.uniform(15, 50),
                    "flow_duration": random.uniform(10, 40),
                    "protocol_type": 0,
                    "flag_count": random.randint(1, 5),
                    "hot_indicators": random.randint(5, 15),
                    "num_compromised": random.randint(1, 5),
                    "src_bytes": random.uniform(800, 2000),
                    "dst_bytes": random.uniform(500, 1500),
                    "count": random.uniform(5, 20),
                    "srv_count": random.uniform(3, 15),
                },
            }
            features = attack_profiles.get(self.current_attack, {})
            # Fill missing with defaults
            defaults = {
                "packet_size": 512, "packet_rate": 50, "flow_duration": 30,
                "protocol_type": 0, "flag_count": 2, "src_bytes": 500,
                "dst_bytes": 400, "wrong_fragment": 0, "urgent_count": 0,
                "hot_indicators": 0, "num_failed_logins": 0, "num_compromised": 0,
                "num_root": 0, "num_file_creations": 0, "num_access_files": 0,
                "count": 20, "srv_count": 15, "serror_rate": 0.02,
                "rerror_rate": 0.02, "same_srv_rate": 0.9,
            }
            for k, v in defaults.items():
                features.setdefault(k, v)
        else:
            # Normal traffic
            features = {
                "packet_size": random.uniform(300, 700),
                "packet_rate": random.uniform(30, 80),
                "flow_duration": random.uniform(15, 45),
                "protocol_type": random.choice([0, 1, 2]),
                "flag_count": random.randint(0, 4),
                "src_bytes": random.uniform(300, 700),
                "dst_bytes": random.uniform(200, 600),
                "wrong_fragment": 0,
                "urgent_count": 0,
                "hot_indicators": random.randint(0, 2),
                "num_failed_logins": 0,
                "num_compromised": 0,
                "num_root": 0,
                "num_file_creations": random.randint(0, 3),
                "num_access_files": random.randint(0, 4),
                "count": random.uniform(10, 40),
                "srv_count": random.uniform(8, 25),
                "serror_rate": random.uniform(0, 0.05),
                "rerror_rate": random.uniform(0, 0.05),
                "same_srv_rate": random.uniform(0.75, 1.0),
            }

        result = self.ml_engine.predict_intrusion(features)

        if result.get("prediction") and result["prediction"] != "normal":
            event = NetworkEvent(
                timestamp=datetime.now().isoformat(),
                event_id=self._generate_event_id(),
                severity="alert" if result["confidence"] > 0.8 else "warning",
                event_type="attack",
                source_ip=self._random_ip(internal=False),
                destination_ip=self._random_ip(internal=True),
                message=f"🔍 IDS Alert: {result['prediction'].upper()} detected (confidence: {result['confidence']:.1%})",
                details=result,
            )
            self._add_event(event)

    def get_telemetry(self) -> Dict:
        """Get current system telemetry snapshot."""
        return asdict(SystemTelemetry(
            timestamp=datetime.now().isoformat(),
            cpu_usage=round(self.cpu_usage, 1),
            ram_usage=round(self.ram_usage, 1),
            network_load=round(self.network_load, 1),
            bandwidth_in=round(self.bandwidth_in, 1),
            bandwidth_out=round(self.bandwidth_out, 1),
            active_connections=self.active_connections,
            packets_per_second=self.packets_per_second,
            latency_ms=round(self.latency_ms, 1),
            system_health=round(self.system_health, 1),
            threat_level=self.threat_level,
            attack_type=self.current_attack or "none",
            firewall_rules_active=self.firewall_rules,
            blocked_ips=len(self.blocked_ips),
            alerts_count=sum(1 for e in self.events if e.get("severity") in ("alert", "critical")),
            agent_status="active" if self.agent_enabled else "inactive",
            agent_last_action=self.agent_last_action,
        ))

    def get_events(self, limit: int = 50, severity: Optional[str] = None, event_type: Optional[str] = None) -> List[Dict]:
        """Get filtered event logs."""
        events = self.events
        if severity:
            events = [e for e in events if e.get("severity") == severity]
        if event_type:
            events = [e for e in events if e.get("event_type") == event_type]
        return events[:limit]

    def tick(self):
        """Advance the simulation by one step. Called periodically."""
        self._simulate_normal_traffic()
        self._simulate_attack_effects()
        self._run_defense_agent_step()

        # Run IDS prediction periodically (every ~3 ticks to avoid spam)
        if self._event_counter % 3 == 0:
            self._run_ids_prediction()

        # Natural recovery when no attack
        if self.current_attack is None:
            self.system_health = min(100, self.system_health + 0.5)
            self.latency_ms = max(8, self.latency_ms - 1)
            self.network_load = max(10, self.network_load - 1)
