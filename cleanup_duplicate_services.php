<?php
/**
 * Script để clean up duplicate services trong bảng aitilen_invoice_service
 * 
 * Chạy script này 1 lần để xóa các dịch vụ duplicate
 * Sau đó có thể xóa file này
 * 
 * Cách chạy: php cleanup_duplicate_services.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Admin\AitilenInvoice;
use App\Models\Admin\AitilenInvoiceService;

echo "=== Bắt đầu clean up duplicate services ===\n\n";

// Lấy tất cả invoice
$invoices = AitilenInvoice::where('is_recycle_bin', '!=', 1)->get();

$totalCleaned = 0;
$totalInvoices = count($invoices);

foreach ($invoices as $index => $invoice) {
    echo "Processing invoice {$invoice->id} ({$invoice->code}) - ".($index + 1)."/{$totalInvoices}\n";
    
    // Lấy tất cả services của invoice này
    $services = AitilenInvoiceService::where('invoice_id', $invoice->id)->get();
    
    if ($services->count() > 0) {
        echo "  - Tìm thấy {$services->count()} services trong bảng aitilen_invoice_service\n";
        
        // Xóa tất cả services cũ
        AitilenInvoiceService::where('invoice_id', $invoice->id)->delete();
        echo "  - Đã xóa tất cả services cũ\n";
        
        // Tạo lại services từ column JSON 'services'
        if (!empty($invoice->services) && is_array($invoice->services)) {
            echo "  - Tạo lại ".count($invoice->services)." services từ JSON\n";
            
            foreach ($invoice->services as $serviceData) {
                $invoiceService = new AitilenInvoiceService();
                $invoiceService->invoice_id = $invoice->id;
                $invoiceService->service_id = $serviceData['aitilen_service_id'] ?? null;
                $invoiceService->price = $serviceData['price_default'] ?? 0;
                $invoiceService->per = $serviceData['per_default'] ?? '';
                $invoiceService->so_nguoi = $invoice->so_nguoi ?? 0;
                $invoiceService->total = $serviceData['price_total'] ?? 0;
                $invoiceService->save();
            }
            
            $totalCleaned++;
        }
    }
    
    echo "\n";
}

echo "=== Hoàn thành ===\n";
echo "Tổng số invoice đã xử lý: {$totalCleaned}/{$totalInvoices}\n";
echo "\nLưu ý: Bạn nên kiểm tra lại dữ liệu trước khi xóa file này!\n";
