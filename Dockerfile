# --- Phase 1: Build Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /build/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Build frontend
COPY frontend/ ./
RUN npm run build

# --- Phase 2: Python Runtime ---
FROM python:3.11-slim
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install backend dependencies first
COPY pyproject.toml ./
RUN mkdir app && touch app/__init__.py && uv pip install --system --no-cache .

# Copy backend code and scripts
COPY app/ ./app
COPY tools/ ./tools
COPY entrypoint.sh ./

# Create necessary directories
RUN mkdir -p data wisdom && chmod +x entrypoint.sh

# Copy built frontend from previous stage
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

# Expose the port FastAPI runs on
EXPOSE 8000

# Use the entrypoint script to start both watcher and app
CMD ["./entrypoint.sh"]
