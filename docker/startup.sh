#!/bin/sh

export DB_CONNECTION=pgsql
export APP_ENV=production
export APP_URL=${APP_URL:-https://finances-api-sgea.onrender.com}

echo "🚀 Starting Factum API deployment..."

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

# Run database migrations
echo "🗄️ Running database migrations..."

if [ "$RUN_SEEDER" = "true" ]; then
    echo "🌱 Fresh migrate + seed (FIRST DEPLOY ONLY)"
php artisan migrate:fresh --seed --force
else
    echo "📊 Running migrations..."
    php artisan migrate --force
fi

# Remove existing storage symlink if it exists, then create a new one
echo "🔗 Creating storage symlink..."
if [ -L "public/storage" ] || [ -e "public/storage" ]; then
    rm -rf public/storage
fi
php artisan storage:link

# Clear all caches to ensure fresh start
echo "🧹 Clearing caches..."
php artisan cache:clear

# Set debug mode for initial troubleshooting
export APP_DEBUG=true
export LOG_LEVEL=debug

echo "✅ Deployment complete! Starting API server..."

php artisan serve --host=0.0.0.0 --port=$PORT
