"""
AegisNet - Reinforcement Learning Defense Agent
================================================
Implements a custom Q-Learning agent that operates inside a simulated
network defense environment. The agent observes threat conditions
and selects defensive actions to maintain system integrity.

Skills Showcased:
- Reinforcement Learning (Q-Learning with epsilon-greedy exploration)
- Custom OpenAI-Gym-style environment design
- NumPy vectorized operations
- State discretization & action-value mapping
"""

import numpy as np
import json
import os
from typing import Tuple, Dict, List, Optional


# ---------------------------------------------------------------------------
# Action & State Definitions
# ---------------------------------------------------------------------------

ACTIONS = [
    "do_nothing",
    "block_ip",
    "rate_limit",
    "deploy_honeypot",
    "patch_vulnerability",
    "isolate_segment",
    "escalate_alert",
]

ATTACK_TYPES = ["none", "ddos", "port_scan", "brute_force", "sql_injection"]

THREAT_LEVELS = ["safe", "low", "medium", "high", "critical"]


# ---------------------------------------------------------------------------
# Network Defense Environment
# ---------------------------------------------------------------------------

class NetworkDefenseEnv:
    """
    Simulated network environment for training the Q-learning defense agent.

    State space (discretized):
        - threat_level:  0-4  (safe → critical)
        - attack_type:   0-4  (none, ddos, port_scan, brute_force, sql_injection)
        - system_health:  0-4  (critical → healthy, bucketed from 0-100)
        - server_load:   0-2  (low, medium, high)

    Total states: 5 × 5 × 5 × 3 = 375

    Action space: 7 discrete actions (see ACTIONS list)
    """

    def __init__(self):
        self.n_threat_levels = 5
        self.n_attack_types = 5
        self.n_health_levels = 5
        self.n_load_levels = 3
        self.n_states = (
            self.n_threat_levels
            * self.n_attack_types
            * self.n_health_levels
            * self.n_load_levels
        )
        self.n_actions = len(ACTIONS)

        # Continuous internal state
        self.threat_level = 0
        self.attack_type = 0
        self.system_health = 100.0
        self.server_load = 0.0

        self.steps = 0
        self.max_steps = 200

    def _encode_state(self) -> int:
        """Encode continuous state into a single integer index."""
        tl = self.threat_level
        at = self.attack_type
        sh = min(4, int(self.system_health / 25.0))
        sl = min(2, int(self.server_load / 34.0))
        return (
            tl * (self.n_attack_types * self.n_health_levels * self.n_load_levels)
            + at * (self.n_health_levels * self.n_load_levels)
            + sh * self.n_load_levels
            + sl
        )

    def reset(self) -> int:
        """Reset the environment to a random initial state."""
        self.threat_level = 0
        self.attack_type = 0
        self.system_health = 100.0
        self.server_load = np.random.uniform(10, 30)
        self.steps = 0
        return self._encode_state()

    def step(self, action: int) -> Tuple[int, float, bool, dict]:
        """
        Execute an action and advance the simulation by one timestep.

        Returns: (next_state, reward, done, info)
        """
        self.steps += 1
        reward = 0.0

        # --- Random attack injection ---
        if self.attack_type == 0 and np.random.random() < 0.15:
            self.attack_type = np.random.randint(1, self.n_attack_types)
            self.threat_level = np.random.randint(2, self.n_threat_levels)

        # --- Apply attack damage if under attack ---
        if self.attack_type > 0:
            damage = (self.threat_level + 1) * np.random.uniform(2, 6)
            self.system_health = max(0, self.system_health - damage)
            self.server_load = min(100, self.server_load + np.random.uniform(5, 15))

        # --- Evaluate agent action effectiveness ---
        action_name = ACTIONS[action]

        if action_name == "do_nothing":
            if self.attack_type == 0:
                reward += 1.0  # Correct: no action when safe
            else:
                reward -= 3.0  # Penalty: ignoring an attack

        elif action_name == "block_ip":
            if self.attack_type in [1, 3]:  # effective vs DDoS & brute_force
                self.threat_level = max(0, self.threat_level - 2)
                self.attack_type = 0 if np.random.random() < 0.7 else self.attack_type
                self.system_health = min(100, self.system_health + 10)
                reward += 5.0
            elif self.attack_type == 0:
                reward -= 2.0  # False positive action
            else:
                reward += 1.0  # Partial help

        elif action_name == "rate_limit":
            if self.attack_type == 1:  # best vs DDoS
                self.server_load = max(0, self.server_load - 25)
                self.threat_level = max(0, self.threat_level - 1)
                reward += 4.0
            elif self.attack_type > 0:
                self.server_load = max(0, self.server_load - 10)
                reward += 1.5
            else:
                reward -= 1.0

        elif action_name == "deploy_honeypot":
            if self.attack_type in [2, 4]:  # port_scan & sql_injection
                self.threat_level = max(0, self.threat_level - 1)
                self.attack_type = 0 if np.random.random() < 0.5 else self.attack_type
                reward += 4.5
            elif self.attack_type > 0:
                reward += 1.0
            else:
                reward -= 0.5

        elif action_name == "patch_vulnerability":
            if self.attack_type == 4:  # sql_injection
                self.attack_type = 0
                self.threat_level = 0
                self.system_health = min(100, self.system_health + 20)
                reward += 6.0
            elif self.attack_type > 0:
                self.system_health = min(100, self.system_health + 5)
                reward += 1.0
            else:
                reward += 0.5  # Proactive maintenance

        elif action_name == "isolate_segment":
            if self.attack_type > 0 and self.threat_level >= 3:
                self.server_load = max(0, self.server_load - 20)
                self.system_health = min(100, self.system_health + 15)
                self.threat_level = max(0, self.threat_level - 2)
                reward += 5.0
            elif self.attack_type > 0:
                reward += 1.0
            else:
                reward -= 2.0  # Unnecessary isolation

        elif action_name == "escalate_alert":
            if self.threat_level >= 3:
                reward += 3.0
                self.threat_level = max(0, self.threat_level - 1)
            elif self.attack_type > 0:
                reward += 1.0
            else:
                reward -= 1.5  # False alarm

        # --- Natural recovery ---
        if self.attack_type == 0:
            self.system_health = min(100, self.system_health + 2)
            self.server_load = max(0, self.server_load - 3)
            self.threat_level = max(0, self.threat_level - 1)

        # --- Terminal conditions ---
        done = False
        if self.system_health <= 0:
            reward -= 10.0
            done = True
        if self.steps >= self.max_steps:
            done = True
            if self.system_health > 70:
                reward += 5.0  # Survival bonus

        info = {
            "action": action_name,
            "threat_level": THREAT_LEVELS[self.threat_level],
            "attack_type": ATTACK_TYPES[self.attack_type],
            "system_health": round(self.system_health, 1),
            "server_load": round(self.server_load, 1),
        }

        return self._encode_state(), reward, done, info


# ---------------------------------------------------------------------------
# Q-Learning Agent
# ---------------------------------------------------------------------------

class QLearningAgent:
    """
    Tabular Q-Learning agent with epsilon-greedy exploration.

    Hyperparameters are tuned for the NetworkDefenseEnv.
    """

    def __init__(
        self,
        n_states: int,
        n_actions: int,
        learning_rate: float = 0.1,
        discount_factor: float = 0.95,
        epsilon: float = 1.0,
        epsilon_decay: float = 0.9995,
        epsilon_min: float = 0.05,
    ):
        self.n_states = n_states
        self.n_actions = n_actions
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min

        # Q-Table: state × action
        self.q_table = np.zeros((n_states, n_actions))

        # Training metrics
        self.episode_rewards: List[float] = []
        self.episode_lengths: List[int] = []

    def choose_action(self, state: int) -> int:
        """Epsilon-greedy action selection."""
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        return int(np.argmax(self.q_table[state]))

    def choose_action_greedy(self, state: int) -> int:
        """Greedy action selection (for inference)."""
        return int(np.argmax(self.q_table[state]))

    def update(
        self, state: int, action: int, reward: float, next_state: int, done: bool
    ):
        """Bellman update for Q-value."""
        best_next = np.max(self.q_table[next_state]) if not done else 0.0
        td_target = reward + self.gamma * best_next
        td_error = td_target - self.q_table[state, action]
        self.q_table[state, action] += self.lr * td_error

    def decay_epsilon(self):
        """Decay exploration rate."""
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

    def train(self, env: NetworkDefenseEnv, episodes: int = 5000) -> Dict:
        """
        Train the agent on the environment for a given number of episodes.

        Returns a dictionary of training metrics.
        """
        print(f"  Training Q-Learning Agent for {episodes} episodes...")

        for ep in range(episodes):
            state = env.reset()
            total_reward = 0.0
            steps = 0

            while True:
                action = self.choose_action(state)
                next_state, reward, done, info = env.step(action)
                self.update(state, action, reward, next_state, done)
                state = next_state
                total_reward += reward
                steps += 1

                if done:
                    break

            self.decay_epsilon()
            self.episode_rewards.append(total_reward)
            self.episode_lengths.append(steps)

            if (ep + 1) % 1000 == 0:
                avg_reward = np.mean(self.episode_rewards[-100:])
                print(
                    f"    Episode {ep + 1}/{episodes} | "
                    f"Avg Reward (last 100): {avg_reward:.2f} | "
                    f"Epsilon: {self.epsilon:.4f}"
                )

        return {
            "total_episodes": episodes,
            "final_epsilon": round(self.epsilon, 4),
            "avg_reward_last_100": round(float(np.mean(self.episode_rewards[-100:])), 2),
            "avg_length_last_100": round(float(np.mean(self.episode_lengths[-100:])), 1),
            "q_table_nonzero": int(np.count_nonzero(self.q_table)),
            "q_table_shape": list(self.q_table.shape),
        }

    def get_q_values_for_state(self, state: int) -> Dict[str, float]:
        """Return human-readable Q-values for a given state."""
        return {
            ACTIONS[i]: round(float(self.q_table[state, i]), 3)
            for i in range(self.n_actions)
        }

    def save(self, filepath: str):
        """Save Q-table and metadata to disk."""
        data = {
            "q_table": self.q_table.tolist(),
            "epsilon": self.epsilon,
            "episode_rewards": self.episode_rewards,
            "episode_lengths": self.episode_lengths,
            "n_states": self.n_states,
            "n_actions": self.n_actions,
        }
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            json.dump(data, f)

    @classmethod
    def load(cls, filepath: str) -> "QLearningAgent":
        """Load a pre-trained agent from disk."""
        with open(filepath, "r") as f:
            data = json.load(f)
        agent = cls(data["n_states"], data["n_actions"])
        agent.q_table = np.array(data["q_table"])
        agent.epsilon = data.get("epsilon", 0.05)
        agent.episode_rewards = data.get("episode_rewards", [])
        agent.episode_lengths = data.get("episode_lengths", [])
        return agent
