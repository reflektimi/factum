FROM dunglas/frankenphp:latest

# Install system dependencies & PHP extensions
RUN install-php-extensions \
    pdo_pgsql \
    pcntl \
    bcmath \
    gd \
    intl \
    zip \
    opcache \
    mbstring \
    redis

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Set environment variables for Octane
ENV OCTANE_SERVER=frankenphp
ENV SERVER_PORT=8000
ENV SERVER_HOST=0.0.0.0

# Install PHP dependencies (using --ignore-platform-reqs for dev PHP versions if needed)
RUN composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Create storage link
RUN php artisan storage:link || true

EXPOSE 8000

# Start Octane with FrankenPHP
CMD ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=8000"]
