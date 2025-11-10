# Hướng dẫn Copilot cho AI Coding Agents

## Tổng quan dự án: WEB AIO (All-In-One ERP)
Nền tảng quản trị doanh nghiệp tích hợp đa module (Inventory, HR, Accounting, Sales, CRM, Purchase, Document Management) với kho giao diện website. Tech stack:
- **Backend**: Laravel 12 + PHP 8.2, Service Layer pattern
- **Frontend**: React 18 + TypeScript, React Router (SPA), Ant Design
- **Build**: Vite 7, không dùng Inertia.js (pure SPA)
- **Database**: MySQL/PostgreSQL
- **Special**: Tesseract OCR (đọc CCCD), Spatie Media Library, Laravel Excel

## Kiến trúc Frontend (CRITICAL - khác Inertia)

### React SPA Routing Flow
**KHÔNG dùng Inertia.js**. Frontend là pure React SPA mount tại Laravel routes:

1. **Admin SPA**: `Route::get('aio/{any?}', [AIOController::class, 'dashboard'])` (line 69 `routes/web.php`)
   - Entry point: `resources/js/app.tsx` (React Router BrowserRouter)
   - Route config: `resources/js/common/route.tsx` (export ROUTE object)
   - Base path: `/aio/`

2. **User SPA**: `Route::get('user/{any?}', [UserController::class, 'index'])` (line 40 `routes/web.php`)
   - Entry point: `resources/js/app_user.tsx`
   - Base path: `/user/`

3. **⚠️ Route Order Critical**: API routes MUST come BEFORE SPA fallback routes in `routes/web.php`:
   ```php
   Route::group(['prefix' => 'aio/api'], function () {
       require __DIR__ . '/aio_route.php';  // API routes
   });
   Route::get('aio/{any?}', ...);  // SPA fallback LAST
   ```

### Vite Config (`vite.config.ts`)
- Dual entry points: `app.tsx` (admin), `app_user.tsx` (user)
- Alias: `@` → `resources/js`
- Manual chunks: `vendor-react`, `vendor-antd`, `vendor-utils`

### Adding New Routes
```tsx
// resources/js/common/route.tsx
export const ROUTE = {
  myNewPage: `${baseRoute}my-module/page/`,
  // baseRoute = "/" for relative paths
};

// resources/js/app.tsx
import MyPage from './pages/my-module/MyPage';
<Route path="/my-module/page/" element={<MyPage />} />
```

## Backend Architecture

### Service Layer Pattern
Logic nghiệp vụ PHẢI tách ra `app/Services/{Domain}/`:
```php
// app/Services/Purchase/PurchaseOrderService.php
class PurchaseOrderService {
    public function createOrder(array $data): Order { /* ... */ }
}
```
Domain organization: `Admin/`, `Sales/`, `Business/`, `Telesale/`, `Document/`, `User/`

### Model Organization
Models chia theo domain context trong `app/Models/`:
- `Admin/` - Admin users, permissions
- `User/` - End users
- `Web/` - Website content
- Business entities spread across modules (cần refactor vào domain folders)

### Route Files (Domain-separated)
- `routes/web.php` - Main auth + SPA fallbacks
- `routes/aio_route.php` - AIO admin API
- `routes/admin_route.php` - Admin management API
- `routes/purchase_route.php` - Purchase module API
- `routes/user_route.php` - User public routes
- `routes/user_api_route.php` - User authenticated API

### Config Custom
- `config/constant.php` - Custom business constants (currency, statuses)
- Các config không theo chuẩn Laravel, check file này trước

## Development Workflows

### Dev Server
```bash
# Concurrent dev (server + queue + vite)
composer dev

# Or manual
php artisan serve
php artisan queue:listen --tries=1
npm run dev
```

### Build & Deploy
```bash
npm run build  # Production build with increased memory limit
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Testing
```bash
php artisan test         # All tests
vendor/bin/phpunit       # Direct PHPUnit
# Frontend tests: chưa setup (TODO: Vitest/Playwright)
```

### Database Migrations
```bash
php artisan migrate
php artisan migrate:fresh --seed  # Reset + seed
```

## Critical Patterns

### API Response Format
Controllers return JSON theo chuẩn:
```php
return response()->json([
    'success' => true,
    'data' => $data,
    'message' => 'Success message'
]);
```

### Frontend API Calls
```tsx
import { callApi } from '@/Function/api';

const result = await callApi(route('endpoint.name', [id]));
if (result.success) { /* ... */ }
```

### Ziggy Routes in React
```tsx
import { route } from 'ziggy-js';  // Laravel routes in JS
const url = route('data.index', [tableId]);
```

### Common Helper Functions
- `resources/js/Function/common.tsx`: `parseJson()`, `numberFormat()`, `inArray()`
- `resources/js/Function/input.tsx`: Custom form components (HTSelect, HTDate, HTNumber...)
- `resources/js/Function/config_route.tsx`: Module menu configs (routeQLKho, routeSales, routeTaiChinh...)

## Module-Specific Patterns

### Dynamic Data Tables
Pattern: Generic table component reused across modules
- Config: `resources/js/Function/config_route.tsx` (routeQLKho, routeSales, etc.)
- Components: `resources/js/Function/data_source.tsx`
- Backend: `app/Services/DataService.php` - generic CRUD operations

### Document Management
- OCR Integration: `thiagoalessio/tesseract_ocr` package
- File upload: Spatie Media Library
- Storage: Laravel Filesystem (config `filesystems.php`)

### Purchase Management
Fully implemented module (`resources/js/pages/purchase/`, `routes/purchase_route.php`):
- Supplier → PurchaseOrder → StockReceipt → Payment flow
- Report dashboards with charts (Recharts)

### ERP Modules
- HR: Chấm công, Bảng lương, Nghỉ phép (`resources/js/pages/hr/`)
- Sales: Khách hàng, Đơn hàng, Báo cáo (`resources/js/pages/sales/`)
- Accounting: Hóa đơn, Sổ quỹ, Công nợ
- Bank: Account + Transaction management

## Dependencies & Integration

### Key PHP Packages
- `spatie/laravel-medialibrary` - File attachments
- `maatwebsite/excel` - Import/Export Excel
- `intervention/image` - Image processing
- `tightenco/ziggy` - Laravel routes in JavaScript

### Key NPM Packages
- `antd` - UI component library
- `react-router-dom` v7 - Client routing
- `axios` - HTTP client
- `dayjs` - Date manipulation
- `recharts` - Charts & graphs
- `suneditor-react` - Rich text editor

### OCR Setup (macOS)
```bash
brew install tesseract
brew install tesseract-lang  # Vietnamese support
```
Config: Tesseract binary path in environment

## Common Pitfalls

1. **Route Order**: API routes before SPA fallback - break this = 404s
2. **CSRF Token**: React needs meta tag `<meta name="csrf-token">` for axios
3. **Vite Alias**: Import `@/` not `../../../` for cleaner paths
4. **Service Layer**: Don't put logic in Controllers - use Services
5. **Module Routes**: Each module has own route file (purchase_route.php, aio_route.php...)
6. **React Router**: Use `<Route path="/exact/path/">` not Laravel-style wildcards

## Development Tips

- **Menu Config**: Edit `resources/js/Function/config_route.tsx` for sidebar menus
- **Form Helpers**: Reuse `HTInput`, `HTSelect`, `HTDate` from `Function/input.tsx`
- **Table Patterns**: Copy from existing pages (e.g., `pages/purchase/SupplierList.tsx`)
- **API Endpoints**: Follow naming `{module}.{action}` (e.g., `purchase.order.create`)
- **Translations**: Use `__('key')` (Laravel) or localize in React components

---
**Branch**: `whmcs` | **Updated**: 10/11/2025 | **Maintainer**: Confirm with Sếp before major refactors
