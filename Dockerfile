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

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install backend dependencies first (to utilize Docker cache)
COPY pyproject.toml ./
# Create a dummy app directory so pip install . can resolve dependencies
RUN mkdir app && touch app/__init__.py && pip install --no-cache-dir .

# Copy the actual backend code
COPY app/ ./app

# Re-install to ensure the real app package is linked (fast as dependencies are cached)
RUN pip install --no-cache-dir .

# Copy built frontend from previous stage
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

# Expose the port FastAPI runs on
EXPOSE 8000

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
