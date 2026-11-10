# syntax=docker/dockerfile:1

FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install runtime dependencies from pinned requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir --timeout=300 --retries=10 -r requirements.txt

# Copy application source (secrets excluded via .dockerignore)
COPY . .

# Non-root user for runtime
RUN useradd --create-home --shell /usr/sbin/nologin appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
