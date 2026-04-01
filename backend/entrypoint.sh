#!/bin/bash
set -e

echo "Ensuring media directories exist..."
mkdir -p /app/media/avatars /app/media/covers /app/media/work_samples /app/media/thumbnails

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

echo "Starting Daphne (ASGI) server..."
exec daphne -b 0.0.0.0 -p 8000 core.asgi:application
