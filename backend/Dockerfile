# Backend CAKRA-DECOY 2.0 — FastAPI. Jalan di ARM64 maupun x86.
FROM python:3.11-slim-bookworm

WORKDIR /app

# Install deps dulu (layer cache) lalu kode.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
# DEMO_EMITTER di-set lewat compose/.env, bukan di-hardcode di sini.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
