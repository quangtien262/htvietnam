<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsInvoice;
use App\Services\Admin\WhmcsInvoiceService;
use Illuminate\Http\Request;

class WhmcsInvoiceController extends Controller
{
    protected $service;

    public function __construct(WhmcsInvoiceService $service)
    {
        $this->service = $service;
    }

    public function apiList(Request $request)
    {
        try {
            $perPage = $request->input('perPage', 20);
            $search = $request->input('search', '');
            $status = $request->input('status', '');
            $clientId = $request->input('client_id', '');

            $query = WhmcsInvoice::with(['client', 'currency', 'items']);

            if ($search) {
                $query->where('invoice_number', 'like', "%{$search}%");
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($clientId) {
                $query->where('client_id', $clientId);
            }

            $invoices = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDetail($id)
    {
        try {
            $invoice = WhmcsInvoice::with([
                'client',
                'currency',
                'items',
                'payments',
                'transactions'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $invoice
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function apiAdd(Request $request)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'required|exists:whmcs_clients,id',
                'currency_id' => 'required|exists:whmcs_currencies,id',
                'date' => 'required|date',
                'due_date' => 'required|date',
                'items' => 'required|array',
                'items.*.description' => 'required|string',
                'items.*.amount' => 'required|numeric|min:0',
                'items.*.tax_rate' => 'nullable|numeric|min:0',
                'payment_method' => 'nullable|string',
                'notes' => 'nullable|string'
            ]);

            $invoice = $this->service->createInvoice($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tạo hóa đơn thành công',
                'data' => $invoice
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiUpdate(Request $request, $id)
    {
        try {
            $invoice = WhmcsInvoice::findOrFail($id);

            if ($invoice->status == 'Paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể sửa hóa đơn đã thanh toán'
                ], 400);
            }

            $validated = $request->validate([
                'date' => 'date',
                'due_date' => 'date',
                'payment_method' => 'nullable|string',
                'notes' => 'nullable|string'
            ]);

            $invoice->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật hóa đơn thành công',
                'data' => $invoice
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiMarkPaid(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'payment_date' => 'required|date',
                'payment_method' => 'required|string',
                'transaction_id' => 'nullable|string',
                'amount' => 'required|numeric|min:0'
            ]);

            $invoice = WhmcsInvoice::findOrFail($id);
            $result = $this->service->markInvoiceAsPaid($invoice, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Đánh dấu hóa đơn đã thanh toán thành công',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDelete($id)
    {
        try {
            $invoice = WhmcsInvoice::findOrFail($id);

            if ($invoice->status == 'Paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa hóa đơn đã thanh toán'
                ], 400);
            }

            $invoice->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa hóa đơn thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiStatistics()
    {
        try {
            $stats = [
                'total_invoices' => WhmcsInvoice::count(),
                'unpaid_invoices' => WhmcsInvoice::where('status', 'Unpaid')->count(),
                'paid_invoices' => WhmcsInvoice::where('status', 'Paid')->count(),
                'overdue_invoices' => WhmcsInvoice::where('status', 'Unpaid')
                    ->where('due_date', '<', now())
                    ->count(),
                'total_unpaid_amount' => WhmcsInvoice::where('status', 'Unpaid')->sum('total'),
                'total_paid_amount' => WhmcsInvoice::where('status', 'Paid')->sum('total'),
                'revenue_this_month' => WhmcsInvoice::where('status', 'Paid')
                    ->whereMonth('date_paid', now()->month)
                    ->whereYear('date_paid', now()->year)
                    ->sum('total')
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
