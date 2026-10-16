#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ -f .env ]; then
  echo '.env already exists; keeping your local settings.'
  exit 0
fi
command -v openssl >/dev/null 2>&1 || { echo 'OpenSSL is required to generate local passwords.' >&2; exit 1; }
umask 077
cp .env.example .env
for key in POSTGRES_PASSWORD REDIS_PASSWORD RABBITMQ_PASSWORD; do
  secret=$(openssl rand -hex 24)
  sed "s/^${key}=.*/${key}=${secret}/" .env > .env.tmp
  mv .env.tmp .env
done
echo 'Created .env with random local passwords. Start with: docker compose up -d --build --wait'
