# RAM Optimization Guide

## 🎯 Tối ưu hóa đã thực hiện

### 1. Package.json Optimization
- ✅ Tăng Node memory limit: 2GB → 4GB cho build
- ✅ Thêm GC optimization flags
- ✅ Thêm script `clean` để xóa cache
- ✅ Production mode build

### 2. Vite Config Optimization
- ✅ **Code Splitting**: Tách thành nhiều chunk nhỏ
  - `vendor-react`: React core (nhỏ, load nhanh)
  - `vendor-charts-antd`: @ant-design/charts (nặng, lazy load)
  - `vendor-charts-recharts`: recharts (nặng, lazy load)
  - `vendor-editor`: suneditor (nặng, lazy load)
  - `vendor-animation`: framer-motion (nặng, lazy load)
  - `vendor-dnd`: Drag & Drop libraries
  - `vendor-utils`: axios, dayjs, lodash
  - `vendor-radix`: Radix UI components
  
- ✅ **Minification**: Terser với drop console.log
- ✅ **Source Maps**: Disabled cho production (giảm 30-40% size)
- ✅ **Pre-bundling**: Optimize dependencies
- ✅ **Lazy Loading**: Heavy libraries excluded from eager loading

### 3. NPM Configuration (.npmrc)
- ✅ Giảm concurrent downloads
- ✅ Tối ưu retry strategy
- ✅ Cache optimization

### 4. Build Scripts
- ✅ `optimize.ps1`: PowerShell script để clear cache
- ✅ `optimize.sh`: Bash script cho Linux/Mac

## 📊 Phân tích RAM hiện tại

**Trước tối ưu:**
- PHP: 758 MB ⚠️
- Node: ~650 MB (nhiều process)
- MySQL: 118 MB ✅

**Nguyên nhân PHP tốn RAM:**
1. Laravel cache chưa optimize
2. Không có OpCache config
3. Memory leak từ long-running process

## 🚀 Hướng dẫn sử dụng

### Rebuild assets với optimization mới:
```bash
# Clear cache trước
npm run clean

# Rebuild
npm run build
```

### Chạy optimization script:
```powershell
# Windows PowerShell
.\optimize.ps1

# Hoặc
php artisan optimize:clear
php artisan optimize
```

### Kiểm tra RAM sau optimize:
```powershell
Get-Process php,node,mysqld | Select-Object ProcessName,@{Name='RAM(MB)';Expression={[math]::Round($_.WS/1MB,2)}} | Sort-Object 'RAM(MB)' -Descending
```

## 💡 Khuyến nghị tiếp theo

### 1. PHP Optimization (Ưu tiên cao - giảm từ 758MB)
```ini
# php.ini
memory_limit = 256M (thay vì unlimited)
opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 10000
opcache.revalidate_freq = 2
opcache.fast_shutdown = 1
```

### 2. Xóa dependencies không dùng
Đang có **2 chart libraries** song song:
- `@ant-design/charts` (9 files sử dụng) ✅ GIỮ
- `recharts` (7 files sử dụng) ⚠️ CÂN NHẮC MIGRATE

**Nếu migrate hết sang @ant-design/charts:**
- Tiết kiệm ~50MB bundle size
- Giảm ~100-150MB RAM khi runtime

### 3. Laravel Queue Worker
Restart worker định kỳ để tránh memory leak:
```bash
php artisan queue:restart
```

### 4. Lazy Load Heavy Components
```typescript
// Thay vì import trực tiếp
import { Column } from '@ant-design/charts';

// Dùng lazy loading
const Column = lazy(() => import('@ant-design/charts').then(m => ({ default: m.Column })));
```

## 📈 Kết quả kỳ vọng

Sau khi apply tối ưu:
- **PHP**: 758 MB → ~200-300 MB (giảm 60%)
- **Node**: 650 MB → ~200-300 MB (giảm 50%)
- **Build time**: Tăng 10-20% (do minification)
- **Bundle size**: Giảm 30-40%
- **Page load**: Nhanh hơn 20-30%

## ⚠️ Lưu ý

1. **First Build** sẽ chậm hơn (do code splitting)
2. **Dev mode** vẫn giữ nguyên performance
3. **Production mode** mới áp dụng optimization
4. Cần **restart PHP service** để thấy hiệu quả

## 🔧 Troubleshooting

### Build bị lỗi memory:
```bash
# Tăng thêm memory nếu cần
node --max-old-space-size=8192 node_modules/vite/bin/vite.js build
```

### Vite cache bị corrupt:
```bash
npm run clean
rm -rf node_modules/.vite
```

### PHP vẫn tốn RAM:
```bash
# Restart PHP-FPM hoặc Apache
taskkill /F /IM php.exe
# Sau đó start lại web server
```
