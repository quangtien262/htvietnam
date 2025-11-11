<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsTransaction;
use App\Models\Whmcs\WhmcsPaymentGateway;
use App\Services\Admin\WhmcsPaymentService;
use Illuminate\Http\Request;

class WhmcsPaymentController extends Controller
{
    protected $service;

    public function __construct(WhmcsPaymentService $service)
    {
        $this->service = $service;
    }

    public function apiTransactions(Request $request)
    {
        try {
            $perPage = $request->input('perPage', 20);
            $search = $request->input('search', '');
            $gatewayId = $request->input('gateway_id', '');
            $startDate = $request->input('start_date', '');
            $endDate = $request->input('end_date', '');

            $query = WhmcsTransaction::with(['client', 'invoice', 'gateway', 'currency']);

            if ($search) {
                $query->where('transaction_id', 'like', "%{$search}%");
            }

            if ($gatewayId) {
                $query->where('gateway_id', $gatewayId);
            }

            if ($startDate && $endDate) {
                $query->whereBetween('date', [$startDate, $endDate]);
            }

            $transactions = $query->orderBy('date', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiGateways()
    {
        try {
            $gateways = WhmcsPaymentGateway::where('enabled', true)
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $gateways
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiAddPayment(Request $request)
    {
        try {
            $validated = $request->validate([
                'invoice_id' => 'required|exists:whmcs_invoices,id',
                'transaction_id' => 'required|string',
                'gateway_id' => 'required|exists:whmcs_payment_gateways,id',
                'amount' => 'required|numeric|min:0',
                'currency_id' => 'required|exists:whmcs_currencies,id',
                'date' => 'required|date',
                'description' => 'nullable|string'
            ]);

            $transaction = $this->service->addPayment($validated);

            return response()->json([
                'success' => true,
                'message' => 'Thêm thanh toán thành công',
                'data' => $transaction
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
