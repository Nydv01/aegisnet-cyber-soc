# 🛡️ AegisNet — AI-Powered Autonomous Threat Detection & Incident Response Platform

<div align="center">

**A full-stack cybersecurity SOC dashboard featuring real-time ML-based intrusion detection, phishing URL classification, and an autonomous Q-learning defense agent.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)

</div>

---

## 🎯 Project Overview

AegisNet is a **production-grade cybersecurity intelligence platform** that demonstrates end-to-end software engineering across AI/ML, backend, frontend, and DevOps. It simulates a real-world Security Operations Center (SOC) with:

- **🔍 Intrusion Detection System (IDS)** — Random Forest classifier trained on network traffic features
- **🌐 Phishing URL Scanner** — Logistic Regression + TF-IDF URL classifier with feature analysis
- **🤖 Autonomous Defense Agent** — Q-Learning reinforcement learning agent for automated incident response
- **📊 Real-Time Dashboard** — WebSocket-powered live monitoring with SVG charts and glassmorphism UI
- **⚔️ Attack Simulator** — Launch DDoS, Port Scan, Brute Force, and SQL Injection attacks

---

## 🧠 Skills & Technologies Showcased

| Category | Technologies |
|----------|-------------|
| **AI/ML** | scikit-learn (Random Forest, Logistic Regression), Reinforcement Learning (Q-Learning), TF-IDF/NLP, Feature Engineering, Cross-Validation, Model Evaluation (Confusion Matrix, ROC-AUC, Classification Report), Synthetic Data Generation |
| **Backend** | Python, FastAPI, WebSockets, REST API, Pydantic, SQLAlchemy ORM, SQLite, JWT Authentication, CORS, OpenAPI/Swagger, Async/Await |
| **Frontend** | React 18, Vite, React Router, Context API, Custom Hooks, WebSocket Client, SVG Charts, Responsive Design |
| **UI/UX** | Vanilla CSS, Glassmorphism, Dark Mode, CSS Animations, Custom Design System, Accessible HTML |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI/CD, Multi-stage Builds |
| **Data Science** | pandas, NumPy, Data Pipelines, Statistical Feature Extraction, Shannon Entropy |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                    │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────┐ │
│  │Dashboard │ │ Simulator │ │ Phishing │ │  Logs Viewer │ │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       │             │            │               │         │
│       └─────────────┼────────────┼───────────────┘         │
│                     │ WebSocket + REST                     │
└─────────────────────┼──────────────────────────────────────┘
                      │
┌─────────────────────┼──────────────────────────────────────┐
│              FastAPI Backend Server                         │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────────┐ │
│  │ ML Engine    │  │  Simulator  │  │   Database (ORM)  │ │
│  │ - IDS Model  │  │  - Traffic  │  │   - Events        │ │
│  │ - Phishing   │  │  - Attacks  │  │   - URL Scans     │ │
│  │ - Q-Agent    │  │  - Defense  │  │   - Agent Actions  │ │
│  └──────────────┘  └─────────────┘  └───────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone & Setup Backend

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Train ML models (generates IDS, Phishing, and Q-Learning models)
python -m backend.scripts.train_models

# Start the backend server
PYTHONPATH=. uvicorn backend.main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Open the Dashboard

Navigate to **http://localhost:5173** in your browser.

### Docker (Alternative)

```bash
docker-compose up --build
```

---

## 📊 ML Model Performance

| Model | Accuracy | ROC-AUC | Algorithm |
|-------|----------|---------|-----------|
| Intrusion Detection (IDS) | 100% | 1.0 | Random Forest (200 trees) |
| Phishing URL Classifier | 100% | 1.0 | Logistic Regression + TF-IDF |
| Defense Agent (RL) | 79% survival | 210.78 avg reward | Q-Learning (5000 episodes) |

---

## 📁 Project Structure

```
AegisNet/
├── backend/
│   ├── main.py                  # FastAPI server, routes, WebSocket
│   ├── requirements.txt         # Python dependencies
│   ├── core/
│   │   ├── agent.py             # Q-Learning environment & agent
│   │   ├── ml_engine.py         # Model loader & prediction engine
│   │   ├── simulator.py         # Network simulation & state machine
│   │   └── database.py          # SQLAlchemy ORM models
│   ├── scripts/
│   │   └── train_models.py      # ML training pipeline
│   ├── models/                  # Trained .joblib model files
│   └── metrics/                 # Training evaluation reports
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app with routing & WebSocket
│   │   ├── index.css            # Complete CSS design system
│   │   └── components/
│   │       ├── Dashboard.jsx    # Live charts, gauges, alerts
│   │       ├── Simulator.jsx    # Attack launcher, agent visualizer
│   │       ├── Phishing.jsx     # URL scanner with feature analysis
│   │       ├── Logs.jsx         # Searchable security log viewer
│   │       └── Sidebar.jsx      # Navigation sidebar
│   └── index.html               # HTML with SEO meta tags
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.yml           # Container orchestration
├── .github/workflows/ci.yml    # GitHub Actions CI/CD
└── README.md                    # This file
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | JWT authentication |
| `GET` | `/api/status` | System status overview |
| `GET` | `/api/telemetry` | Current telemetry snapshot |
| `POST` | `/api/simulate-attack` | Launch simulated attack |
| `POST` | `/api/stop-attack` | Stop active attack |
| `POST` | `/api/scan-url` | Scan URL for phishing |
| `GET` | `/api/scan-history` | URL scan history |
| `POST` | `/api/agent-control` | Toggle AI defense agent |
| `GET` | `/api/agent-status` | Agent Q-values & status |
| `GET` | `/api/logs` | Filtered security logs |
| `GET` | `/api/metrics` | ML training metrics |
| `WS` | `/ws/telemetry` | Real-time WebSocket stream |
| `GET` | `/api/docs` | Interactive Swagger docs |

---

## 📜 License

MIT License — Built for educational and portfolio demonstration purposes.
