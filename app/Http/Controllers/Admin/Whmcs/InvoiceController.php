<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\Invoice;
use App\Services\Whmcs\Contracts\BillingServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    public function __construct(
        protected BillingServiceInterface $billingService
    ) {}

    /**
     * Lấy danh sách hóa đơn
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['client', 'items']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        // Search by invoice number
        if ($request->has('search')) {
            $query->where('number', 'like', "%{$request->search}%");
        }

        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($invoices);
    }

    /**
     * Tạo hóa đơn mới
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.setup_fee' => 'nullable|numeric|min:0',
            'items.*.qty' => 'nullable|integer|min:1',
            'items.*.type' => 'nullable|string',
            'items.*.product_id' => 'nullable|exists:whmcs_products,id',
            'items.*.billing_cycle' => 'nullable|string',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'tax' => 'nullable|numeric|min:0',
        ]);

        try {
            // Transform items data để tính total
            $items = collect($validated['items'])->map(function ($item) {
                $qty = $item['qty'] ?? 1;
                $unitPrice = $item['unit_price'] ?? 0;
                $setupFee = $item['setup_fee'] ?? 0;
                $total = ($unitPrice * $qty) + $setupFee;

                return [
                    'description' => $item['description'],
                    'type' => $item['type'] ?? 'product',
                    'product_id' => $item['product_id'] ?? null,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'total' => $total,
                ];
            })->toArray();

            $invoice = $this->billingService->createInvoice(
                $validated['client_id'],
                $items,
                [
                    'due_date' => $validated['due_date'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'tax' => $validated['tax'] ?? 0,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully',
                'data' => $invoice->load(['client', 'items']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Chi tiết hóa đơn
     */
    public function show(int $id): JsonResponse
    {
        $invoice = Invoice::with(['client', 'items', 'transactions'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    /**
     * Ghi nhận thanh toán
     */
    public function recordPayment(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:bank_transfer,vnpay,momo,cash,credit',
            'transaction_id' => 'nullable|string',
            'gateway_response' => 'nullable|array',
        ]);

        try {
            $invoice = $this->billingService->recordPayment(
                $id,
                $validated['amount'],
                $validated['payment_method'],
                [
                    'transaction_id' => $validated['transaction_id'] ?? null,
                    'gateway_response' => $validated['gateway_response'] ?? null,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data' => $invoice->load(['transactions']),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Hủy hóa đơn
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        try {
            $invoice = $this->billingService->cancelInvoice($id, $validated['reason'] ?? null);

            return response()->json([
                'success' => true,
                'message' => 'Invoice cancelled successfully',
                'data' => $invoice,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Danh sách hóa đơn quá hạn
     */
    public function overdue(Request $request): JsonResponse
    {
        $daysOverdue = $request->input('days_overdue', null);
        
        $invoices = $this->billingService->getOverdueInvoices($daysOverdue);

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * Gửi nhắc nhở thanh toán
     */
    public function sendReminder(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:first,second,third,overdue',
        ]);

        try {
            $this->billingService->sendPaymentReminder($id, $validated['type']);

            return response()->json([
                'success' => true,
                'message' => 'Reminder sent successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Áp dụng credit vào hóa đơn
     */
    public function applyCredit(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0',
        ]);

        try {
            $invoice = $this->billingService->applyCreditToInvoice(
                $id,
                $validated['amount'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Credit applied successfully',
                'data' => $invoice,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Báo cáo doanh thu
     */
    public function revenue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'nullable|string|in:paid,unpaid,cancelled,refunded',
        ]);

        $revenue = $this->billingService->getRevenue(
            $validated['start_date'],
            $validated['end_date'],
            $validated['status'] ?? 'paid'
        );

        return response()->json([
            'success' => true,
            'data' => $revenue,
        ]);
    }
}
