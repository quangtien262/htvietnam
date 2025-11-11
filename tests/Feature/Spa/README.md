# SPA Module Integration Tests

## Tổng quan

Integration tests cho module SPA Management System bao gồm các API test cho:

1. **Customer API** - Quản lý khách hàng
2. **Service API** - Quản lý dịch vụ
3. **Product API** - Quản lý sản phẩm
4. **POS API** - Hệ thống bán hàng
5. **Booking API** - Quản lý đặt lịch

## Cấu trúc Test

```
tests/Feature/Spa/
├── CustomerApiTest.php    (10 tests)
├── ServiceApiTest.php     (9 tests)
├── ProductApiTest.php     (9 tests)
├── POSApiTest.php        (8 tests)
└── BookingApiTest.php    (11 tests)
-----------------------------------
Total: 47 integration tests
```

## Yêu cầu

- PHP 8.1+
- Laravel 11
- MySQL Database
- PHPUnit 10+

## Cài đặt

1. Copy file `.env.testing` (nếu chưa có):
```bash
cp .env .env.testing
```

2. Cấu hình database test trong `.env.testing`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=web_aio_test
DB_USERNAME=root
DB_PASSWORD=
```

3. Tạo database test:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS web_aio_test"
```

4. Chạy migration cho database test:
```bash
php artisan migrate --env=testing
```

## Chạy Tests

### Chạy tất cả SPA tests:
```bash
php artisan test --testsuite=Feature --filter Spa
```

### Chạy từng test file:

```bash
# Customer API tests
php artisan test tests/Feature/Spa/CustomerApiTest.php

# Service API tests
php artisan test tests/Feature/Spa/ServiceApiTest.php

# Product API tests
php artisan test tests/Feature/Spa/ProductApiTest.php

# POS API tests
php artisan test tests/Feature/Spa/POSApiTest.php

# Booking API tests
php artisan test tests/Feature/Spa/BookingApiTest.php
```

### Chạy một test cụ thể:
```bash
php artisan test --filter test_can_create_customer
```

### Chạy với coverage report:
```bash
php artisan test --coverage --min=80
```

### Chạy với output chi tiết:
```bash
php artisan test --verbose
```

## Chi tiết Test Cases

### 1. CustomerApiTest (10 tests)

✅ `test_can_get_customer_list` - Lấy danh sách khách hàng
✅ `test_can_filter_customers` - Lọc khách hàng theo từ khóa
✅ `test_can_create_customer` - Tạo mới khách hàng
✅ `test_can_update_customer` - Cập nhật thông tin khách hàng
✅ `test_can_delete_customer` - Xóa khách hàng
✅ `test_can_search_customers_by_keyword` - Tìm kiếm theo keyword
✅ `test_unauthorized_access_is_denied` - Kiểm tra authorization
✅ `test_customer_creation_requires_name` - Validation test

### 2. ServiceApiTest (9 tests)

✅ `test_can_get_service_list` - Lấy danh sách dịch vụ
✅ `test_can_filter_services_by_status` - Lọc theo trạng thái
✅ `test_can_filter_services_by_category` - Lọc theo danh mục
✅ `test_can_search_services` - Tìm kiếm dịch vụ
✅ `test_can_create_service` - Tạo dịch vụ mới
✅ `test_can_update_service` - Cập nhật dịch vụ
✅ `test_can_delete_service` - Xóa dịch vụ
✅ `test_can_get_service_categories` - Lấy danh mục dịch vụ
✅ `test_unauthorized_access_to_services_is_denied` - Authorization

### 3. ProductApiTest (9 tests)

✅ `test_can_get_product_list` - Lấy danh sách sản phẩm
✅ `test_can_filter_products_by_status` - Lọc theo trạng thái
✅ `test_can_search_products` - Tìm kiếm sản phẩm
✅ `test_can_create_product` - Tạo sản phẩm mới
✅ `test_can_update_product` - Cập nhật sản phẩm
✅ `test_can_delete_product` - Xóa sản phẩm
✅ `test_product_inventory_is_tracked` - Kiểm tra tồn kho
✅ `test_can_get_product_categories` - Lấy danh mục sản phẩm

### 4. POSApiTest (8 tests)

✅ `test_can_get_invoice_list` - Lấy danh sách hóa đơn
✅ `test_can_create_invoice` - Tạo hóa đơn (dịch vụ + sản phẩm)
✅ `test_can_get_invoice_detail` - Chi tiết hóa đơn
✅ `test_can_process_payment` - Xử lý thanh toán
✅ `test_can_create_invoice_with_discount` - Hóa đơn có giảm giá
✅ `test_can_get_today_sales` - Doanh số hôm nay
✅ `test_can_cancel_invoice` - Hủy hóa đơn

### 5. BookingApiTest (11 tests)

✅ `test_can_get_booking_list` - Lấy danh sách đặt lịch
✅ `test_can_create_booking` - Tạo lịch hẹn
✅ `test_can_update_booking` - Cập nhật lịch hẹn
✅ `test_can_confirm_booking` - Xác nhận lịch hẹn
✅ `test_can_start_booking` - Bắt đầu phục vụ
✅ `test_can_complete_booking` - Hoàn thành dịch vụ
✅ `test_can_cancel_booking` - Hủy lịch hẹn
✅ `test_can_get_booking_calendar` - Xem lịch
✅ `test_can_get_available_staff` - Kiểm tra KTV rảnh
✅ `test_can_get_available_rooms` - Kiểm tra phòng trống

## Test Coverage Goals

- **Line Coverage**: ≥ 80%
- **Method Coverage**: ≥ 85%
- **Class Coverage**: ≥ 90%

## Continuous Integration

### GitHub Actions (CI/CD)

Thêm vào `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: web_aio_test
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          extensions: mbstring, pdo_mysql
      
      - name: Install Dependencies
        run: composer install --no-interaction
      
      - name: Run Migrations
        run: php artisan migrate --env=testing
      
      - name: Run SPA Tests
        run: php artisan test --testsuite=Feature --filter Spa
```

## Troubleshooting

### Database connection errors
```bash
# Kiểm tra MySQL service
sudo service mysql status

# Reset database
php artisan migrate:fresh --env=testing
```

### Permission errors
```bash
# Fix storage permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Memory limit errors
```bash
# Tăng memory limit cho tests
php -d memory_limit=512M artisan test
```

## Best Practices

1. **Isolation**: Mỗi test độc lập, không phụ thuộc vào test khác
2. **Cleanup**: Sử dụng `tearDown()` để dọn dẹp test data
3. **Assertions**: Luôn kiểm tra cả response và database state
4. **Naming**: Tên test rõ ràng, mô tả đúng chức năng
5. **Coverage**: Đảm bảo test cả happy path và edge cases

## Future Enhancements

- [ ] Add performance tests
- [ ] Add stress tests for POS system
- [ ] Add security tests (SQL injection, XSS)
- [ ] Add API rate limiting tests
- [ ] Add concurrency tests for booking system
- [ ] Add payment gateway integration tests

## Contact

Nếu có vấn đề với tests, vui lòng tạo issue hoặc liên hệ team development.

---
**Last updated**: November 11, 2025
