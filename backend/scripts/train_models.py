"""
AegisNet - Model Training Pipeline
====================================
Generates synthetic cybersecurity datasets, trains scikit-learn classifiers,
and trains a Q-learning reinforcement learning defense agent.

Skills Showcased:
- Synthetic data generation (numpy, pandas)
- scikit-learn Pipeline: StandardScaler, RandomForestClassifier, LogisticRegression
- TF-IDF Vectorization for URL token analysis (NLP)
- Cross-Validation (StratifiedKFold)
- Model Evaluation: Confusion Matrix, Classification Report, ROC-AUC
- Feature Engineering (hand-crafted + statistical features)
- Model Serialization (joblib)
- Reinforcement Learning training loop

Usage:
    cd "aegisnet-cyber-soc"
    python -m backend.scripts.train_models
"""

import os
import sys
import json
import string
import random
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    accuracy_score,
)
from sklearn.feature_extraction.text import TfidfVectorizer

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from backend.core.agent import NetworkDefenseEnv, QLearningAgent
from backend.core.ml_engine import extract_url_features


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
METRICS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "metrics")
RANDOM_SEED = 42

np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)


# ===========================================================================
# PART 1: Intrusion Detection System (IDS) Model
# ===========================================================================

def generate_ids_dataset(n_samples: int = 10000) -> pd.DataFrame:
    """
    Generate a synthetic network traffic dataset with realistic feature
    distributions for four attack categories + normal traffic.

    Features are inspired by the NSL-KDD dataset structure.
    """
    print("\n[1/6] Generating IDS training data...")

    classes = ["normal", "ddos", "port_scan", "brute_force", "sql_injection"]
    samples_per_class = n_samples // len(classes)
    records = []

    for cls in classes:
        for _ in range(samples_per_class):
            if cls == "normal":
                record = {
                    "packet_size": np.random.normal(512, 150),
                    "packet_rate": np.random.normal(50, 20),
                    "flow_duration": np.random.normal(30, 15),
                    "protocol_type": np.random.choice([0, 1, 2], p=[0.5, 0.3, 0.2]),
                    "flag_count": np.random.poisson(2),
                    "src_bytes": np.random.normal(500, 200),
                    "dst_bytes": np.random.normal(400, 180),
                    "wrong_fragment": np.random.poisson(0.1),
                    "urgent_count": 0,
                    "hot_indicators": np.random.poisson(0.5),
                    "num_failed_logins": 0,
                    "num_compromised": 0,
                    "num_root": 0,
                    "num_file_creations": np.random.poisson(1),
                    "num_access_files": np.random.poisson(2),
                    "count": np.random.normal(20, 10),
                    "srv_count": np.random.normal(15, 8),
                    "serror_rate": np.random.uniform(0, 0.05),
                    "rerror_rate": np.random.uniform(0, 0.05),
                    "same_srv_rate": np.random.uniform(0.8, 1.0),
                }
            elif cls == "ddos":
                record = {
                    "packet_size": np.random.normal(64, 30),
                    "packet_rate": np.random.normal(5000, 2000),
                    "flow_duration": np.random.normal(2, 1),
                    "protocol_type": np.random.choice([0, 1, 2], p=[0.1, 0.1, 0.8]),
                    "flag_count": np.random.poisson(15),
                    "src_bytes": np.random.normal(50, 30),
                    "dst_bytes": np.random.normal(20, 15),
                    "wrong_fragment": np.random.poisson(2),
                    "urgent_count": np.random.poisson(1),
                    "hot_indicators": np.random.poisson(5),
                    "num_failed_logins": 0,
                    "num_compromised": 0,
                    "num_root": 0,
                    "num_file_creations": 0,
                    "num_access_files": 0,
                    "count": np.random.normal(500, 200),
                    "srv_count": np.random.normal(400, 150),
                    "serror_rate": np.random.uniform(0.7, 1.0),
                    "rerror_rate": np.random.uniform(0.3, 0.8),
                    "same_srv_rate": np.random.uniform(0.0, 0.3),
                }
            elif cls == "port_scan":
                record = {
                    "packet_size": np.random.normal(40, 10),
                    "packet_rate": np.random.normal(800, 300),
                    "flow_duration": np.random.normal(0.5, 0.3),
                    "protocol_type": np.random.choice([0, 1, 2], p=[0.3, 0.5, 0.2]),
                    "flag_count": np.random.poisson(8),
                    "src_bytes": np.random.normal(30, 15),
                    "dst_bytes": np.random.normal(0, 5),
                    "wrong_fragment": np.random.poisson(0.5),
                    "urgent_count": 0,
                    "hot_indicators": np.random.poisson(3),
                    "num_failed_logins": 0,
                    "num_compromised": 0,
                    "num_root": 0,
                    "num_file_creations": 0,
                    "num_access_files": np.random.poisson(10),
                    "count": np.random.normal(300, 100),
                    "srv_count": np.random.normal(5, 3),
                    "serror_rate": np.random.uniform(0.5, 0.9),
                    "rerror_rate": np.random.uniform(0.6, 1.0),
                    "same_srv_rate": np.random.uniform(0.0, 0.15),
                }
            elif cls == "brute_force":
                record = {
                    "packet_size": np.random.normal(200, 80),
                    "packet_rate": np.random.normal(150, 60),
                    "flow_duration": np.random.normal(10, 5),
                    "protocol_type": np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1]),
                    "flag_count": np.random.poisson(5),
                    "src_bytes": np.random.normal(300, 100),
                    "dst_bytes": np.random.normal(100, 50),
                    "wrong_fragment": np.random.poisson(0.3),
                    "urgent_count": 0,
                    "hot_indicators": np.random.poisson(2),
                    "num_failed_logins": np.random.poisson(20),
                    "num_compromised": np.random.poisson(0.5),
                    "num_root": 0,
                    "num_file_creations": 0,
                    "num_access_files": np.random.poisson(1),
                    "count": np.random.normal(100, 40),
                    "srv_count": np.random.normal(80, 30),
                    "serror_rate": np.random.uniform(0.1, 0.4),
                    "rerror_rate": np.random.uniform(0.3, 0.7),
                    "same_srv_rate": np.random.uniform(0.6, 0.9),
                }
            else:  # sql_injection
                record = {
                    "packet_size": np.random.normal(800, 300),
                    "packet_rate": np.random.normal(30, 15),
                    "flow_duration": np.random.normal(20, 10),
                    "protocol_type": np.random.choice([0, 1, 2], p=[0.8, 0.15, 0.05]),
                    "flag_count": np.random.poisson(3),
                    "src_bytes": np.random.normal(1200, 500),
                    "dst_bytes": np.random.normal(800, 400),
                    "wrong_fragment": np.random.poisson(0.2),
                    "urgent_count": np.random.poisson(0.5),
                    "hot_indicators": np.random.poisson(8),
                    "num_failed_logins": np.random.poisson(3),
                    "num_compromised": np.random.poisson(2),
                    "num_root": np.random.poisson(1),
                    "num_file_creations": np.random.poisson(3),
                    "num_access_files": np.random.poisson(5),
                    "count": np.random.normal(10, 5),
                    "srv_count": np.random.normal(8, 4),
                    "serror_rate": np.random.uniform(0.0, 0.2),
                    "rerror_rate": np.random.uniform(0.0, 0.15),
                    "same_srv_rate": np.random.uniform(0.7, 1.0),
                }

            # Clip negative values
            record = {k: max(0, v) for k, v in record.items()}
            record["label"] = cls
            records.append(record)

    df = pd.DataFrame(records)
    df = df.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
    print(f"  Generated {len(df)} samples across {len(classes)} classes.")
    print(f"  Class distribution:\n{df['label'].value_counts().to_string()}")
    return df


def train_ids_model(df: pd.DataFrame) -> dict:
    """Train a Random Forest Classifier for network intrusion detection."""
    print("\n[2/6] Training IDS Model (Random Forest Classifier)...")

    feature_cols = [c for c in df.columns if c != "label"]
    X = df[feature_cols].values
    y = df["label"].values

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.2, random_state=RANDOM_SEED, stratify=y_encoded
    )

    # Train Random Forest with tuned hyperparameters
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features="sqrt",
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    # Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    cv_scores = cross_val_score(model, X_scaled, y_encoded, cv=cv, scoring="accuracy")

    # ROC-AUC (One-vs-Rest)
    try:
        roc_auc = roc_auc_score(y_test, y_proba, multi_class="ovr", average="weighted")
    except ValueError:
        roc_auc = 0.0

    conf_matrix = confusion_matrix(y_test, y_pred).tolist()
    class_report = classification_report(y_test, y_pred, target_names=le.classes_)

    print(f"  Test Accuracy: {accuracy:.4f}")
    print(f"  Cross-Val Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    print(f"  ROC-AUC (weighted): {roc_auc:.4f}")
    print(f"\n  Classification Report:\n{class_report}")

    # Feature importance
    importances = model.feature_importances_
    feature_importance = sorted(
        zip(feature_cols, importances), key=lambda x: x[1], reverse=True
    )
    print("  Top 5 Features:")
    for feat, imp in feature_importance[:5]:
        print(f"    {feat}: {imp:.4f}")

    # Save model artifacts
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODEL_DIR, "ids_model.joblib"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "ids_scaler.joblib"))
    joblib.dump(le, os.path.join(MODEL_DIR, "ids_label_encoder.joblib"))

    metrics = {
        "model": "RandomForestClassifier",
        "n_estimators": 200,
        "accuracy": round(accuracy, 4),
        "cv_accuracy_mean": round(cv_scores.mean(), 4),
        "cv_accuracy_std": round(cv_scores.std(), 4),
        "roc_auc_weighted": round(roc_auc, 4),
        "confusion_matrix": conf_matrix,
        "feature_importance": {f: round(float(i), 4) for f, i in feature_importance},
        "classes": le.classes_.tolist(),
    }
    return metrics


# ===========================================================================
# PART 2: Phishing URL Detection Model
# ===========================================================================

def generate_phishing_dataset(n_samples: int = 6000) -> pd.DataFrame:
    """
    Generate a synthetic URL dataset with realistic phishing and legitimate URLs.
    """
    print("\n[3/6] Generating Phishing URL training data...")

    legitimate_domains = [
        "google.com", "github.com", "stackoverflow.com", "microsoft.com",
        "amazon.com", "wikipedia.org", "youtube.com", "reddit.com",
        "linkedin.com", "twitter.com", "facebook.com", "apple.com",
        "netflix.com", "medium.com", "dropbox.com", "slack.com",
        "zoom.us", "adobe.com", "salesforce.com", "spotify.com",
    ]

    legitimate_paths = [
        "/home", "/about", "/contact", "/products", "/services",
        "/blog", "/news", "/docs", "/api", "/help", "/support",
        "/settings", "/profile", "/dashboard", "/search",
        "/features", "/pricing", "/terms", "/privacy",
    ]

    phishing_patterns = [
        "secure-login-{domain}.{tld}/{path}",
        "{domain}-verify.{tld}/account/{path}",
        "update-{domain}.{tld}/signin/{path}",
        "{domain}.{tld}.{random}.{tld2}/login",
        "{random}.{tld}/~{domain}/verify-account",
        "{ip}/{domain}/login.php",
        "{domain}-security.{tld}/auth/{path}?token={random}",
        "www.{random}-{domain}.{tld}/update/{path}",
        "{random}.{tld}/{domain}/secure-login.html",
        "mail.{random}.{tld}/signin/{domain}",
    ]

    tlds = ["com", "net", "org", "info", "biz", "xyz", "top", "club", "site"]
    random_words = [
        "secure", "verify", "update", "login", "account", "auth",
        "confirm", "restore", "unlock", "banking", "support", "service",
        "alert", "notification", "urgent", "immediate", "action",
    ]

    urls = []
    labels = []

    half = n_samples // 2

    # Generate legitimate URLs
    for _ in range(half):
        domain = random.choice(legitimate_domains)
        path = random.choice(legitimate_paths)
        scheme = random.choice(["https://", "https://www.", "http://"])
        params = ""
        if random.random() < 0.3:
            params = f"?q={random.choice(random_words)}&page={random.randint(1, 50)}"
        url = f"{scheme}{domain}{path}{params}"
        urls.append(url)
        labels.append(0)

    # Generate phishing URLs
    for _ in range(half):
        pattern = random.choice(phishing_patterns)
        domain = random.choice(legitimate_domains).split(".")[0]
        tld = random.choice(tlds)
        tld2 = random.choice(tlds)
        rand_str = "".join(random.choices(string.ascii_lowercase + string.digits, k=random.randint(5, 15)))
        ip = f"{random.randint(1,255)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(0,255)}"
        path = random.choice(["verify", "update", "secure", "confirm", "auth", "login"])

        url = pattern.format(
            domain=domain, tld=tld, tld2=tld2,
            random=rand_str, ip=ip, path=path,
        )
        if random.random() < 0.4:
            url = "http://" + url
        elif random.random() < 0.5:
            url = "https://" + url

        urls.append(url)
        labels.append(1)

    df = pd.DataFrame({"url": urls, "label": labels})
    df = df.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
    print(f"  Generated {len(df)} URL samples (Legit: {half}, Phishing: {half})")
    return df


def train_phishing_model(df: pd.DataFrame) -> dict:
    """Train a Logistic Regression + TF-IDF model for phishing URL detection."""
    print("\n[4/6] Training Phishing URL Classifier (Logistic Regression + TF-IDF)...")

    # Extract hand-crafted features
    hand_features = df["url"].apply(extract_url_features).apply(pd.Series)
    hand_feature_names = sorted(hand_features.columns.tolist())
    hand_features = hand_features[hand_feature_names]

    # TF-IDF on URL strings (character-level n-grams)
    tfidf = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        max_features=500,
        strip_accents="unicode",
    )
    tfidf_features = tfidf.fit_transform(df["url"]).toarray()

    # Scale hand-crafted features
    scaler = StandardScaler()
    hand_scaled = scaler.fit_transform(hand_features.values)

    # Combine all features
    X = np.hstack([hand_scaled, tfidf_features])
    y = df["label"].values

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )

    # Train Logistic Regression
    model = LogisticRegression(
        max_iter=1000,
        C=1.0,
        solver="lbfgs",
        random_state=RANDOM_SEED,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    # Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    cv_scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")

    try:
        roc_auc = roc_auc_score(y_test, y_proba[:, 1])
    except ValueError:
        roc_auc = 0.0

    conf_matrix = confusion_matrix(y_test, y_pred).tolist()
    class_report = classification_report(
        y_test, y_pred, target_names=["Legitimate", "Phishing"]
    )

    print(f"  Test Accuracy: {accuracy:.4f}")
    print(f"  Cross-Val Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    print(f"  ROC-AUC: {roc_auc:.4f}")
    print(f"\n  Classification Report:\n{class_report}")

    # Save model artifacts
    joblib.dump(model, os.path.join(MODEL_DIR, "phishing_model.joblib"))
    joblib.dump(tfidf, os.path.join(MODEL_DIR, "phishing_tfidf.joblib"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "phishing_scaler.joblib"))

    metrics = {
        "model": "LogisticRegression",
        "n_tfidf_features": 500,
        "n_hand_features": len(hand_feature_names),
        "total_features": X.shape[1],
        "accuracy": round(accuracy, 4),
        "cv_accuracy_mean": round(cv_scores.mean(), 4),
        "cv_accuracy_std": round(cv_scores.std(), 4),
        "roc_auc": round(roc_auc, 4),
        "confusion_matrix": conf_matrix,
    }
    return metrics


# ===========================================================================
# PART 3: Q-Learning Defense Agent
# ===========================================================================

def train_defense_agent() -> dict:
    """Train the Q-learning autonomous defense agent."""
    print("\n[5/6] Training Q-Learning Defense Agent...")

    env = NetworkDefenseEnv()
    agent = QLearningAgent(
        n_states=env.n_states,
        n_actions=env.n_actions,
        learning_rate=0.1,
        discount_factor=0.95,
        epsilon=1.0,
        epsilon_decay=0.9995,
        epsilon_min=0.05,
    )

    metrics = agent.train(env, episodes=5000)

    # Save agent
    agent_path = os.path.join(MODEL_DIR, "defense_agent.json")
    agent.save(agent_path)
    print(f"  Agent saved to {agent_path}")

    # Run a quick evaluation (greedy policy)
    print("\n  Running evaluation (100 episodes, greedy policy)...")
    eval_rewards = []
    eval_healths = []
    for _ in range(100):
        state = env.reset()
        total_reward = 0
        while True:
            action = agent.choose_action_greedy(state)
            state, reward, done, info = env.step(action)
            total_reward += reward
            if done:
                eval_healths.append(info["system_health"])
                break
        eval_rewards.append(total_reward)

    metrics["eval_avg_reward"] = round(float(np.mean(eval_rewards)), 2)
    metrics["eval_avg_health"] = round(float(np.mean(eval_healths)), 1)
    metrics["eval_survival_rate"] = round(
        float(np.mean([1 if h > 0 else 0 for h in eval_healths])), 2
    )

    print(f"  Eval Avg Reward: {metrics['eval_avg_reward']}")
    print(f"  Eval Avg Final Health: {metrics['eval_avg_health']}")
    print(f"  Eval Survival Rate: {metrics['eval_survival_rate']}")

    return metrics


# ===========================================================================
# MAIN TRAINING PIPELINE
# ===========================================================================

def main():
    print("=" * 70)
    print("  AegisNet - Model Training Pipeline")
    print(f"  Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(METRICS_DIR, exist_ok=True)

    all_metrics = {}

    # 1. Train IDS Model
    ids_df = generate_ids_dataset(n_samples=10000)
    all_metrics["ids"] = train_ids_model(ids_df)

    # 2. Train Phishing Model
    phishing_df = generate_phishing_dataset(n_samples=6000)
    all_metrics["phishing"] = train_phishing_model(phishing_df)

    # 3. Train Defense Agent
    all_metrics["defense_agent"] = train_defense_agent()

    # Save metrics report
    print("\n[6/6] Saving training metrics...")
    metrics_path = os.path.join(METRICS_DIR, "training_report.json")
    with open(metrics_path, "w") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"  Metrics saved to {metrics_path}")

    print("\n" + "=" * 70)
    print("  Training Complete!")
    print(f"  Models saved to: {MODEL_DIR}")
    print(f"  Metrics saved to: {METRICS_DIR}")
    print("=" * 70)

    # Print summary
    print("\n  === SUMMARY ===")
    print(f"  IDS Model Accuracy:        {all_metrics['ids']['accuracy']:.4f}")
    print(f"  IDS ROC-AUC:               {all_metrics['ids']['roc_auc_weighted']:.4f}")
    print(f"  Phishing Model Accuracy:   {all_metrics['phishing']['accuracy']:.4f}")
    print(f"  Phishing ROC-AUC:          {all_metrics['phishing']['roc_auc']:.4f}")
    print(f"  Agent Avg Eval Reward:     {all_metrics['defense_agent']['eval_avg_reward']}")
    print(f"  Agent Survival Rate:       {all_metrics['defense_agent']['eval_survival_rate']}")


if __name__ == "__main__":
    main()
