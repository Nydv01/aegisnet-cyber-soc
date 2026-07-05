"""
AegisNet - ML Engine
====================
Loads trained scikit-learn models and provides a unified prediction
interface for the FastAPI backend.

Skills Showcased:
- scikit-learn model loading (joblib)
- Feature engineering pipelines
- Prediction with confidence scores
- URL feature extraction (NLP/TF-IDF)
"""

import os
import re
import math
import joblib
import numpy as np
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")


# ---------------------------------------------------------------------------
# URL Feature Extraction
# ---------------------------------------------------------------------------

def extract_url_features(url: str) -> Dict[str, float]:
    """
    Extract hand-crafted lexical & structural features from a URL
    for phishing detection. These features complement the TF-IDF
    vectorization used during model training.

    Features:
        - url_length: Total length of the URL
        - hostname_length: Length of the hostname/domain
        - path_length: Length of the URL path
        - num_dots: Number of dots in the URL
        - num_hyphens: Number of hyphens in the URL
        - num_underscores: Number of underscores in the URL
        - num_slashes: Number of forward slashes
        - num_digits: Count of numeric digits
        - num_special_chars: Count of @, !, #, $, %, etc.
        - has_ip: Whether the URL contains an IP address
        - has_at_symbol: Whether URL contains '@'
        - has_double_slash_redirect: Contains '//' after protocol
        - is_https: Whether the URL uses HTTPS
        - subdomain_count: Number of subdomains
        - path_depth: Directory depth of the URL path
        - query_length: Length of the query string
        - has_suspicious_words: Contains words like 'login', 'verify', 'secure', etc.
        - entropy: Shannon entropy of the URL string
    """
    try:
        parsed = urlparse(url if "://" in url else f"http://{url}")
    except Exception:
        parsed = urlparse(f"http://{url}")

    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""

    # Shannon entropy
    def shannon_entropy(s: str) -> float:
        if not s:
            return 0.0
        freq = {}
        for c in s:
            freq[c] = freq.get(c, 0) + 1
        length = len(s)
        return -sum(
            (count / length) * math.log2(count / length)
            for count in freq.values()
        )

    # Check for IP address in hostname
    ip_pattern = re.compile(
        r"^(?:\d{1,3}\.){3}\d{1,3}$|"
        r"^0x[0-9a-fA-F]+$|"
        r"^\d+$"
    )
    has_ip = 1.0 if ip_pattern.match(hostname) else 0.0

    # Suspicious words commonly found in phishing URLs
    suspicious_words = [
        "login", "verify", "update", "secure", "account", "banking",
        "confirm", "password", "signin", "paypal", "ebay", "alert",
        "suspend", "restore", "unlock", "expire", "urgent",
    ]
    url_lower = url.lower()
    has_suspicious = 1.0 if any(w in url_lower for w in suspicious_words) else 0.0

    features = {
        "url_length": float(len(url)),
        "hostname_length": float(len(hostname)),
        "path_length": float(len(path)),
        "num_dots": float(url.count(".")),
        "num_hyphens": float(url.count("-")),
        "num_underscores": float(url.count("_")),
        "num_slashes": float(url.count("/")),
        "num_digits": float(sum(c.isdigit() for c in url)),
        "num_special_chars": float(sum(c in "@!#$%^&*~" for c in url)),
        "has_ip": has_ip,
        "has_at_symbol": 1.0 if "@" in url else 0.0,
        "has_double_slash_redirect": 1.0 if url.count("//") > 1 else 0.0,
        "is_https": 1.0 if parsed.scheme == "https" else 0.0,
        "subdomain_count": float(max(0, hostname.count(".") - 1)),
        "path_depth": float(path.count("/") - 1) if path else 0.0,
        "query_length": float(len(query)),
        "has_suspicious_words": has_suspicious,
        "entropy": round(shannon_entropy(url), 4),
    }
    return features


# ---------------------------------------------------------------------------
# ML Engine (Singleton Loader)
# ---------------------------------------------------------------------------

class MLEngine:
    """
    Loads and serves predictions from trained scikit-learn models.
    Implements a singleton pattern so models are loaded once on startup.
    """

    _instance: Optional["MLEngine"] = None

    def __init__(self):
        self.ids_model = None          # Intrusion Detection System model
        self.ids_scaler = None         # Feature scaler for IDS
        self.ids_label_encoder = None  # Label encoder for IDS classes
        self.phishing_model = None     # Phishing URL classifier
        self.phishing_tfidf = None     # TF-IDF vectorizer for URL tokens
        self.phishing_scaler = None    # Feature scaler for phishing
        self.is_loaded = False

    @classmethod
    def get_instance(cls) -> "MLEngine":
        if cls._instance is None:
            cls._instance = cls()
            cls._instance.load_models()
        return cls._instance

    def load_models(self):
        """Load all trained models from disk."""
        try:
            self.ids_model = joblib.load(os.path.join(MODEL_DIR, "ids_model.joblib"))
            self.ids_scaler = joblib.load(os.path.join(MODEL_DIR, "ids_scaler.joblib"))
            self.ids_label_encoder = joblib.load(
                os.path.join(MODEL_DIR, "ids_label_encoder.joblib")
            )
            self.phishing_model = joblib.load(
                os.path.join(MODEL_DIR, "phishing_model.joblib")
            )
            self.phishing_tfidf = joblib.load(
                os.path.join(MODEL_DIR, "phishing_tfidf.joblib")
            )
            self.phishing_scaler = joblib.load(
                os.path.join(MODEL_DIR, "phishing_scaler.joblib")
            )
            self.is_loaded = True
            print("[MLEngine] All models loaded successfully.")
        except FileNotFoundError as e:
            print(f"[MLEngine] Warning: Could not load models - {e}")
            print("[MLEngine] Run 'python -m backend.scripts.train_models' first.")
            self.is_loaded = False

    def predict_intrusion(self, features: Dict[str, float]) -> Dict:
        """
        Predict network traffic classification.

        Args:
            features: Dictionary with keys matching the IDS feature set.

        Returns:
            Dictionary with predicted class, confidence scores, and probabilities.
        """
        if not self.is_loaded or self.ids_model is None:
            return {"error": "IDS model not loaded"}

        feature_names = [
            "packet_size", "packet_rate", "flow_duration", "protocol_type",
            "flag_count", "src_bytes", "dst_bytes", "wrong_fragment",
            "urgent_count", "hot_indicators", "num_failed_logins",
            "num_compromised", "num_root", "num_file_creations",
            "num_access_files", "count", "srv_count", "serror_rate",
            "rerror_rate", "same_srv_rate",
        ]

        feature_vector = np.array(
            [[features.get(f, 0.0) for f in feature_names]]
        )
        feature_vector = self.ids_scaler.transform(feature_vector)

        prediction = self.ids_model.predict(feature_vector)[0]
        probabilities = self.ids_model.predict_proba(feature_vector)[0]
        class_label = self.ids_label_encoder.inverse_transform([prediction])[0]

        class_names = self.ids_label_encoder.classes_.tolist()
        prob_dict = {
            class_names[i]: round(float(probabilities[i]), 4)
            for i in range(len(class_names))
        }

        return {
            "prediction": class_label,
            "confidence": round(float(max(probabilities)), 4),
            "probabilities": prob_dict,
        }

    def predict_phishing(self, url: str) -> Dict:
        """
        Classify a URL as phishing or legitimate.

        Args:
            url: The URL string to classify.

        Returns:
            Dictionary with classification result, confidence, and feature analysis.
        """
        if not self.is_loaded or self.phishing_model is None:
            return {"error": "Phishing model not loaded"}

        # Extract hand-crafted features
        hand_features = extract_url_features(url)

        # TF-IDF features from URL tokens
        tfidf_vector = self.phishing_tfidf.transform([url]).toarray()

        # Combine features
        hand_feature_values = np.array(
            [[hand_features[k] for k in sorted(hand_features.keys())]]
        )
        hand_feature_values = self.phishing_scaler.transform(hand_feature_values)
        combined = np.hstack([hand_feature_values, tfidf_vector])

        prediction = self.phishing_model.predict(combined)[0]
        probabilities = self.phishing_model.predict_proba(combined)[0]

        is_phishing = bool(prediction == 1)
        confidence = round(float(probabilities[1] if is_phishing else probabilities[0]), 4)

        return {
            "url": url,
            "is_phishing": is_phishing,
            "label": "PHISHING" if is_phishing else "LEGITIMATE",
            "confidence": confidence,
            "threat_score": round(float(probabilities[1]), 4),
            "feature_analysis": hand_features,
        }
