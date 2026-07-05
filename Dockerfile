# ─── Backend ───
FROM python:3.11-slim as backend
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
RUN python -m scripts.train_models
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# ─── Frontend Build ───
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json .
RUN npm ci
COPY frontend/ .
RUN npm run build

# ─── Production ───
FROM python:3.11-slim as production
WORKDIR /app

# Install backend deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY backend/ backend/
COPY --from=frontend-build /app/frontend/dist frontend/dist

# Copy trained models if available
COPY backend/models/ backend/models/ 2>/dev/null || true

EXPOSE 8000
ENV PYTHONPATH=/app

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
