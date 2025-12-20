#!/bin/sh

# Update site configuration
echo "Updating configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
echo "Running migrations..."
php artisan migrate --force

# Start Nginx in background
nginx

# Start PHP-FPM
php-fpm
