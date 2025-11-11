# WHMCS API Integration Tests

## Overview
Comprehensive integration tests cho WHMCS Phase 3 covering tất cả major APIs.

## Test Coverage

### 1. Product API Tests (`tests/Feature/Whmcs/ProductApiTest.php`)
✅ test_can_list_products - List products với pricing
✅ test_can_create_product - Create product với pricing tiers
✅ test_can_update_product - Update product info
✅ test_can_delete_product - Soft delete product
✅ test_guests_cannot_access_products - Authorization check
✅ test_validation_fails_for_invalid_product_data - Validation rules

### 2. Service API Tests (`tests/Feature/Whmcs/ServiceApiTest.php`)
✅ test_can_list_services - List services with relationships
✅ test_can_create_service - Create service with required fields
✅ test_can_update_service_status - Change service status
✅ test_can_suspend_service - Suspend active service
✅ test_can_terminate_service - Terminate service with date
✅ test_cannot_create_service_without_required_fields - Validation
✅ test_cannot_create_service_with_invalid_billing_cycle - Enum validation
✅ test_can_filter_services_by_status - Query filtering

### 3. Invoice API Tests (`tests/Feature/Whmcs/InvoiceApiTest.php`)
✅ test_can_list_invoices - List invoices with client info
✅ test_can_create_invoice_with_items - Create invoice + items
✅ test_can_mark_invoice_as_paid - Payment processing
✅ test_can_cancel_unpaid_invoice - Cancel unpaid only
✅ test_cannot_cancel_paid_invoice - Business logic validation
✅ test_can_filter_invoices_by_status - Query filtering
✅ test_invoice_total_is_calculated_correctly - Math calculations
✅ test_generates_unique_invoice_number - Auto-generation

## Factories Created

### Model Factories (`database/factories/Whmcs/`)
- ✅ ProductGroupFactory - Product categories
- ✅ ProductFactory - Products with states (hosting, vps, domain)
- ✅ ProductPricingFactory - Pricing tiers (monthly, annually)
- ✅ ServiceFactory - Services with states (active, suspended, terminated)
- ✅ InvoiceFactory - Invoices with states (paid, unpaid, cancelled, overdue)
- ✅ InvoiceItemFactory - Line items with calculations

## Running Tests

### Run all WHMCS tests:
```bash
php artisan test --filter=Whmcs
```

### Run specific test class:
```bash
php artisan test --filter=ProductApiTest
php artisan test --filter=ServiceApiTest
php artisan test --filter=InvoiceApiTest
```

### Run single test:
```bash
php artisan test --filter=ProductApiTest::test_can_list_products
```

### With coverage (if xdebug enabled):
```bash
php artisan test --filter=Whmcs --coverage
```

## Test Database

Tests use SQLite in-memory database với `RefreshDatabase` trait:
- Auto migrations before each test
- Clean database after each test
- Fast execution (no disk I/O)
- Isolated test environment

## Assertions Used

### Response Assertions:
- `assertOk()` - 200 status
- `assertCreated()` - 201 status
- `assertUnauthorized()` - 401 status
- `assertStatus(422)` - Validation errors
- `assertJsonStructure()` - Check JSON shape
- `assertJsonFragment()` - Check specific values
- `assertJsonMissing()` - Ensure value not present

### Database Assertions:
- `assertDatabaseHas()` - Record exists
- `assertSoftDeleted()` - Soft delete check

## Key Testing Patterns

### 1. Authentication Testing:
```php
$this->actingAs($this->user)->getJson('/api/endpoint');
```

### 2. Factory Usage:
```php
Product::factory()->create(['name' => 'Test']);
Product::factory()->count(5)->create();
Product::factory()->hosting()->create(); // With state
```

### 3. Relationship Testing:
```php
$product->load(['pricing', 'group']);
$response->assertJsonStructure(['data' => ['*' => ['pricing']]]);
```

### 4. Validation Testing:
```php
$response->assertStatus(422)
    ->assertJsonValidationErrors(['field1', 'field2']);
```

## Test Improvements Roadmap

### Phase 4 (Future):
- [ ] Webhook delivery tests
- [ ] Payment gateway integration tests (VNPay sandbox)
- [ ] Currency conversion tests
- [ ] Tax calculation tests
- [ ] Affiliate commission tests
- [ ] Knowledge Base search tests
- [ ] API rate limiting tests
- [ ] Concurrent request tests

### Performance Tests:
- [ ] Load testing với 1000+ products
- [ ] Query optimization tests (N+1 checks)
- [ ] Cache effectiveness tests

### Security Tests:
- [ ] CSRF protection tests
- [ ] SQL injection attempts
- [ ] XSS prevention tests
- [ ] Authorization boundary tests

## Notes

- All tests pass ✅ (22 tests, 0 failures)
- Test execution time: ~1.5 seconds
- No external dependencies (pure unit/integration)
- Compatible with CI/CD pipelines
- Follows Laravel testing best practices

## Troubleshooting

### SQLite fulltext error:
Fixed by conditional fulltext index in knowledge_base migration:
```php
if (DB::connection()->getDriverName() === 'mysql') {
    $table->fullText(['title', 'content']);
}
```

### Foreign key constraint errors:
Fixed by updating migrations to use correct table names:
- `whmcs_services.client_id` → references `users.id`
- Not `whmcs_clients.id`

### Column mismatch errors:
Fixed factories to match migration schemas:
- `billing_cycle` → `cycle` (ProductPricing)
- `invoice_number` → `number` (Invoice)
- `payment_cycle` vs `billing_cycle` (Service - has accessor/mutator)

---
**Last Updated:** 11/11/2025  
**Test Suite Version:** 1.0.0  
**Coverage:** Products, Services, Invoices (Core WHMCS features)
