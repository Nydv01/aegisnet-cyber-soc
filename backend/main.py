"""
AegisNet - FastAPI Main Application
=====================================
Central web server with REST endpoints, WebSocket telemetry streaming,
JWT authentication, and CORS middleware.

Skills Showcased:
- FastAPI (modern async Python web framework)
- WebSocket real-time streaming
- JWT Token Authentication (python-jose)
- CORS Middleware
- Pydantic Request/Response Models
- Dependency Injection (FastAPI Depends)
- OpenAPI/Swagger auto-documentation
- RESTful API design patterns
- Background tasks (asyncio)
"""

import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    Depends,
    status,
    Query,
    BackgroundTasks,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from backend.core.database import (
    init_db,
    get_db,
    SecurityEvent as SecurityEventDB,
    URLScanResult,
    AgentAction,
    UserSession,
)
from backend.core.simulator import NetworkSimulator, NetworkEvent
from backend.core.ml_engine import MLEngine


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SECRET_KEY = os.getenv("AEGISNET_SECRET_KEY", "aegisnet-super-secret-key-2024-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


# ---------------------------------------------------------------------------
# Pydantic Models (Request/Response Schemas)
# ---------------------------------------------------------------------------

class AttackRequest(BaseModel):
    """Request to launch a simulated attack."""
    attack_type: str = Field(..., description="Type: ddos, port_scan, brute_force, sql_injection")
    intensity: float = Field(0.7, ge=0.1, le=1.0, description="Attack intensity (0.1-1.0)")


class URLScanRequest(BaseModel):
    """Request to scan a URL for phishing."""
    url: str = Field(..., description="URL to analyze", min_length=3)


class AgentControlRequest(BaseModel):
    """Request to toggle the defense agent."""
    enabled: bool = Field(..., description="Enable or disable the AI agent")


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    username: str
    expires_in: int


class AttackResponse(BaseModel):
    """Response after launching an attack."""
    status: str
    attack_type: Optional[str] = None
    attack_name: Optional[str] = None
    intensity: Optional[float] = None
    threat_level: Optional[str] = None
    error: Optional[str] = None


class PhishingResponse(BaseModel):
    """Response from phishing URL scan."""
    url: str
    is_phishing: bool
    label: str
    confidence: float
    threat_score: float
    feature_analysis: dict


class SystemStatusResponse(BaseModel):
    """System overview response."""
    status: str
    uptime_seconds: float
    models_loaded: bool
    agent_status: str
    active_attack: Optional[str]
    system_health: float
    total_events: int
    blocked_ips: int


class UserRegisterRequest(BaseModel):
    """Registration credentials schema."""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=50)


class BlockIPRequest(BaseModel):
    """Firewall IP block schema."""
    ip_address: str = Field(..., description="IP to add to the firewall blocklist")


# ---------------------------------------------------------------------------
# Application Setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AegisNet API",
    description=(
        "AI-Powered Autonomous Threat Detection & Incident Response Platform. "
        "Features real-time network monitoring, ML-based intrusion detection, "
        "phishing URL classification, and autonomous Q-learning defense agent."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS - Allow frontend (any localhost port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
simulator = NetworkSimulator()
start_time = datetime.now()
connected_clients: List[WebSocket] = []


# ---------------------------------------------------------------------------
# Authentication Helpers
# ---------------------------------------------------------------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    """Optional auth - returns username or None."""
    if token is None:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        return username
    except JWTError:
        return None


# ---------------------------------------------------------------------------
# Startup & Shutdown Events
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup_event():
    """Initialize database, load ML models, and start simulation loop."""
    init_db()
    simulator.load_agent()

    # Start background simulation
    asyncio.create_task(simulation_loop())
    print("[AegisNet] Server started successfully!")


async def simulation_loop():
    """Background loop that ticks the simulator and broadcasts telemetry."""
    while True:
        simulator.tick()

        # Broadcast telemetry to all connected WebSocket clients
        telemetry = simulator.get_telemetry()
        disconnected = []
        for client in connected_clients:
            try:
                await client.send_json({
                    "type": "telemetry",
                    "data": telemetry,
                })
            except Exception:
                disconnected.append(client)

        for client in disconnected:
            connected_clients.remove(client)

        await asyncio.sleep(1)  # Tick every 1 second


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/auth/login", response_model=TokenResponse, tags=["Authentication"])
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(UserSession).filter_by(username=form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": user.username})
    return TokenResponse(
        access_token=access_token,
        username=user.username,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@app.post("/api/auth/register", tags=["Authentication"])
async def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(UserSession).filter_by(username=request.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    new_user = UserSession(
        username=request.username,
        hashed_password=pwd_context.hash(request.password),
    )
    db.add(new_user)
    db.commit()
    return {"status": "success", "message": "Account created successfully"}


# ---------------------------------------------------------------------------
# System Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/status", response_model=SystemStatusResponse, tags=["System"])
async def get_system_status():
    """Get current system status overview."""
    ml = MLEngine.get_instance()
    uptime = (datetime.now() - start_time).total_seconds()

    return SystemStatusResponse(
        status="operational",
        uptime_seconds=round(uptime, 1),
        models_loaded=ml.is_loaded,
        agent_status="active" if simulator.agent_enabled else "inactive",
        active_attack=simulator.current_attack,
        system_health=round(simulator.system_health, 1),
        total_events=len(simulator.events),
        blocked_ips=len(simulator.blocked_ips),
    )


@app.get("/api/telemetry", tags=["System"])
async def get_telemetry():
    """Get current telemetry snapshot (REST alternative to WebSocket)."""
    return simulator.get_telemetry()


@app.post("/api/block-ip", tags=["System"])
async def block_ip(request: BlockIPRequest):
    """Manually add an IP address to the firewall blocklist."""
    if request.ip_address not in simulator.blocked_ips:
        simulator.blocked_ips.append(request.ip_address)
        simulator.firewall_rules += 1
        
        # Log defense event
        event = NetworkEvent(
            timestamp=datetime.now().isoformat(),
            event_id=simulator._generate_event_id(),
            severity="info",
            event_type="defense",
            source_ip="SYSTEM-ADMIN",
            destination_ip=request.ip_address,
            message=f"Manual firewall drop rule applied to IP {request.ip_address}",
            details={"blocked_ip": request.ip_address},
        )
        simulator._add_event(event)
        
        return {"status": "success", "message": f"IP {request.ip_address} blocked successfully"}
    return {"status": "info", "message": f"IP {request.ip_address} is already blocked"}


# ---------------------------------------------------------------------------
# Attack Simulation Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/simulate-attack", response_model=AttackResponse, tags=["Simulation"])
async def simulate_attack(request: AttackRequest):
    """Launch a simulated network attack."""
    result = simulator.launch_attack(request.attack_type, request.intensity)
    return AttackResponse(**result)


@app.post("/api/stop-attack", tags=["Simulation"])
async def stop_attack():
    """Stop any currently active attack."""
    return simulator.stop_attack()


# ---------------------------------------------------------------------------
# ML Prediction Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/scan-url", response_model=PhishingResponse, tags=["ML Predictions"])
async def scan_url(request: URLScanRequest, db: Session = Depends(get_db)):
    """Scan a URL for phishing using the ML classifier."""
    ml = MLEngine.get_instance()
    if not ml.is_loaded:
        raise HTTPException(status_code=503, detail="ML models not loaded. Run training first.")

    result = ml.predict_phishing(request.url)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    # Persist scan result
    scan_record = URLScanResult(
        url=request.url,
        is_phishing=result["is_phishing"],
        confidence=result["confidence"],
        threat_score=result["threat_score"],
        features_json=json.dumps(result["feature_analysis"]),
    )
    db.add(scan_record)
    db.commit()

    return PhishingResponse(**result)


@app.get("/api/scan-history", tags=["ML Predictions"])
async def get_scan_history(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    """Get history of URL scans."""
    scans = db.query(URLScanResult).order_by(URLScanResult.id.desc()).limit(limit).all()
    return [
        {
            "id": s.id,
            "timestamp": s.timestamp.isoformat() if s.timestamp else None,
            "url": s.url,
            "is_phishing": s.is_phishing,
            "confidence": s.confidence,
            "threat_score": s.threat_score,
        }
        for s in scans
    ]


# ---------------------------------------------------------------------------
# Defense Agent Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/agent-control", tags=["Defense Agent"])
async def agent_control(request: AgentControlRequest):
    """Enable or disable the autonomous defense agent."""
    return simulator.toggle_agent(request.enabled)


@app.get("/api/agent-status", tags=["Defense Agent"])
async def agent_status():
    """Get current defense agent status and Q-values."""
    state = simulator.env._encode_state()
    q_values = {}
    if simulator.agent:
        q_values = simulator.agent.get_q_values_for_state(state)

    return {
        "enabled": simulator.agent_enabled,
        "last_action": simulator.agent_last_action,
        "current_state": state,
        "q_values": q_values,
        "blocked_ips_count": len(simulator.blocked_ips),
        "firewall_rules": simulator.firewall_rules,
    }


# ---------------------------------------------------------------------------
# Event Log Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/logs", tags=["Logs"])
async def get_logs(
    limit: int = Query(50, ge=1, le=200),
    severity: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
):
    """Get filtered security event logs."""
    return simulator.get_events(limit=limit, severity=severity, event_type=event_type)


# ---------------------------------------------------------------------------
# WebSocket Endpoint
# ---------------------------------------------------------------------------

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """
    Real-time telemetry WebSocket.
    Broadcasts system metrics, alerts, and agent actions every second.
    """
    await websocket.accept()
    connected_clients.append(websocket)
    print(f"[WebSocket] Client connected. Total: {len(connected_clients)}")

    try:
        while True:
            # Listen for client messages (e.g., ping or commands)
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30)
                msg = json.loads(data)

                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif msg.get("type") == "get_events":
                    events = simulator.get_events(limit=msg.get("limit", 20))
                    await websocket.send_json({"type": "events", "data": events})

            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({"type": "heartbeat"})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[WebSocket] Error: {e}")
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
        print(f"[WebSocket] Client disconnected. Total: {len(connected_clients)}")


# ---------------------------------------------------------------------------
# Metrics Endpoint (for showcasing model training results)
# ---------------------------------------------------------------------------

@app.get("/api/metrics", tags=["ML Predictions"])
async def get_training_metrics():
    """Get the training metrics from the last model training run."""
    metrics_path = os.path.join(
        os.path.dirname(__file__), "metrics", "training_report.json"
    )
    try:
        with open(metrics_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="No training metrics found. Run training first.")
