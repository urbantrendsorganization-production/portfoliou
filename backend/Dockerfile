FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps for psycopg and Pillow
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libpq-dev gcc libjpeg62-turbo-dev zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files (uses whitenoise)
RUN SECRET_KEY=build-placeholder \
    DATABASE_URL=sqlite:///tmp/build.db \
    python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

# Entrypoint handles migrations + server start
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
