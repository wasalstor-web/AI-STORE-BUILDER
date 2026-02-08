FROM python:3.12-slim

WORKDIR /app

# System deps
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Install UV (100x faster than pip)
RUN pip install --no-cache-dir uv

# Copy dependency file
COPY pyproject.toml .

# Install Python deps
RUN uv pip install --system --no-cache -r pyproject.toml

# Copy app code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
