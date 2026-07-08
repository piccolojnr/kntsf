# syntax=docker/dockerfile:1.7

FROM composer:2 AS vendor

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install exif gd \
    && rm -rf /var/lib/apt/lists/*

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --no-scripts \
    --no-autoloader

COPY app app
COPY bootstrap bootstrap
COPY config config
COPY database database
COPY routes routes
COPY artisan composer.json composer.lock ./

RUN rm -f bootstrap/cache/*.php \
    && composer dump-autoload --optimize --no-dev

FROM node:25-alpine AS assets

WORKDIR /app

RUN apk add --no-cache \
    php84 \
    php84-ctype \
    php84-curl \
    php84-dom \
    php84-fileinfo \
    php84-gd \
    php84-mbstring \
    php84-openssl \
    php84-pdo \
    php84-pdo_sqlite \
    php84-phar \
    php84-session \
    php84-tokenizer \
    php84-xml \
    php84-xmlwriter \
    php84-zip \
    && ln -s /usr/bin/php84 /usr/local/bin/php

RUN npm install -g pnpm@10.26.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile

COPY app app
COPY bootstrap bootstrap
COPY components.json components.json
COPY config config
COPY composer.json composer.json
COPY database database
COPY public public
COPY resources resources
COPY routes routes
COPY tsconfig.json tsconfig.json
COPY vite.config.ts vite.config.ts
COPY artisan artisan
COPY --from=vendor /app/vendor vendor

RUN rm -f bootstrap/cache/*.php \
    && mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && touch database/database.sqlite \
    && php artisan wayfinder:generate --with-form --ansi

RUN pnpm run build

FROM dunglas/frankenphp:1-php8.4 AS runtime

WORKDIR /app

RUN install-php-extensions \
    bcmath \
    exif \
    gd \
    intl \
    opcache \
    pcntl \
    pdo_mysql \
    pdo_pgsql \
    pdo_sqlite \
    redis \
    zip

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY docker/entrypoint.sh /usr/local/bin/kntsf-entrypoint
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-kntsf.ini

COPY --from=vendor /app/vendor vendor
COPY app app
COPY artisan artisan
COPY bootstrap bootstrap
COPY composer.json composer.json
COPY composer.lock composer.lock
COPY config config
COPY database database
COPY public public
COPY resources resources
COPY routes routes
COPY storage storage
COPY --from=assets /app/public/build public/build

RUN rm -f bootstrap/cache/*.php \
    && chmod +x /usr/local/bin/kntsf-entrypoint \
    && mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data /app/storage /app/bootstrap/cache

EXPOSE 8000

ENTRYPOINT ["kntsf-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
