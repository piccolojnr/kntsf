#!/usr/bin/env sh
set -eu

mkdir -p \
    /app/storage/app/public \
    /app/storage/framework/cache \
    /app/storage/framework/sessions \
    /app/storage/framework/views \
    /app/storage/logs \
    /app/bootstrap/cache

chown -R www-data:www-data /app/storage /app/bootstrap/cache 2>/dev/null || true

if [ ! -L /app/public/storage ]; then
    rm -rf /app/public/storage
    ln -s /app/storage/app/public /app/public/storage
fi

if [ "${DB_CONNECTION:-}" = "sqlite" ] && [ -n "${DB_DATABASE:-}" ] && [ "${DB_DATABASE}" != ":memory:" ]; then
    mkdir -p "$(dirname "${DB_DATABASE}")"
    touch "${DB_DATABASE}"
fi

exec "$@"
