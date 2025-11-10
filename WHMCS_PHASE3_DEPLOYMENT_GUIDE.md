# 🚀 WHMCS Phase 3 - Deployment Guide

## 📋 Prerequisites

- PHP 8.2+
- MySQL/PostgreSQL
- Composer
- Node.js & npm
- Git

---

## 🔧 Installation Steps

### 1. Pull Latest Code
```bash
git checkout whmcs
git pull origin whmcs
```

### 2. Install Dependencies
```bash
# Backend dependencies
composer install

# Frontend dependencies
npm install
```

### 3. Database Setup

#### Option A: Run Migrations (sau khi fix UrlGenerator error)
```bash
# Clear caches
php artisan optimize:clear
rm -rf bootstrap/cache/*.php

# Run migrations
php artisan migrate --force

# Seed initial data
php artisan db:seed --class=WhmcsPhase3Seeder
```

#### Option B: Import SQL Manually (nếu artisan vẫn lỗi)
```bash
# Export schema từ dev environment
mysqldump -u root -p aio > whmcs_phase3_schema.sql

# Import vào production
mysql -u username -p database_name < whmcs_phase3_schema.sql
```

### 4. Configure Environment

Edit `.env`:
```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aio
DB_USERNAME=root
DB_PASSWORD=your_password

# App
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# WHMCS Config
WHMCS_CURRENCY_DEFAULT=VND
WHMCS_TAX_ENABLED=true
WHMCS_AFFILIATE_ENABLED=true
```

### 5. Build Frontend
```bash
# Development build
npm run dev

# Production build
npm run build
```

### 6. Set Permissions
```bash
# Storage & cache directories
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Or for Apache
chown -R apache:apache storage bootstrap/cache
```

### 7. Optimize for Production
```bash
# Config cache
php artisan config:cache

# Route cache
php artisan route:cache

# View cache
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

---

## 🗄️ Database Tables Created

### Phase 3 Tables (15 tables)

**Webhooks:**
- `whmcs_webhooks`
- `whmcs_webhook_logs`

**Analytics:**
- `whmcs_analytics_events`
- `whmcs_analytics_metrics`

**Currency:**
- `whmcs_currencies`

**Tax:**
- `whmcs_tax_rules`
- `whmcs_tax_exemptions`

**Affiliate:**
- `whmcs_affiliates`
- `whmcs_affiliate_commissions`
- `whmcs_affiliate_payouts`
- `whmcs_affiliate_referrals`

**Knowledge Base:**
- `whmcs_kb_categories`
- `whmcs_kb_articles`
- `whmcs_kb_article_votes`
- `whmcs_kb_article_views`

---

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

### Frontend Tests
```bash
# Run Jest tests (if configured)
npm test

# Run E2E tests (if configured)
npm run test:e2e
```

### Manual Testing Checklist

#### Webhooks Module
- [ ] Create webhook
- [ ] Edit webhook
- [ ] Test webhook connection
- [ ] View webhook logs
- [ ] Delete webhook
- [ ] Retry failed webhook

#### Analytics Module
- [ ] View revenue dashboard
- [ ] Generate revenue report
- [ ] View client analytics
- [ ] View product performance
- [ ] Export report (CSV/Excel)

#### Currency Module
- [ ] Add new currency
- [ ] Update exchange rates
- [ ] Set default currency
- [ ] Convert amounts between currencies
- [ ] Disable currency

#### Tax Module
- [ ] Create tax rule
- [ ] Calculate tax on invoice
- [ ] Create tax exemption
- [ ] View tax report
- [ ] Apply multiple tax rules

#### Affiliate Module
- [ ] Register affiliate
- [ ] Approve/reject affiliate
- [ ] Track referrals
- [ ] Calculate commissions
- [ ] Process payout
- [ ] View performance report

#### Knowledge Base
- [ ] Create category
- [ ] Create article
- [ ] Search articles
- [ ] Vote helpful/not helpful
- [ ] View popular articles
- [ ] Track article views

---

## 🔐 Security Checklist

- [ ] Update `.env` with production credentials
- [ ] Set `APP_DEBUG=false`
- [ ] Configure HTTPS (SSL certificate)
- [ ] Setup firewall rules
- [ ] Enable CSRF protection
- [ ] Configure rate limiting
- [ ] Setup backup strategy
- [ ] Configure webhook signature verification
- [ ] Review file permissions
- [ ] Enable 2FA for admin accounts

---

## 📊 Performance Optimization

### 1. Enable OPcache
```ini
; php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

### 2. Configure MySQL
```sql
-- Increase buffer pool size
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB

-- Enable query cache
SET GLOBAL query_cache_size = 67108864; -- 64MB
```

### 3. Setup Redis (Optional)
```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 4. Enable CDN for Assets
```bash
# Upload build assets to CDN
npm run build
aws s3 sync public/build s3://your-bucket/whmcs/

# Update .env
ASSET_URL=https://cdn.yourdomain.com
```

---

## 🔄 Monitoring & Logging

### 1. Setup Log Rotation
```bash
# /etc/logrotate.d/laravel
/path/to/project/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 2. Monitor Webhooks
```bash
# View webhook logs
tail -f storage/logs/laravel.log | grep "Webhook"

# Monitor failed webhooks
php artisan tinker
>>> DB::table('whmcs_webhook_logs')->where('status', 'failed')->count();
```

### 3. Analytics Tracking
```bash
# Track daily metrics
php artisan schedule:run

# Or setup cron
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🐛 Troubleshooting

### Issue: UrlGenerator Error
```
UrlGenerator::__construct(): Argument #2 ($request) must be of type 
Illuminate\Http\Request, null given
```

**Temporary Workaround:**
```bash
# Use PHP built-in server
cd public && php -S localhost:8000

# Or use nginx/apache directly
```

**Permanent Fix:**
- Check Laravel 12 compatibility
- Update composer packages: `composer update`
- Consider downgrade to Laravel 11

### Issue: Migrations Fail
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();

# Run migrations one by one
php artisan migrate --path=/database/migrations/2025_11_10_120001_create_whmcs_webhooks_table.php
```

### Issue: Frontend Not Loading
```bash
# Rebuild assets
rm -rf public/build
npm run build

# Clear browser cache
# Or open in incognito mode
```

### Issue: 500 Internal Server Error
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Check permissions
chmod -R 775 storage bootstrap/cache

# Clear all caches
php artisan optimize:clear
```

---

## 📱 API Testing

### Using Postman
1. Import collection: `WHMCS_PHASE3_API_DOCS.md`
2. Set base URL: `http://yourdomain.com/aio/api/whmcs`
3. Add CSRF token header
4. Test endpoints

### Using cURL
```bash
# Test webhook creation
curl -X POST http://localhost:8000/aio/api/whmcs/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -d '{
    "name": "Test Webhook",
    "url": "https://webhook.site/unique-id",
    "events": ["invoice_paid"]
  }'
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
```bash
# Setup load balancer (nginx)
upstream whmcs_backend {
    server app1.example.com:8000;
    server app2.example.com:8000;
    server app3.example.com:8000;
}

# Configure session storage (Redis)
SESSION_DRIVER=redis
```

### Queue Workers
```bash
# Start queue worker
php artisan queue:work --tries=3

# Supervisor config
[program:whmcs-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/project/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=4
```

---

## 🔄 Backup Strategy

### Database Backup
```bash
# Daily backup
0 2 * * * mysqldump -u root -p aio > /backups/whmcs_$(date +\%Y\%m\%d).sql

# Keep last 7 days
find /backups -name "whmcs_*.sql" -mtime +7 -delete
```

### File Backup
```bash
# Backup storage directory
tar -czf /backups/whmcs_storage_$(date +%Y%m%d).tar.gz storage/

# Backup .env
cp .env /backups/.env.$(date +%Y%m%d)
```

---

## 📞 Support

### Getting Help
- Check logs: `storage/logs/laravel.log`
- Review documentation: `WHMCS_PHASE3_API_DOCS.md`
- Contact development team

### Reporting Bugs
1. Check existing issues
2. Provide error logs
3. Steps to reproduce
4. Environment details

---

## ✅ Post-Deployment Checklist

- [ ] All migrations run successfully
- [ ] Seeders executed
- [ ] Frontend built and deployed
- [ ] Permissions set correctly
- [ ] Production env configured
- [ ] Caches optimized
- [ ] SSL certificate installed
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Team trained on new features
- [ ] Documentation reviewed
- [ ] Load testing completed
- [ ] Security audit passed

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Version:** Phase 3 v1.0.0  
**Status:** ✅ Ready for Production
