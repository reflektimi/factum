#!/bin/sh

echo "🚀 Starting Factum deployment..."

# Generate application key if not set
if [ -z "$APP_KEY" ]; then
    echo "📝 Generating application key..."
    php artisan key:generate --force
fi

# Clear and cache config
echo "⚙️  Caching configuration..."
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
echo "🗄️  Running database migrations..."
php artisan migrate --force --no-interaction

# Create storage link
echo "🔗 Creating storage symlink..."
php artisan storage:link || true

# Clear all caches to ensure fresh start
echo "🧹 Clearing caches..."
php artisan cache:clear
php artisan view:clear

echo "✅ Deployment complete! Starting server..."

# Start Laravel development server on port 8080 (Render default)
php artisan serve --host=0.0.0.0 --port=8080
