FROM php:8.3-cli

RUN apt-get update \
 && apt-get install -y --no-install-recommends git unzip curl libicu-dev libssl-dev \
 && docker-php-ext-install intl pcntl \
 && pecl install mongodb \
 && docker-php-ext-enable mongodb \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Les dépendances sont installées dans l'image (pas de volume qui écrase vendor/)
COPY composer.json ./
RUN composer install --no-interaction --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize \
 && mkdir -p var config/jwt \
 && chmod +x bin/console

ENV PHP_CLI_SERVER_WORKERS=4
EXPOSE 8000
