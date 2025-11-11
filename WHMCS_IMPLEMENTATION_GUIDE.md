# WHMCS Implementation Guide

## ✅ ĐÃ HOÀN THÀNH

### 1. Database Migrations (9 files)
- ✅ 2025_11_09_000001_create_whmcs_clients_table.php
- ✅ 2025_11_09_000002_create_whmcs_products_table.php  
- ✅ 2025_11_09_000003_create_whmcs_orders_table.php
- ✅ 2025_11_09_000004_create_whmcs_services_table.php
- ✅ 2025_11_09_000005_create_whmcs_invoices_table.php
- ✅ 2025_11_09_000006_create_whmcs_domains_table.php
- ✅ 2025_11_09_000007_create_whmcs_tickets_table.php
- ✅ 2025_11_09_000008_create_whmcs_settings_table.php
- ✅ 2025_11_09_000009_create_whmcs_additional_tables.php

### 2. Models (30 files - HOÀN THÀNH 100%)
✅ Tất cả models đã được tạo trong `app/Models/Whmcs/`

## 📝 CẦN IMPLEMENT TIẾP

### 3. Controllers
Tạo trong `app/Http/Controllers/Admin/Whmcs/`:

#### WhmcsClientController.php
```php
<?php
namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsClient;
use Illuminate\Http\Request;

class WhmcsClientController extends Controller
{
    public function apiList(Request $request)
    {
        $query = WhmcsClient::with(['assignedTo']);
        
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('email', 'like', "%{$request->search}%")
                  ->orWhere('company_name', 'like', "%{$request->search}%")
                  ->orWhere('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%");
            });
        }
        
        if ($request->status) {
            $query->where('status', $request->status);
        }
        
        $clients = $query->orderBy('created_at', 'desc')
                        ->paginate($request->per_page ?? 20);
        
        return response()->json($clients);
    }
    
    public function apiDetail($id)
    {
        $client = WhmcsClient::with([
            'services',
            'invoices',
            'domains',
            'tickets',
            'orders'
        ])->findOrFail($id);
        
        return response()->json($client);
    }
    
    public function apiAdd(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email|unique:whmcs_clients',
            'password' => 'required|min:6',
            'phone' => 'nullable',
            'company_name' => 'nullable',
        ]);
        
        $validated['password'] = bcrypt($validated['password']);
        $validated['code'] = 'CL' . time();
        $validated['created_by'] = auth()->id();
        
        $client = WhmcsClient::create($validated);
        
        return response()->json(['success' => true, 'client' => $client]);
    }
    
    public function apiUpdate(Request $request, $id)
    {
        $client = WhmcsClient::findOrFail($id);
        
        $validated = $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email|unique:whmcs_clients,email,'.$id,
        ]);
        
        $client->update($validated);
        
        return response()->json(['success' => true, 'client' => $client]);
    }
    
    public function apiDelete($id)
    {
        $client = WhmcsClient::findOrFail($id);
        $client->delete();
        
        return response()->json(['success' => true]);
    }
    
    public function apiStatistics()
    {
        $stats = [
            'total' => WhmcsClient::count(),
            'active' => WhmcsClient::where('status', 'active')->count(),
            'inactive' => WhmcsClient::where('status', 'inactive')->count(),
            'total_balance' => WhmcsClient::sum('balance'),
        ];
        
        return response()->json($stats);
    }
}
```

Tương tự tạo các controllers khác:
- `WhmcsProductController.php`
- `WhmcsOrderController.php`
- `WhmcsServiceController.php`
- `WhmcsInvoiceController.php`
- `WhmcsDomainController.php`
- `WhmcsTicketController.php`
- `WhmcsPaymentController.php`
- `WhmcsReportController.php`
- `WhmcsSettingController.php`

### 4. API Routes (aio_route.php)

Thêm vào file `routes/aio_route.php`:

```php
// WHMCS Routes
Route::group(['prefix' => 'whmcs'], function () {
    
    // Clients
    Route::post('clients/list', [WhmcsClientController::class, 'apiList']);
    Route::post('clients/detail/{id}', [WhmcsClientController::class, 'apiDetail']);
    Route::post('clients/add', [WhmcsClientController::class, 'apiAdd']);
    Route::post('clients/update/{id}', [WhmcsClientController::class, 'apiUpdate']);
    Route::post('clients/delete/{id}', [WhmcsClientController::class, 'apiDelete']);
    Route::post('clients/statistics', [WhmcsClientController::class, 'apiStatistics']);
    
    // Products
    Route::post('products/list', [WhmcsProductController::class, 'apiList']);
    Route::post('products/detail/{id}', [WhmcsProductController::class, 'apiDetail']);
    Route::post('products/add', [WhmcsProductController::class, 'apiAdd']);
    Route::post('products/update/{id}', [WhmcsProductController::class, 'apiUpdate']);
    Route::post('products/delete/{id}', [WhmcsProductController::class, 'apiDelete']);
    Route::post('products/groups', [WhmcsProductController::class, 'apiGroups']);
    
    // Orders
    Route::post('orders/list', [WhmcsOrderController::class, 'apiList']);
    Route::post('orders/detail/{id}', [WhmcsOrderController::class, 'apiDetail']);
    Route::post('orders/add', [WhmcsOrderController::class, 'apiAdd']);
    Route::post('orders/update-status/{id}', [WhmcsOrderController::class, 'apiUpdateStatus']);
    Route::post('orders/delete/{id}', [WhmcsOrderController::class, 'apiDelete']);
    
    // Services
    Route::post('services/list', [WhmcsServiceController::class, 'apiList']);
    Route::post('services/detail/{id}', [WhmcsServiceController::class, 'apiDetail']);
    Route::post('services/suspend/{id}', [WhmcsServiceController::class, 'apiSuspend']);
    Route::post('services/unsuspend/{id}', [WhmcsServiceController::class, 'apiUnsuspend']);
    Route::post('services/terminate/{id}', [WhmcsServiceController::class, 'apiTerminate']);
    Route::post('services/statistics', [WhmcsServiceController::class, 'apiStatistics']);
    
    // Invoices
    Route::post('invoices/list', [WhmcsInvoiceController::class, 'apiList']);
    Route::post('invoices/detail/{id}', [WhmcsInvoiceController::class, 'apiDetail']);
    Route::post('invoices/add', [WhmcsInvoiceController::class, 'apiAdd']);
    Route::post('invoices/update/{id}', [WhmcsInvoiceController::class, 'apiUpdate']);
    Route::post('invoices/mark-paid/{id}', [WhmcsInvoiceController::class, 'apiMarkPaid']);
    Route::post('invoices/delete/{id}', [WhmcsInvoiceController::class, 'apiDelete']);
    Route::post('invoices/statistics', [WhmcsInvoiceController::class, 'apiStatistics']);
    
    // Domains
    Route::post('domains/list', [WhmcsDomainController::class, 'apiList']);
    Route::post('domains/detail/{id}', [WhmcsDomainController::class, 'apiDetail']);
    Route::post('domains/add', [WhmcsDomainController::class, 'apiAdd']);
    Route::post('domains/update/{id}', [WhmcsDomainController::class, 'apiUpdate']);
    Route::post('domains/renew/{id}', [WhmcsDomainController::class, 'apiRenew']);
    Route::post('domains/tlds', [WhmcsDomainController::class, 'apiTlds']);
    
    // Tickets
    Route::post('tickets/list', [WhmcsTicketController::class, 'apiList']);
    Route::post('tickets/detail/{id}', [WhmcsTicketController::class, 'apiDetail']);
    Route::post('tickets/add', [WhmcsTicketController::class, 'apiAdd']);
    Route::post('tickets/reply/{id}', [WhmcsTicketController::class, 'apiReply']);
    Route::post('tickets/close/{id}', [WhmcsTicketController::class, 'apiClose']);
    Route::post('tickets/departments', [WhmcsTicketController::class, 'apiDepartments']);
    
    // Payments
    Route::post('payments/transactions', [WhmcsPaymentController::class, 'apiTransactions']);
    Route::post('payments/gateways', [WhmcsPaymentController::class, 'apiGateways']);
    Route::post('payments/add-payment', [WhmcsPaymentController::class, 'apiAddPayment']);
    
    // Reports
    Route::post('reports/dashboard', [WhmcsReportController::class, 'apiDashboard']);
    Route::post('reports/revenue', [WhmcsReportController::class, 'apiRevenue']);
    Route::post('reports/clients-growth', [WhmcsReportController::class, 'apiClientsGrowth']);
    Route::post('reports/services-statistics', [WhmcsReportController::class, 'apiServicesStatistics']);
    
    // Settings
    Route::post('settings/currencies', [WhmcsSettingController::class, 'apiCurrencies']);
    Route::post('settings/tax-rules', [WhmcsSettingController::class, 'apiTaxRules']);
    Route::post('settings/promo-codes', [WhmcsSettingController::class, 'apiPromoCodes']);
});
```

### 5. API Endpoints (common/api.tsx)

Thêm vào file `resources/js/common/api.tsx`:

```typescript
// WHMCS APIs
whmcs_clientsList: `${BASE_API_URL}whmcs/clients/list`,
whmcs_clientsDetail: (id: number) => `${BASE_API_URL}whmcs/clients/detail/${id}`,
whmcs_clientsAdd: `${BASE_API_URL}whmcs/clients/add`,
whmcs_clientsUpdate: (id: number) => `${BASE_API_URL}whmcs/clients/update/${id}`,
whmcs_clientsDelete: (id: number) => `${BASE_API_URL}whmcs/clients/delete/${id}`,
whmcs_clientsStatistics: `${BASE_API_URL}whmcs/clients/statistics`,

whmcs_productsList: `${BASE_API_URL}whmcs/products/list`,
whmcs_productsDetail: (id: number) => `${BASE_API_URL}whmcs/products/detail/${id}`,
whmcs_productsAdd: `${BASE_API_URL}whmcs/products/add`,
whmcs_productsUpdate: (id: number) => `${BASE_API_URL}whmcs/products/update/${id}`,
whmcs_productsDelete: (id: number) => `${BASE_API_URL}whmcs/products/delete/${id}`,
whmcs_productsGroups: `${BASE_API_URL}whmcs/products/groups`,

whmcs_ordersList: `${BASE_API_URL}whmcs/orders/list`,
whmcs_ordersDetail: (id: number) => `${BASE_API_URL}whmcs/orders/detail/${id}`,
whmcs_ordersAdd: `${BASE_API_URL}whmcs/orders/add`,
whmcs_ordersUpdateStatus: (id: number) => `${BASE_API_URL}whmcs/orders/update-status/${id}`,
whmcs_ordersDelete: (id: number) => `${BASE_API_URL}whmcs/orders/delete/${id}`,

whmcs_servicesList: `${BASE_API_URL}whmcs/services/list`,
whmcs_servicesDetail: (id: number) => `${BASE_API_URL}whmcs/services/detail/${id}`,
whmcs_servicesSuspend: (id: number) => `${BASE_API_URL}whmcs/services/suspend/${id}`,
whmcs_servicesUnsuspend: (id: number) => `${BASE_API_URL}whmcs/services/unsuspend/${id}`,
whmcs_servicesTerminate: (id: number) => `${BASE_API_URL}whmcs/services/terminate/${id}`,
whmcs_servicesStatistics: `${BASE_API_URL}whmcs/services/statistics`,

whmcs_invoicesList: `${BASE_API_URL}whmcs/invoices/list`,
whmcs_invoicesDetail: (id: number) => `${BASE_API_URL}whmcs/invoices/detail/${id}`,
whmcs_invoicesAdd: `${BASE_API_URL}whmcs/invoices/add`,
whmcs_invoicesUpdate: (id: number) => `${BASE_API_URL}whmcs/invoices/update/${id}`,
whmcs_invoicesMarkPaid: (id: number) => `${BASE_API_URL}whmcs/invoices/mark-paid/${id}`,
whmcs_invoicesDelete: (id: number) => `${BASE_API_URL}whmcs/invoices/delete/${id}`,
whmcs_invoicesStatistics: `${BASE_API_URL}whmcs/invoices/statistics`,

whmcs_domainsList: `${BASE_API_URL}whmcs/domains/list`,
whmcs_domainsDetail: (id: number) => `${BASE_API_URL}whmcs/domains/detail/${id}`,
whmcs_domainsAdd: `${BASE_API_URL}whmcs/domains/add`,
whmcs_domainsUpdate: (id: number) => `${BASE_API_URL}whmcs/domains/update/${id}`,
whmcs_domainsRenew: (id: number) => `${BASE_API_URL}whmcs/domains/renew/${id}`,
whmcs_domainsTlds: `${BASE_API_URL}whmcs/domains/tlds`,

whmcs_ticketsList: `${BASE_API_URL}whmcs/tickets/list`,
whmcs_ticketsDetail: (id: number) => `${BASE_API_URL}whmcs/tickets/detail/${id}`,
whmcs_ticketsAdd: `${BASE_API_URL}whmcs/tickets/add`,
whmcs_ticketsReply: (id: number) => `${BASE_API_URL}whmcs/tickets/reply/${id}`,
whmcs_ticketsClose: (id: number) => `${BASE_API_URL}whmcs/tickets/close/${id}`,
whmcs_ticketsDepartments: `${BASE_API_URL}whmcs/tickets/departments`,

whmcs_paymentsTransactions: `${BASE_API_URL}whmcs/payments/transactions`,
whmcs_paymentsGateways: `${BASE_API_URL}whmcs/payments/gateways`,
whmcs_paymentsAddPayment: `${BASE_API_URL}whmcs/payments/add-payment`,

whmcs_reportsDashboard: `${BASE_API_URL}whmcs/reports/dashboard`,
whmcs_reportsRevenue: `${BASE_API_URL}whmcs/reports/revenue`,
whmcs_reportsClientsGrowth: `${BASE_API_URL}whmcs/reports/clients-growth`,
whmcs_reportsServicesStatistics: `${BASE_API_URL}whmcs/reports/services-statistics`,

whmcs_settingsCurrencies: `${BASE_API_URL}whmcs/settings/currencies`,
whmcs_settingsTaxRules: `${BASE_API_URL}whmcs/settings/tax-rules`,
whmcs_settingsPromoCodes: `${BASE_API_URL}whmcs/settings/promo-codes`,
```

### 6. Routes (common/route.tsx)

Thêm vào file `resources/js/common/route.tsx`:

```typescript
// WHMCS Routes
whmcs_dashboard: `${baseRoute}whmcs/dashboard`,
whmcs_clients: `${baseRoute}whmcs/clients`,
whmcs_products: `${baseRoute}whmcs/products`,
whmcs_orders: `${baseRoute}whmcs/orders`,
whmcs_services: `${baseRoute}whmcs/services`,
whmcs_invoices: `${baseRoute}whmcs/invoices`,
whmcs_domains: `${baseRoute}whmcs/domains`,
whmcs_tickets: `${baseRoute}whmcs/tickets`,
whmcs_reports: `${baseRoute}whmcs/reports`,
whmcs_settings: `${baseRoute}whmcs/settings`,
```

### 7. Menu (common/menu.jsx)

```jsx
// WHMCS
whmcs: [
    {
        label: <Link to={`${ROUTE.whmcs_dashboard}?p=whmcs`}>Dashboard</Link>,
        icon: <DashboardOutlined />,
        key: (key++).toString(),
    },
    {
        label: <Link to={`${ROUTE.whmcs_clients}?p=whmcs`}>Khách hàng</Link>,
        icon: <UserOutlined />,
        key: (key++).toString(),
    },
    {
        label: <span>Sản phẩm & Dịch vụ</span>,
        key: (key++).toString(),
        icon: <ShopOutlined />,
        children: [
            {
                label: <Link to={`${ROUTE.whmcs_products}?p=whmcs`}>Sản phẩm</Link>,
                key: (key++).toString(),
                icon: <ShopOutlined />,
            },
            {
                label: <Link to={`${ROUTE.whmcs_services}?p=whmcs`}>Dịch vụ đang chạy</Link>,
                key: (key++).toString(),
                icon: <TeamOutlined />,
            },
        ],
    },
    {
        label: <span>Đơn hàng & Hóa đơn</span>,
        key: (key++).toString(),
        icon: <FileDoneOutlined />,
        children: [
            {
                label: <Link to={`${ROUTE.whmcs_orders}?p=whmcs`}>Đơn hàng</Link>,
                key: (key++).toString(),
                icon: <FileDoneOutlined />,
            },
            {
                label: <Link to={`${ROUTE.whmcs_invoices}?p=whmcs`}>Hóa đơn</Link>,
                key: (key++).toString(),
                icon: <CopyOutlined />,
            },
        ],
    },
    {
        label: <Link to={`${ROUTE.whmcs_domains}?p=whmcs`}>Tên miền</Link>,
        icon: <GlobalOutlined />,
        key: (key++).toString(),
    },
    {
        label: <Link to={`${ROUTE.whmcs_tickets}?p=whmcs`}>Hỗ trợ</Link>,
        icon: <MessageOutlined />,
        key: (key++).toString(),
    },
    {
        label: <Link to={`${ROUTE.whmcs_reports}?p=whmcs`}>Báo cáo</Link>,
        icon: <BarChartOutlined />,
        key: (key++).toString(),
    },
    {
        label: <Link to={`${ROUTE.whmcs_settings}?p=whmcs`}>Cài đặt</Link>,
        icon: <FileTextOutlined />,
        key: (key++).toString(),
    },
],
```

### 8. Frontend Pages

Tạo trong `resources/js/pages/whmcs/`:

Các file cần tạo:
- `WhmcsDashboard.tsx` - Dashboard tổng quan
- `ClientList.tsx` - Danh sách khách hàng
- `ProductList.tsx` - Danh sách sản phẩm
- `OrderList.tsx` - Danh sách đơn hàng
- `ServiceList.tsx` - Danh sách dịch vụ
- `InvoiceList.tsx` - Danh sách hóa đơn
- `DomainList.tsx` - Danh sách tên miền
- `TicketList.tsx` - Danh sách ticket
- `ReportPage.tsx` - Báo cáo
- `SettingPage.tsx` - Cài đặt

## 🚀 HƯỚNG DẪN CHẠY

1. **Run migrations:**
```bash
php artisan migrate
```

2. **Tạo controllers còn thiếu** theo mẫu `WhmcsClientController` ở trên

3. **Thêm routes** vào `aio_route.php`

4. **Cập nhật API config** trong `common/api.tsx`

5. **Cập nhật routes** trong `common/route.tsx`

6. **Cập nhật menu** trong `common/menu.jsx`

7. **Tạo các trang React** trong `resources/js/pages/whmcs/`

8. **Build frontend:**
```bash
npm run build
```

## 📚 LƯU Ý

- Tất cả models đã có relationships đầy đủ
- Cần tạo thêm Services Layer cho business logic phức tạp
- Cần implement auto-billing, auto-provisioning sau
- Cần tích hợp payment gateways (VNPay, MoMo, etc)
- Cần tạo email templates cho notifications

