#!/bin/bash

echo "🧹 Cleaning cache and optimizing..."

# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear

# Clear Vite cache
rm -rf node_modules/.vite
rm -rf public/build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

echo "✅ Optimization complete!"
echo "💡 RAM should be reduced after restarting services"
