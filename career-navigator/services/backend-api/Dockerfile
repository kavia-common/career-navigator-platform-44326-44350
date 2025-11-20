# Simple Dockerfile for FastAPI backend
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for psycopg2
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy minimal requirements inline to avoid separate file for this step
# PUBLIC_INTERFACE
# If you maintain a separate requirements.txt later, adjust this section accordingly.
RUN pip install --no-cache-dir fastapi==0.115.5 uvicorn[standard]==0.32.0 sqlalchemy==2.0.36 psycopg2-binary==2.9.10 pydantic==2.9.2

COPY src /app/src

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
