# Server Maintenance Guide - Memory Leak Prevention

## Vấn đề hiện tại
- Server bị tràn RAM sau 3-7 ngày sử dụng
- PHP-FPM tăng từ ~500MB → 49GB
- Cần restart server để giải phóng RAM

## Giải pháp ngắn hạn

### 1. Tự động restart PHP-FPM hàng ngày (Cron Job)

```bash
# Mở crontab
crontab -e

# Thêm dòng này (restart lúc 3h sáng mỗi ngày)
0 3 * * * /etc/init.d/php-fpm-81 restart >> /var/log/php-fpm-restart.log 2>&1
```

**Hoặc dùng aaPanel:**
1. Vào **Cron**
2. **Add Task**
3. Task type: **Shell Script**
4. Script: `/etc/init.d/php-fpm-81 restart`
5. Execution cycle: **Daily** at **03:00**

### 2. Giảm số PHP-FPM worker processes

```bash
# Tìm file config PHP-FPM
ls /www/server/php/

# Sửa file config (ví dụ PHP 8.1)
nano /www/server/php/81/etc/php-fpm.conf

# Tìm và sửa các dòng này:
pm = dynamic
pm.max_children = 20        # Giảm từ 50 xuống 20
pm.start_servers = 5        # Giảm từ 10 xuống 5
pm.min_spare_servers = 3    # Giảm từ 5 xuống 3
pm.max_spare_servers = 10   # Giảm từ 20 xuống 10
pm.max_requests = 500       # QUAN TRỌNG: Tự động restart worker sau 500 requests

# Restart PHP-FPM
/etc/init.d/php-fpm-81 restart
```

**Giải thích:**
- `pm.max_children = 20`: Tối đa 20 worker processes (thay vì 50+)
- `pm.max_requests = 500`: **Worker tự động restart** sau 500 requests → giải phóng memory leak

### 3. Tối ưu MySQL

```bash
# Sửa file MySQL config
nano /etc/mysql/my.cnf
# Hoặc
nano /www/server/mysql/my.cnf

# Thêm/sửa trong section [mysqld]:
[mysqld]
innodb_buffer_pool_size = 512M     # Giảm từ mặc định
max_connections = 50               # Giảm từ 151
table_open_cache = 128
tmp_table_size = 64M
max_heap_table_size = 64M
query_cache_size = 0               # Disable query cache (deprecated)

# Restart MySQL
systemctl restart mysql
```

### 4. Enable PHP OpCache (Giảm memory usage)

```bash
# Tìm file php.ini
nano /www/server/php/81/etc/php.ini

# Tìm section [opcache] và sửa:
[opcache]
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
opcache.fast_shutdown=1

# Restart PHP-FPM
/etc/init.d/php-fpm-81 restart
```

## Giải pháp dài hạn - Tìm memory leak trong code

### 1. Enable Laravel Query Logging (Kiểm tra N+1 queries)

Tạo file `app/Http/Middleware/LogQueries.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LogQueries
{
    public function handle($request, Closure $next)
    {
        // Chỉ log khi có query > 100 lần trong 1 request
        $queryCount = 0;
        
        DB::listen(function($query) use (&$queryCount) {
            $queryCount++;
        });

        $response = $next($request);

        if ($queryCount > 100) {
            Log::warning("High query count: {$queryCount} queries in " . $request->path());
        }

        return $response;
    }
}
```

Đăng ký middleware trong `bootstrap/app.php` hoặc `app/Http/Kernel.php`.

### 2. Kiểm tra routes có vấn đề

```bash
# SSH vào server, chạy lệnh xem log
tail -f /www/wwwlogs/htvietnam.aitilen.com.log

# Hoặc check Laravel log
tail -f /www/wwwroot/htvietnam/aitilen.com/storage/logs/laravel.log
```

Tìm các route:
- Response time > 2s
- Xuất hiện nhiều lần/phút
- Có pattern lặp lại

### 3. Tối ưu code Laravel

**Các vấn đề thường gặp:**

```php
// ❌ BAD: N+1 Query Problem
$projects = Project::all();
foreach ($projects as $project) {
    echo $project->user->name; // Mỗi lần lại query DB
}

// ✅ GOOD: Eager Loading
$projects = Project::with('user')->get();
foreach ($projects as $project) {
    echo $project->user->name;
}

// ❌ BAD: Load toàn bộ data vào memory
$allTasks = Task::all(); // 100,000+ records → RAM explode

// ✅ GOOD: Dùng chunk hoặc cursor
Task::chunk(1000, function ($tasks) {
    foreach ($tasks as $task) {
        // Process task
    }
});

// ❌ BAD: Không clear event listeners
Event::listen('*', function ($event) {
    // Memory leak nếu không unset
});

// ✅ GOOD: Dùng queue cho heavy tasks
ProcessLargeDataJob::dispatch($data);
```

### 4. Monitor RAM realtime

Tạo script monitoring:

```bash
# Tạo file /root/monitor-ram.sh
nano /root/monitor-ram.sh

# Nội dung:
#!/bin/bash
while true; do
    PHP_RAM=$(ps aux | grep php-fpm | grep -v grep | awk '{sum+=$6} END {printf "%.0f", sum/1024}')
    echo "$(date '+%Y-%m-%d %H:%M:%S') - PHP-FPM RAM: ${PHP_RAM}MB" >> /var/log/ram-monitor.log
    
    # Nếu PHP-FPM > 2GB thì restart
    if [ "$PHP_RAM" -gt 2048 ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - WARNING: PHP-FPM using ${PHP_RAM}MB, restarting..." >> /var/log/ram-monitor.log
        /etc/init.d/php-fpm-81 restart
    fi
    
    sleep 3600  # Check mỗi giờ
done

# Cho phép thực thi
chmod +x /root/monitor-ram.sh

# Chạy background
nohup /root/monitor-ram.sh &
```

### 5. Tự động restart khi RAM cao (Systemd Service)

```bash
# Tạo service file
nano /etc/systemd/system/php-fpm-watchdog.service

# Nội dung:
[Unit]
Description=PHP-FPM Memory Watchdog
After=network.target

[Service]
Type=simple
ExecStart=/root/monitor-ram.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable và start service
systemctl daemon-reload
systemctl enable php-fpm-watchdog
systemctl start php-fpm-watchdog
```

## Checklist thực hiện ngay

- [ ] **Thêm cron job restart PHP-FPM lúc 3h sáng**
- [ ] **Giảm pm.max_children xuống 20**
- [ ] **Thêm pm.max_requests = 500**
- [ ] **Enable OpCache trong php.ini**
- [ ] **Giảm MySQL max_connections xuống 50**
- [ ] **Tạo script monitor RAM** (/root/monitor-ram.sh)
- [ ] **Check Laravel log** tìm route chậm
- [ ] **Review code** tìm N+1 query

## Kết quả mong đợi

**Trước:**
- PHP-FPM: 500MB → 49GB sau 3-7 ngày
- Cần restart server thủ công

**Sau:**
- PHP-FPM: Tự động restart hàng ngày, giữ < 1GB
- Worker tự động restart sau 500 requests
- Alert tự động nếu RAM > 2GB
- Hệ thống ổn định 24/7

## Lệnh kiểm tra nhanh

```bash
# Check RAM hiện tại
free -h

# Check PHP-FPM workers
ps aux | grep php-fpm | grep -v grep | wc -l

# Check PHP-FPM total RAM
ps aux | grep php-fpm | grep -v grep | awk '{sum+=$6} END {printf "%.2f MB\n", sum/1024}'

# Check cron jobs
crontab -l

# Check OpCache status
php -i | grep opcache

# View monitoring log
tail -f /var/log/ram-monitor.log
```

---

**Cập nhật:** 21/11/2025
**Người thực hiện:** Cần SSH vào server Ubuntu để config
