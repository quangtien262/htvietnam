# 📡 WHMCS Phase 3 - API Documentation

## Base URL
```
http://localhost:8000/aio/api/whmcs
```

---

## 🔗 1. Webhooks API

### List Webhooks
```http
GET /webhooks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Invoice Payment Notification",
      "url": "https://example.com/webhook",
      "events": ["invoice_paid", "invoice_created"],
      "is_active": true,
      "secret_key": "whsec_...",
      "last_triggered_at": "2025-11-10 10:30:00"
    }
  ]
}
```

### Create Webhook
```http
POST /webhooks
```

**Body:**
```json
{
  "name": "My Webhook",
  "url": "https://example.com/webhook",
  "events": ["invoice_paid", "service_provisioned"],
  "is_active": true
}
```

### Update Webhook
```http
PUT /webhooks/{id}
```

### Delete Webhook
```http
DELETE /webhooks/{id}
```

### Test Webhook
```http
POST /webhooks/{id}/test
```

### Retry Webhook
```http
POST /webhooks/{id}/retry
```

### Get Webhook Logs
```http
GET /webhooks/{id}/logs?page=1&per_page=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 123,
        "webhook_id": 1,
        "event": "invoice_paid",
        "status": "success",
        "http_status": 200,
        "request_payload": {...},
        "response_body": {...},
        "triggered_at": "2025-11-10 10:30:00"
      }
    ],
    "total": 50
  }
}
```

### Available Events
- `invoice_created`
- `invoice_paid`
- `invoice_cancelled`
- `invoice_refunded`
- `service_created`
- `service_provisioned`
- `service_suspended`
- `service_terminated`
- `client_created`
- `ticket_created`
- `ticket_replied`

---

## 📊 2. Analytics API

### Get Overview
```http
GET /analytics/overview?start_date=2025-01-01&end_date=2025-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue": 150000000,
    "total_invoices": 450,
    "total_clients": 120,
    "active_services": 200,
    "mrr": 15000000,
    "arr": 180000000,
    "growth_rate": 15.5,
    "churn_rate": 2.3
  }
}
```

### Get Revenue Report
```http
GET /analytics/revenue?start_date=2025-01-01&end_date=2025-12-31&period=month
```

**Periods:** `day`, `week`, `month`, `year`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150000000,
    "breakdown": [
      {
        "period": "2025-01",
        "revenue": 12500000,
        "invoices": 45,
        "paid_invoices": 40
      },
      {
        "period": "2025-02",
        "revenue": 13200000,
        "invoices": 48,
        "paid_invoices": 44
      }
    ]
  }
}
```

### Get Client Analytics
```http
GET /analytics/clients?start_date=2025-01-01&end_date=2025-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_clients": 120,
    "new_clients": 15,
    "avg_lifetime_value": 12500000,
    "top_clients": [
      {
        "client_id": 5,
        "client_name": "ABC Company",
        "total_spent": 45000000,
        "total_invoices": 18
      }
    ]
  }
}
```

### Get Product Performance
```http
GET /analytics/products?start_date=2025-01-01&end_date=2025-12-31
```

### Get Churn Analysis
```http
GET /analytics/churn?start_date=2025-01-01&end_date=2025-12-31
```

### Export Report
```http
POST /analytics/export
```

**Body:**
```json
{
  "report_type": "revenue",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "format": "csv"
}
```

**Formats:** `csv`, `excel`, `pdf`

---

## 💱 3. Currency API

### List Currencies
```http
GET /currencies
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "VND",
      "name": "Vietnamese Dong",
      "symbol": "₫",
      "exchange_rate": 1.0,
      "decimal_places": 0,
      "is_default": true,
      "is_active": true
    },
    {
      "id": 2,
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "exchange_rate": 0.00004,
      "decimal_places": 2,
      "is_default": false,
      "is_active": true
    }
  ]
}
```

### Create Currency
```http
POST /currencies
```

**Body:**
```json
{
  "code": "EUR",
  "name": "Euro",
  "symbol": "€",
  "exchange_rate": 0.000037,
  "decimal_places": 2,
  "is_active": true
}
```

### Update Currency
```http
PUT /currencies/{id}
```

### Delete Currency
```http
DELETE /currencies/{id}
```

### Set Default Currency
```http
POST /currencies/{id}/set-default
```

### Update Exchange Rates
```http
POST /currencies/update-rates
```

**Body (optional):**
```json
{
  "base_currency": "VND"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exchange rates updated successfully",
  "data": {
    "updated_count": 7,
    "failed_count": 0,
    "rates": {
      "USD": 0.00004,
      "EUR": 0.000037,
      "GBP": 0.000032
    }
  }
}
```

### Convert Amount
```http
POST /currencies/convert
```

**Body:**
```json
{
  "amount": 1000000,
  "from_currency": "VND",
  "to_currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original_amount": 1000000,
    "converted_amount": 40.00,
    "from_currency": "VND",
    "to_currency": "USD",
    "exchange_rate": 0.00004
  }
}
```

---

## 💰 4. Tax API

### List Tax Rules
```http
GET /tax/rules
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "VAT Vietnam (10%)",
      "type": "vat",
      "rate": 10.0,
      "country": "VN",
      "state": null,
      "is_compound": false,
      "is_active": true
    }
  ]
}
```

### Create Tax Rule
```http
POST /tax/rules
```

**Body:**
```json
{
  "name": "VAT Vietnam (10%)",
  "type": "vat",
  "rate": 10.0,
  "country": "VN",
  "state": null,
  "is_compound": false,
  "is_active": true
}
```

**Tax Types:** `vat`, `gst`, `sales_tax`, `custom`

### Update Tax Rule
```http
PUT /tax/rules/{id}
```

### Delete Tax Rule
```http
DELETE /tax/rules/{id}
```

### Calculate Tax
```http
POST /tax/calculate
```

**Body:**
```json
{
  "amount": 1000000,
  "country": "VN",
  "state": null,
  "tax_inclusive": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subtotal": 1000000,
    "tax_amount": 100000,
    "total": 1100000,
    "applied_rules": [
      {
        "name": "VAT Vietnam (10%)",
        "rate": 10.0,
        "amount": 100000
      }
    ]
  }
}
```

### List Tax Exemptions
```http
GET /tax/exemptions
```

### Create Tax Exemption
```http
POST /tax/exemptions
```

**Body:**
```json
{
  "client_id": 5,
  "reason": "Non-profit organization",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```

### Tax Report
```http
GET /tax/report?start_date=2025-01-01&end_date=2025-12-31
```

---

## 🤝 5. Affiliate API

### List Affiliates
```http
GET /affiliates?status=active&page=1&per_page=20
```

**Statuses:** `pending`, `active`, `suspended`, `banned`

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 10,
        "referral_code": "AFF123456",
        "commission_rate": 10.0,
        "commission_type": "percentage",
        "total_earnings": 5000000,
        "pending_earnings": 500000,
        "paid_earnings": 4500000,
        "total_referrals": 15,
        "status": "active"
      }
    ],
    "total": 50
  }
}
```

### Create Affiliate
```http
POST /affiliates
```

**Body:**
```json
{
  "user_id": 10,
  "commission_rate": 10.0,
  "commission_type": "percentage",
  "status": "active"
}
```

**Commission Types:** `percentage`, `fixed`, `tiered`

### Update Affiliate
```http
PUT /affiliates/{id}
```

### Approve/Reject Affiliate
```http
POST /affiliates/{id}/approve
POST /affiliates/{id}/reject
```

### Suspend/Activate Affiliate
```http
POST /affiliates/{id}/suspend
POST /affiliates/{id}/activate
```

### Get Affiliate Commissions
```http
GET /affiliates/{id}/commissions?page=1&per_page=20
```

### Get Affiliate Payouts
```http
GET /affiliates/{id}/payouts?page=1&per_page=20
```

### Create Payout
```http
POST /affiliates/{id}/payouts
```

**Body:**
```json
{
  "amount": 1000000,
  "payment_method": "bank_transfer",
  "notes": "Monthly payout November 2025"
}
```

**Payment Methods:** `bank_transfer`, `paypal`, `momo`, `vnpay`

### Get Affiliate Referrals
```http
GET /affiliates/{id}/referrals?page=1&per_page=20
```

### Get Affiliate Performance
```http
GET /affiliates/{id}/performance?start_date=2025-01-01&end_date=2025-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_referrals": 15,
    "total_earnings": 5000000,
    "conversion_rate": 25.5,
    "avg_order_value": 2500000,
    "monthly_breakdown": [...]
  }
}
```

---

## 📚 6. Knowledge Base API

### List Categories
```http
GET /kb/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hướng dẫn chung",
      "slug": "huong-dan-chung",
      "description": "Các hướng dẫn cơ bản",
      "parent_id": null,
      "article_count": 5,
      "sort_order": 1,
      "is_active": true
    }
  ]
}
```

### Create Category
```http
POST /kb/categories
```

**Body:**
```json
{
  "name": "Hướng dẫn chung",
  "description": "Các hướng dẫn cơ bản",
  "parent_id": null,
  "sort_order": 1,
  "is_active": true
}
```

### Update Category
```http
PUT /kb/categories/{id}
```

### Delete Category
```http
DELETE /kb/categories/{id}
```

### List Articles
```http
GET /kb/articles?category_id=1&status=published&page=1&per_page=20
```

**Statuses:** `draft`, `published`, `archived`

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "category_id": 1,
        "title": "Cách đăng ký tài khoản",
        "slug": "cach-dang-ky-tai-khoan",
        "excerpt": "Hướng dẫn chi tiết...",
        "view_count": 150,
        "helpful_count": 45,
        "not_helpful_count": 3,
        "status": "published",
        "created_at": "2025-10-10 10:00:00"
      }
    ],
    "total": 25
  }
}
```

### Get Article
```http
GET /kb/articles/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category": {...},
    "title": "Cách đăng ký tài khoản",
    "slug": "cach-dang-ky-tai-khoan",
    "content": "<h2>...</h2><p>...</p>",
    "excerpt": "Hướng dẫn chi tiết...",
    "tags": ["đăng ký", "tài khoản"],
    "view_count": 150,
    "helpful_count": 45,
    "not_helpful_count": 3,
    "status": "published",
    "related_articles": [...]
  }
}
```

### Create Article
```http
POST /kb/articles
```

**Body:**
```json
{
  "category_id": 1,
  "title": "Cách đăng ký tài khoản",
  "content": "<h2>...</h2><p>...</p>",
  "excerpt": "Hướng dẫn chi tiết...",
  "tags": ["đăng ký", "tài khoản"],
  "status": "published"
}
```

### Update Article
```http
PUT /kb/articles/{id}
```

### Delete Article
```http
DELETE /kb/articles/{id}
```

### Search Articles
```http
GET /kb/search?q=đăng+ký&category_id=1
```

### Popular Articles
```http
GET /kb/popular?limit=10
```

### Vote Article
```http
POST /kb/articles/{id}/vote
```

**Body:**
```json
{
  "helpful": true
}
```

### Track Article View
```http
POST /kb/articles/{id}/view
```

---

## 🔐 Authentication

Tất cả API endpoints yêu cầu authentication qua Laravel session hoặc API token.

**Headers:**
```http
X-CSRF-TOKEN: {csrf_token}
X-Requested-With: XMLHttpRequest
Content-Type: application/json
```

---

## 📝 Error Responses

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "url": ["The url format is invalid."]
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## 📊 Pagination

Tất cả list endpoints hỗ trợ pagination:

**Query Parameters:**
- `page` - Trang hiện tại (default: 1)
- `per_page` - Số items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "current_page": 1,
  "data": [...],
  "first_page_url": "...",
  "from": 1,
  "last_page": 5,
  "last_page_url": "...",
  "next_page_url": "...",
  "path": "...",
  "per_page": 20,
  "prev_page_url": null,
  "to": 20,
  "total": 100
}
```

---

## 🧪 Testing

**Test với cURL:**
```bash
# List webhooks
curl -X GET http://localhost:8000/aio/api/whmcs/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest"

# Create webhook
curl -X POST http://localhost:8000/aio/api/whmcs/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -d '{
    "name": "Test Webhook",
    "url": "https://example.com/webhook",
    "events": ["invoice_paid"]
  }'
```

**Test với Postman:**
1. Import collection từ file `postman_collection.json`
2. Set environment variable `base_url` = `http://localhost:8000`
3. Run requests

---

**Last Updated:** 11/11/2025  
**Version:** 1.0.0  
**API Version:** Phase 3
