<?php

namespace App\Http\Controllers\Client\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\Invoice;
use App\Models\Whmcs\Transaction;
use App\Services\Payment\VNPayService;
use App\Services\Payment\MoMoService;
use App\Mail\Whmcs\PaymentConfirmationEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private $vnpayService;
    private $momoService;

    public function __construct(VNPayService $vnpayService, MoMoService $momoService)
    {
        $this->vnpayService = $vnpayService;
        $this->momoService = $momoService;
    }

    /**
     * Create payment for invoice
     */
    public function createPayment(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:whmcs_invoices,id',
            'payment_method' => 'required|in:vnpay,momo,bank_transfer,credit',
            'bank_code' => 'nullable|string', // For VNPay
        ]);

        $invoice = Invoice::with('client')->findOrFail($validated['invoice_id']);

        // Check if already paid
        if ($invoice->status === 'paid') {
            return response()->json([
                'message' => 'Invoice already paid',
            ], 400);
        }

        $paymentMethod = $validated['payment_method'];

        try {
            switch ($paymentMethod) {
                case 'vnpay':
                    $paymentUrl = $this->vnpayService->createPaymentUrl([
                        'invoice_id' => $invoice->id,
                        'amount' => $invoice->total,
                        'description' => "Payment for invoice #{$invoice->invoice_number}",
                        'customer_ip' => $request->ip(),
                        'bank_code' => $validated['bank_code'] ?? null,
                    ]);

                    return response()->json([
                        'success' => true,
                        'payment_url' => $paymentUrl,
                    ]);

                case 'momo':
                    $paymentUrl = $this->momoService->createPaymentUrl([
                        'invoice_id' => $invoice->id,
                        'amount' => $invoice->total,
                        'description' => "Payment for invoice #{$invoice->invoice_number}",
                    ]);

                    return response()->json([
                        'success' => true,
                        'payment_url' => $paymentUrl,
                    ]);

                case 'credit':
                    return $this->payWithCredit($invoice);

                case 'bank_transfer':
                    return response()->json([
                        'success' => true,
                        'message' => 'Please transfer to our bank account',
                        'bank_info' => config('whmcs.bank_transfer'),
                    ]);

                default:
                    return response()->json([
                        'message' => 'Invalid payment method',
                    ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Payment Creation Error', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * VNPay IPN/Return callback
     */
    public function vnpayCallback(Request $request)
    {
        $result = $this->vnpayService->handleCallback($request->all());

        if ($result['success']) {
            $this->processSuccessfulPayment(
                $result['invoice_id'],
                $result['transaction_id'],
                $result['amount'],
                'vnpay',
                $result
            );

            return redirect('/client/invoices')->with('success', 'Payment successful!');
        }

        return redirect('/client/invoices')->with('error', $result['message']);
    }

    /**
     * MoMo IPN callback
     */
    public function momoCallback(Request $request)
    {
        $result = $this->momoService->handleCallback($request->all());

        if ($result['success']) {
            $this->processSuccessfulPayment(
                $result['invoice_id'],
                $result['transaction_id'],
                $result['amount'],
                'momo',
                $result
            );

            // MoMo IPN requires specific response
            return response()->json([
                'resultCode' => 0,
                'message' => 'Success',
            ]);
        }

        return response()->json([
            'resultCode' => -1,
            'message' => 'Failed',
        ]);
    }

    /**
     * Pay with account credit
     */
    private function payWithCredit(Invoice $invoice)
    {
        $client = $invoice->client;

        if ($client->credit_balance < $invoice->total) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient credit balance',
                'required' => $invoice->total,
                'available' => $client->credit_balance,
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Deduct credit
            $client->deductCredit($invoice->total);

            // Create transaction
            $transaction = Transaction::create([
                'client_id' => $client->id,
                'invoice_id' => $invoice->id,
                'transaction_id' => 'CREDIT_' . time(),
                'amount' => $invoice->total,
                'payment_method' => 'credit',
                'status' => 'completed',
            ]);

            // Mark invoice as paid
            $invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            DB::commit();

            // Send confirmation email
            Mail::to($client->email)->send(new PaymentConfirmationEmail($transaction));

            return response()->json([
                'success' => true,
                'message' => 'Payment successful using account credit',
                'remaining_credit' => $client->fresh()->credit_balance,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Credit Payment Error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Payment failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process successful payment from gateway
     */
    private function processSuccessfulPayment($invoiceId, $transactionId, $amount, $method, $data)
    {
        DB::beginTransaction();
        try {
            $invoice = Invoice::with('client')->findOrFail($invoiceId);

            // Create transaction record
            $transaction = Transaction::create([
                'client_id' => $invoice->client_id,
                'invoice_id' => $invoice->id,
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'payment_method' => $method,
                'status' => 'completed',
                'gateway_response' => $data,
            ]);

            // Mark invoice as paid
            $invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            // TODO: Trigger service activation if needed
            // event(new InvoicePaid($invoice));

            DB::commit();

            // Send confirmation email
            Mail::to($invoice->client->email)->send(new PaymentConfirmationEmail($transaction));

            Log::info('Payment Processed Successfully', [
                'invoice_id' => $invoiceId,
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'method' => $method,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment Processing Error', [
                'invoice_id' => $invoiceId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
